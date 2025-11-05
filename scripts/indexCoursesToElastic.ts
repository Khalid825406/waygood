import mongoose from "mongoose";
import { Client } from "@elastic/elasticsearch";
import { Course } from "@/lib/models/Course"; 

const client = new Client({
  node: process.env.ELASTIC_URL as string,
});

export const indexCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL as string);

    const courses = await Course.find({});
    console.log(`Total Courses Found: ${courses.length}`);

    for (const course of courses) {
      await client.index({
        index: "courses",
        id: course._id.toString(),
        document: {
          name: course.name,
          description: course.description,
          fieldsOfStudy: course.fieldsOfStudy,
          instructor: course.instructor,
          category: course.category,
          universityCode: course.universityCode,
          level: course.level,
          tuitionFees: course.tuitionFees,
        },
      });
    }

    console.log("✅ All courses indexed successfully!");
  } catch (error) {
    console.error("❌ Indexing Error:", error);
  } finally {
    mongoose.disconnect();
  }
};

indexCourses();