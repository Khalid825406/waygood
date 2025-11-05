import { NextResponse } from "next/server";
import Redis from "ioredis";
import { Client } from "@elastic/elasticsearch";

import type { SearchRequest } from "@/lib/types";

const redis = new Redis(process.env.REDIS_URL!);

const esClient = new Client({
  node: process.env.ELASTIC_URL!,
});

export async function POST(req: Request) {
  try {
    const { keyword, university, level, tuitionRange } = await req.json();

    const cacheKey =
      `courses:${keyword ?? ""}-${university ?? ""}-${level ?? ""}-` +
      `${Array.isArray(tuitionRange) ? tuitionRange.join("-") : ""}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json({ fromCache: true, data: JSON.parse(cached) });
    }

    const must: any[] = [];
    const filter: any[] = [];

    if (keyword) {
      must.push({
        multi_match: {
          query: keyword,
          fields: [
            "name",
            "overview",
            "specialization",
            "universityName",
            "discipline",
            "department",
            "keywords",
          ],
          fuzziness: "AUTO",
        },
      });
    }

    if (university && university !== "all") {
      filter.push({ term: { "universityCode.keyword": university } });
    }

    if (level && level !== "all") {
      filter.push({ term: { "level.keyword": level } });
    }

    if (Array.isArray(tuitionRange) && tuitionRange.length === 2) {
      filter.push({
        range: {
          "tuitionFees.amount": {
            gte: tuitionRange[0],
            lte: tuitionRange[1],
          },
        },
      });
    }

    // ✅ FINAL, CORRECT, STRICT ELASTICSEARCH QUERY
    const params: SearchRequest = {
      index: "courses",
      size: 100,
      query: {
        bool: { must, filter },
      },
    };

    const esResult = await esClient.search(params);

    const data = esResult.hits.hits.map((h: any) => h._source);

    await redis.set(cacheKey, JSON.stringify(data), "EX", 3600);

    return NextResponse.json({ fromCache: false, data });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}