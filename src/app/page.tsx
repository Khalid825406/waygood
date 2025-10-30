'use client';

import { useState, useEffect, useMemo } from 'react';
import { universities } from '@/lib/data/universities';
import CourseCard from '@/components/course-card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Compass, Search, SlidersHorizontal, Sparkles } from 'lucide-react';

// ✅ Define course type locally (based on your database structure)
interface CourseType {
  uniqueId: string;
  name: string;
  overview: string;
  universityName: string;
  tuitionFees?: {
    amount?: number;
    currency?: string;
  };
  level?: string;
}

export default function Home() {
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('all');
  const [tuitionRange, setTuitionRange] = useState([0, 50000]);
  const [courseLevel, setCourseLevel] = useState('all');

  // ✅ Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/course/upload');
        if (!res.ok) throw new Error('Failed to fetch courses');

        const result = await res.json();
        console.log('Fetched data:', result);

        if (result?.data && Array.isArray(result.data)) {
          setCourses(result.data);
        } else if (Array.isArray(result)) {
          setCourses(result);
        } else {
          console.error('Unexpected data format:', result);
          setCourses([]);
        }
      } catch (error) {
        console.error('Error loading courses:', error);
        setCourses([]);
      }
    };

    fetchCourses();
  }, []);

  // ✅ University dropdown
  const universityOptions = useMemo(() => {
    return universities.map((uni) => ({
      value: uni.uniqueCode,
      label: uni.universityName,
    }));
  }, []);

  // ✅ Unique Course Levels
  const courseLevels = useMemo(() => {
    const levels = new Set(courses.map((c) => c.level));
    return ['all', ...Array.from(levels).filter(Boolean)];
  }, [courses]);

  // ✅ Filters
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.overview.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesUniversity =
        selectedUniversity === 'all' ||
        universities.some(
          (u) =>
            u.uniqueCode === selectedUniversity &&
            u.universityName === course.universityName
        );

      const matchesTuition =
        (course.tuitionFees?.amount ?? 0) >= tuitionRange[0] &&
        (course.tuitionFees?.amount ?? 0) <= tuitionRange[1];

      const matchesLevel =
        courseLevel === 'all' || course.level === courseLevel;

      return (
        matchesSearch &&
        matchesUniversity &&
        matchesTuition &&
        matchesLevel
      );
    });
  }, [courses, searchTerm, selectedUniversity, tuitionRange, courseLevel]);

  return (
    <div className="bg-background text-foreground">
      {/* ✅ Header */}
      <section className="text-center py-20 px-4 bg-card border-b">
        <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-primary">
          Find Your Perfect Course
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Navigate the world of education with Course Compass. Search thousands
          of courses from top universities to find your best fit.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="#search">
              <Compass className="mr-2" /> Start Exploring
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/course-match">
              <Sparkles className="mr-2" /> AI Course Match
            </Link>
          </Button>
        </div>
      </section>

      {/* ✅ Search & Filters */}
      <section id="search" className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <div className="p-6 rounded-lg bg-card shadow-sm sticky top-24">
              <h3 className="font-headline text-2xl font-semibold mb-6 flex items-center gap-2 text-primary">
                <SlidersHorizontal /> Filters
              </h3>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label
                    htmlFor="search-term"
                    className="text-sm font-medium"
                  >
                    Search by Keyword
                  </label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="search-term"
                      type="text"
                      placeholder="e.g. Computer Science"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* University Filter */}
                <div>
                  <label
                    htmlFor="university"
                    className="text-sm font-medium"
                  >
                    University
                  </label>
                  <Select
                    value={selectedUniversity}
                    onValueChange={setSelectedUniversity}
                  >
                    <SelectTrigger id="university" className="w-full mt-2">
                      <SelectValue placeholder="Select University" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Universities</SelectItem>
                      {universityOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Level Filter */}
                <div>
                  <label
                    htmlFor="course-level"
                    className="text-sm font-medium"
                  >
                    Course Level
                  </label>
                  <Select
                    value={courseLevel}
                    onValueChange={setCourseLevel}
                  >
                    <SelectTrigger id="course-level" className="w-full mt-2">
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseLevels.map((level) => (
                        <SelectItem
                          key={level}
                          value={level}
                          className="capitalize"
                        >
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tuition Filter */}
                <div>
                  <label className="text-sm font-medium">
                    Max. Tuition (
                    {courses[0]?.tuitionFees?.currency || 'USD'})
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      min={0}
                      max={50000}
                      step={1000}
                      value={[tuitionRange[1]]}
                      onValueChange={(value) =>
                        setTuitionRange([tuitionRange[0], value[0]])
                      }
                    />
                  </div>
                  <div className="text-right text-sm text-muted-foreground mt-1">
                    Up to ${tuitionRange[1].toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ✅ Course List */}
          <main className="lg:col-span-3">
            <h2 className="font-headline text-3xl font-bold mb-6 text-primary">
              {filteredCourses.length} Courses Found
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.uniqueId} course={course} />
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center bg-card rounded-lg p-12 h-full">
                <Search className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold text-primary">
                  No Courses Found
                </h3>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your filters to find what you're looking for.
                </p>
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}