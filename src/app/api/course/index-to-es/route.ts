import { NextResponse } from "next/server";
import { Client } from "@elastic/elasticsearch";
import {Course} from "@/lib/models/Course";
import { connectDB } from "@/lib/db";

const esClient = new Client({
  node: process.env.ELASTIC_URL!,
});

export async function GET() {
  try {
    await connectDB();

    // MongoDB se saare courses laao
    const courses = await Course.find();

    if (!courses.length) {
      return NextResponse.json({ message: "No courses found in MongoDB" });
    }

    const bulkOps: any[] = [];

    courses.forEach((course: any) => {
      bulkOps.push({
        index: {
          _index: "courses",
          _id: course._id.toString(),
        },
      });

      bulkOps.push({
        uniqueId: course.uniqueId,
        name: course.name,
        overview: course.overview,
        specialization: course.specialization ?? "",
        universityCode: course.universityCode,
        universityName: course.universityName,
        department: course.department,
        discipline: course.discipline,
        keywords: course.keywords ?? [],
        level: course.level,
        tuitionFees: course.tuitionFees,
      });
    });

    const result = await esClient.bulk({ refresh: true, operations: bulkOps });

    return NextResponse.json({
      message: "All courses indexed into Elasticsearch",
      items: courses.length,
      esResult: result,
    });
  } catch (error) {
    console.error("Indexing Error:", error);
    return NextResponse.json({ error: "Indexing failed" }, { status: 500 });
  }
}
