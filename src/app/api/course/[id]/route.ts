import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Course } from "@/lib/models/Course";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> } // 👈 yahan change
) {
  try {
    const { id } = await context.params; // 👈 await lagao

    await connectDB();

    const course = await Course.findOne({ uniqueId: id }).lean();

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: course });
  } catch (error: any) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}