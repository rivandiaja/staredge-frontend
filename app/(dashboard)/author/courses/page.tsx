"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, getImageUrl } from "@/lib/api";
import { LearningPath } from "@/types/api";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  PlusCircle,
  Edit,
  Trash2,
  BookOpen,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
} from "lucide-react";
// Re-trigger build
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export default function AuthorCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get<{ data: LearningPath[] }>(
          "/cms/author-courses",
        );
        setCourses(response.data.data);
      } catch (error) {
        console.error("Failed to fetch courses", error);
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCourses();
    }
  }, [user]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      await api.delete(`/cms/learning-paths/${id}`);
      setCourses(courses.filter((c) => c.id !== id));
      toast.success("Course deleted successfully");
    } catch (error) {
      console.error("Failed to delete course", error);
      toast.error("Failed to delete course");
    }
  };

  if (loading)
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );

  const totalCourses = courses.length;
  const publishedCount = courses.filter((c) => c.status === "published").length;
  const draftCount = totalCourses - publishedCount;

  const courseStats = [
    {
      label: "Global Courses",
      value: totalCourses,
      icon: BookOpen,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Active / Published",
      value: publishedCount,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Draft Content",
      value: draftCount,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Active Modules",
      value: courses.reduce((acc, c) => acc + (c.modules?.length || 0), 0),
      icon: Layers,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-10 pb-20 max-w-7xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Instructor Studio 🎬
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Create, manage and distribute world-class learning experiences.
          </p>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 snap-x">
          <Button
            asChild
            className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold px-6 h-11 transition-all shadow-lg shadow-indigo-500/20 shrink-0 snap-start"
          >
            <Link href="/author/courses/create">
              <PlusCircle className="mr-2 h-5 w-5" /> Start New Course
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Slider on Mobile */}
      <div className="flex overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 gap-4 snap-x">
        {courseStats.map((stat, i) => (
          <Card
            key={i}
            className="border-none shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden bg-white min-w-[150px] md:min-w-0 snap-center p-5 flex flex-col items-center text-center gap-2"
          >
            <div className={cn("p-2.5 rounded-2xl", stat.bg)}>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                {stat.label}
              </p>
              <h3 className="text-xl font-black text-slate-900">
                {stat.value.toLocaleString()}
              </h3>
            </div>
          </Card>
        ))}
      </div>

      {courses.length === 0 ? (
        <Card className="border-2 border-dashed bg-slate-50 rounded-4xl">
          <CardContent className="flex flex-col items-center justify-center p-16 text-center">
            <div className="mb-6 rounded-3xl bg-white shadow-inner p-6 border">
              <Layers className="h-12 w-12 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black mb-2">No courses here yet</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto font-medium leading-relaxed">
              Your studio is looking a bit empty. Create your first course to
              start sharing your knowledge with the world.
            </p>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 px-10 h-14 rounded-full font-bold text-lg"
              asChild
            >
              <Link href="/author/courses/create">Get Started Now</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="group flex flex-col border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-4xl overflow-hidden bg-white"
            >
              <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                  <BookOpen className="h-16 w-16 text-slate-200" />
                </div>
                {course.thumbnail && (
                  <img
                    src={getImageUrl(course.thumbnail)}
                    alt={course.title}
                    className="absolute inset-0 object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                  />
                )}
                <div className="absolute top-4 right-4 ring-1 ring-white/20 shadow-lg rounded-full overflow-hidden">
                  <Badge
                    className={cn(
                      "px-3 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur-md border-0",
                      course.status === "published"
                        ? "bg-emerald-500/90 text-white"
                        : "bg-slate-800/80 text-white",
                    )}
                  >
                    {course.status || "draft"}
                  </Badge>
                </div>
              </div>
              <CardHeader className="p-6 md:p-8">
                <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-2 opacity-60">
                  Course ID #{course.id}
                </div>
                <CardTitle className="text-xl font-black leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-12">
                  {course.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-sm mt-3 leading-relaxed font-medium">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 md:p-8 pt-0 mt-auto border-t border-slate-50 bg-slate-50/50">
                <div className="flex justify-between items-center py-4">
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(course.created_at || new Date())}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 px-4 rounded-xl border-slate-200 font-bold hover:bg-white hover:shadow-md transition-all"
                      asChild
                    >
                      <Link href={`/author/courses/${course.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1.5" /> Edit
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      onClick={() => handleDelete(course.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
