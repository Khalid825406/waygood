"use client";

import { useEffect, useState } from "react";
import CourseCard from "@/components/course-card";

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/course/upload");
        const result = await res.json();

        console.log("API Response:", result);

        if (result.success && Array.isArray(result.data)) {
          setCourses(result.data);
        } else {
          setError("Invalid data format from API");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Server se data fetch nahi ho paya");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <p className="text-center">Loading courses...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-primary">Available Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>
    </div>
  );
}
