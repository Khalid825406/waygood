'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowLeft,
  BookUser,
  CircleDollarSign,
  Clock,
  FileText,
  GanttChartSquare,
  Globe,
  GraduationCap,
  Languages,
  Milestone,
  School,
  Target,
  Calendar,
} from 'lucide-react';

interface DetailPageProps {
  params: { id: string };
}

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-4">
    <div className="text-accent flex-shrink-0 mt-1">{icon}</div>
    <div>
      <p className="font-semibold text-primary">{label}</p>
      <p className="text-muted-foreground">{value}</p>
    </div>
  </div>
);

export default function CourseDetailPage({ params }: DetailPageProps) {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/course/${id}`);
        const data = await res.json();
        if (data?.success && data?.data) {
          setCourse(data.data);
        } else {
          setCourse(null);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading)
    return (
      <div className="text-center py-20 text-muted-foreground">
        Loading course details...
      </div>
    );

  if (!course) {
    notFound();
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto py-12 px-4">
        <Button variant="ghost" asChild className="mb-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SIDE - COURSE INFO */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader className="bg-card">
                <Badge variant="secondary" className="w-fit mb-2">
                  {course.level}
                </Badge>
                <CardTitle className="font-headline text-4xl text-primary">
                  {course.name}
                </CardTitle>
                <CardDescription className="text-lg flex items-center gap-2 pt-2">
                  <School className="h-5 w-5" /> {course.universityName}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-8">
                <div>
                  <h3 className="font-headline text-2xl font-semibold mb-4 text-primary">
                    Overview
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {course.overview}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem icon={<GanttChartSquare />} label="Discipline" value={course.discipline} />
                  <DetailItem icon={<BookUser />} label="Department" value={course.department} />
                  <DetailItem icon={<Clock />} label="Duration" value={`${course.durationMonths} months`} />
                  <DetailItem icon={<GraduationCap />} label="Credits" value={`${course.credits}`} />
                  <DetailItem icon={<Languages />} label="Language" value={course.language} />
                  <DetailItem icon={<Milestone />} label="Specialization" value={course.specialization || 'N/A'} />
                </div>

                {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                  <div>
                    <h3 className="font-headline text-2xl font-semibold mb-4 text-primary">
                      Learning Outcomes
                    </h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      {course.learningOutcomes.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE - FEES + DEADLINES + UNIVERSITY INFO */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2 text-primary">
                  <CircleDollarSign /> Fees & Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailItem
                  icon={<CircleDollarSign />}
                  label="1st Year Tuition"
                  value={`${course.tuitionFees?.amount?.toLocaleString() || 'N/A'} ${
                    course.tuitionFees?.currency || 'USD'
                  }`}
                />
                <DetailItem
                  icon={<Calendar />}
                  label="Int'l Deadline"
                  value={course.deadlines?.international || 'Not specified'}
                />
                <DetailItem
                  icon={<Calendar />}
                  label="Domestic Deadline"
                  value={course.deadlines?.domestic || 'Not specified'}
                />

                <Button
                  asChild
                  className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Link href="#" target="_blank">
                    Apply Now <Globe className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2 text-primary">
                  <FileText /> Admission
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailItem
                  icon={<Target />}
                  label="IELTS Score"
                  value={course.ieltsRequired ? `Min ${course.ieltsRequired}` : 'Not Required'}
                />
                <DetailItem
                  icon={<Target />}
                  label="Undergraduate Degree"
                  value={course.prerequisites?.join(', ') || 'Not specified'}
                />
                <DetailItem
                  icon={<Target />}
                  label="SAT / ACT"
                  value={course.satRequired || course.actRequired ? 'Required' : 'Not Required'}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
