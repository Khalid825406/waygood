"use client";

import { useEffect, useMemo, useState } from "react";
import CourseCard from "@/components/course-card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Compass, SlidersHorizontal } from "lucide-react";
import { universities } from "@/lib/data/universities";
import type { CourseType } from "@/components/course-card";

export default function Home() {
  const [allCourses, setAllCourses] = useState<CourseType[]>([]);
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("all");
  const [courseLevel, setCourseLevel] = useState("all");
  const [tuitionRange, setTuitionRange] = useState<[number, number]>([0, 50000]);

  // ✅ Convert DB → UI shape
  const mapCourse = (item: any): CourseType => ({
    uniqueId: item.uniqueId,
    courseName: item.name,
    overviewDescription: item.overview || "",
    universityName: item.universityName,
    courseLevel: item.level,
    durationMonths: item.durationMonths,
    languageOfInstruction: item.language,
    firstYearTuitionFee:
      item.tuitionFees?.firstYear ??
      item.tuitionFees?.annual ??
      0,
    tuitionFeeCurrency: item.tuitionFees?.currency || "USD",
    internationalApplicationDeadline:
      item.deadlines?.international || item.deadlines?.main || "",
  });

  // ✅ STEP 1 — Load all courses one time
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);

      try {
        const res = await fetch("/api/course/course-get", { cache: "no-store" });
        const json = await res.json();

        const raw = json.data?.data || json.data || [];
        const mapped = raw.map(mapCourse);

        setAllCourses(mapped);
        setCourses(mapped);
      } catch (err) {
        console.error("LOAD ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  // ✅ STEP 2 — Combine UI filters + Search API (smart system)
  const applySearchSmart = async () => {
    const keyword = searchTerm.trim().toLowerCase();

    // ✅ No filters applied → show all instantly
    if (!keyword && selectedUniversity === "all" && courseLevel === "all" && tuitionRange[1] === 50000) {
      setCourses(allCourses);
      return;
    }

    try {
      const uniName =
        selectedUniversity === "all"
          ? ""
          : universities.find((u) => String(u.uniqueCode) === selectedUniversity)?.universityName || "";

      // ✅ HIT BACKEND SEARCH API
      const res = await fetch("/api/course/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword,
          university: uniName,
          level: courseLevel === "all" ? "" : courseLevel,
          maxTuition: tuitionRange[1],
        }),
      });

      const json = await res.json();
      const raw = json.data || [];
      const apiResults = raw.map(mapCourse);

      // ✅ If backend gives results → use them
      if (apiResults.length > 0) {
        setCourses(apiResults);
        return;
      }

      // ✅ Otherwise → fallback to client filtering
      const filtered = allCourses.filter((c) => {
        const m1 = !keyword || c.courseName.toLowerCase().includes(keyword) ||
          c.universityName.toLowerCase().includes(keyword) ||
          c.overviewDescription.toLowerCase().includes(keyword);

        const m2 = selectedUniversity === "all" || c.universityName === uniName;

        const m3 = courseLevel === "all" || c.courseLevel === courseLevel;

        const matchesTuition = (c.firstYearTuitionFee ?? 0) <= tuitionRange[1];

        return m1 && m2 && m3 && matchesTuition;
      });

      setCourses(filtered);

    } catch (err) {
      console.error("SEARCH ERROR:", err);

      // ✅ Absolute fallback
      setCourses(allCourses);
    }
  };

  // ✅ Debounce: smooth searching
  useEffect(() => {
    const t = setTimeout(applySearchSmart, 300);
    return () => clearTimeout(t);
  }, [searchTerm, selectedUniversity, courseLevel, tuitionRange, allCourses]);

  const universityOptions = useMemo(
    () =>
      universities.map((u) => ({
        value: String(u.uniqueCode),
        label: u.universityName,
      })),
    []
  );

  const SkeletonCard = () => (
    <div className="animate-pulse bg-muted/60 rounded-xl h-60 w-full border" />
  );

  return (
    <div className="bg-background text-foreground">

      {/* ✅ HERO */}
      <section className="text-center py-20 px-4 bg-card border-b">
        <h1 className="text-5xl md:text-6xl font-extrabold text-primary">Find Your Perfect Course</h1>

        <Button asChild size="lg" className="mt-8">
          <Link href="#search">
            <Compass className="mr-2" /> Start Exploring
          </Link>
        </Button>
      </section>

      {/* ✅ SEARCH SYSTEM */}
      <section id="search" className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* ✅ FILTER SIDEBAR */}
          <aside className="lg:col-span-1">
            <div className="p-6 bg-card rounded-lg shadow-sm sticky top-24">

              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-primary">
                <SlidersHorizontal /> Filters
              </h3>

              <Input
                placeholder="Search course…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                <SelectTrigger className="mt-4">
                  <SelectValue placeholder="Select University" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Universities</SelectItem>
                  {universityOptions.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={courseLevel} onValueChange={setCourseLevel}>
                <SelectTrigger className="mt-4">
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="Bachelor">Bachelor</SelectItem>
                  <SelectItem value="Master">Master</SelectItem>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                </SelectContent>
              </Select>

              <div className="mt-6">
                <label>Max Tuition (USD)</label>
                <Slider
                  min={0}
                  max={50000}
                  value={[tuitionRange[1]]}
                  onValueChange={(v) => setTuitionRange([0, v[0]])}
                />
                <p className="text-right font-semibold mt-1">
                  up to ${tuitionRange[1].toLocaleString()}
                </p>
              </div>

            </div>
          </aside>

          {/* ✅ SEARCH RESULTS */}
          <main className="lg:col-span-3">
            <h2 className="text-3xl font-bold mb-6 text-primary">
              {loading ? "Loading…" : `${courses.length} Courses Found`}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading
                ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
                : courses.map((course) => <CourseCard key={course.uniqueId} course={course} />)}
            </div>
          </main>

        </div>
      </section>
    </div>
  );
}