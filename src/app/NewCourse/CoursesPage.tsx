"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import CourseCard from "@/components/course-card";
import type { CourseType } from "@/components/course-card";

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCourses = async () => {
    try {
      const res = await axios.get("/api/course/course-get");

      const formatted = res.data.data.map((item: any) => ({
        uniqueId: item.uniqueId,

        courseName: item.name,
        overviewDescription: item.overview,
        universityName: item.universityName,

        courseLevel: item.level,
        durationMonths: item.durationMonths,
        languageOfInstruction: item.language,

        firstYearTuitionFee:
          item.tuitionFees?.firstYear ||
          item.tuitionFees?.annual ||
          0,

        tuitionFeeCurrency: item.tuitionFees?.currency || "USD",

        internationalApplicationDeadline:
          item.deadlines?.international ||
          item.deadlines?.main ||
          "",
      }));

      setCourses(formatted);
    } catch (err) {
      console.log("API Error:", err);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) return <p className="text-center py-10 text-lg">Loading...</p>;
  if (error) return <p className="text-center py-10 text-red-500 text-lg">{error}</p>;

  return (
    <div className="container mx-auto py-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {courses.map((c) => (
        <CourseCard key={c.uniqueId} course={c} />
      ))}
    </div>
  );
}
