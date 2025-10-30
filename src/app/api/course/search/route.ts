import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { connectDB } from '@/lib/db';
import { Course } from '@/lib/models/Course';

const CACHE_TTL = 60 * 10; // 10 minutes

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('keyword') || '';
    const university = searchParams.get('university') || 'all';
    const level = searchParams.get('level') || 'all';
    const maxTuition = Number(searchParams.get('maxTuition') || 50000);

    const cacheKey = `courses:${keyword}:${university}:${level}:${maxTuition}`;

    // ✅ 1. Check Redis Cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log('📦 Cache HIT:', cacheKey);
      return NextResponse.json(JSON.parse(cached));
    }

    console.log('💾 Cache MISS:', cacheKey);

    // ✅ 2. Build Query
    const query: any = { 'tuitionFees.amount': { $lte: maxTuition } };
    if (keyword) query.$text = { $search: keyword };
    if (university !== 'all') query.universityName = university;
    if (level !== 'all') query.level = level;

    // ✅ 3. Fetch from MongoDB
    const courses = await Course.find(query).lean().limit(50);

    // ✅ 4. Save to Redis
    await redis.set(cacheKey, JSON.stringify(courses), 'EX', CACHE_TTL);

    return NextResponse.json(courses);
  } catch (err) {
    console.error('❌ Server Error:', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}