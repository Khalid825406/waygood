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
import { ArrowRight, Building2, CalendarDays, DollarSign } from "lucide-react";

interface CourseCardProps {
  course: {
    _id?: string;
    uniqueId: string;
    name: string;
    universityName: string;
    overview: string;
    level?: string;
    durationMonths?: number;
    language?: string;
    tuitionFees?: { amount?: number; currency?: string };
    deadlines?: { international?: string };
  };
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-xl transition-all">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          <Link href={`/courses/${course.uniqueId}`} className="hover:text-accent">
            {course.name}
          </Link>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Building2 className="h-4 w-4" /> {course.universityName}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{course.overview}</p>

        <div className="flex flex-wrap gap-2">
          {course.level && <Badge variant="secondary">{course.level}</Badge>}
          {course.durationMonths && <Badge variant="secondary">{course.durationMonths} months</Badge>}
          {course.language && <Badge variant="secondary">{course.language}</Badge>}
        </div>

        {course.tuitionFees?.amount && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-accent" />
            <span>
              {course.tuitionFees.amount.toLocaleString()} {course.tuitionFees.currency || "USD"} / year
            </span>
          </div>
        )}

        {course.deadlines?.international && (
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-accent" />
            <span>Deadline: {course.deadlines.international}</span>
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