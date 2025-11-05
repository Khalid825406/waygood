"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  DollarSign,
} from "lucide-react";

export interface CourseType {
  uniqueId: string;
  courseName: string;
  overviewDescription: string;
  universityName: string;
  courseLevel?: string;
  durationMonths?: number;
  languageOfInstruction?: string;
  firstYearTuitionFee?: number;
  tuitionFeeCurrency?: string;
  internationalApplicationDeadline?: string;
}

export default function CourseCard({ course }: { course: CourseType }) {
  return (
    <Card className="flex flex-col h-full hover:shadow-xl transition-all">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          <Link
            href={`/courses/${course.uniqueId}`}
            className="hover:text-accent"
          >
            {course.courseName}
          </Link>
        </CardTitle>

        <CardDescription className="flex items-center gap-2">
          <Building2 className="h-4 w-4" /> {course.universityName}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {course.overviewDescription}
        </p>

        <div className="flex flex-wrap gap-2">
          {course.courseLevel && (
            <Badge variant="secondary">{course.courseLevel}</Badge>
          )}
          {course.durationMonths && (
            <Badge variant="secondary">{course.durationMonths} months</Badge>
          )}
          {course.languageOfInstruction && (
            <Badge variant="secondary">
              {course.languageOfInstruction}
            </Badge>
          )}
        </div>

        {course.firstYearTuitionFee && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-accent" />
            <span>
              {course.firstYearTuitionFee.toLocaleString()}{" "}
              {course.tuitionFeeCurrency || "USD"} / year
            </span>
          </div>
        )}

        {course.internationalApplicationDeadline && (
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-accent" />
            <span>
              Deadline: {course.internationalApplicationDeadline}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/courses/${course.uniqueId}`}>
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
