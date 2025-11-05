import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Course } from "@/lib/models/Course";

export async function GET() {
  try {
    await connectDB();
    const courses = await Course.find().lean();
    return NextResponse.json({ success: true, data: courses });
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch courses" }, { status: 500 });
  }
}