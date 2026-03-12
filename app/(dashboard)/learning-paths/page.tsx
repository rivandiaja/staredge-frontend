"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Award,
  CheckCircle2,
  Search,
  PlayCircle,
  BookOpen,
  Edit2,
} from "lucide-react";
import { api, getImageUrl } from "@/lib/api";
import { LearningPath } from "@/types/api";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

export default function LearningPathsPage() {
  const { user } = useAuth();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const response = await api.get<any>("/learning-paths");
        const responseData = response.data;
        const pathsData = Array.isArray(responseData)
          ? responseData
          : responseData?.data || [];
        setPaths(pathsData);
      } catch (error) {
        console.error("Failed to fetch paths", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPaths();
  }, []);

  const filteredPaths = paths.filter(
    (path) =>
      path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const completed = filteredPaths.filter((p) => (p.progress || 0) >= 99.9);
  const inProgress = filteredPaths.filter(
    (p) => (p.progress || 0) > 0 && (p.progress || 0) < 99.9,
  );
  const notStarted = filteredPaths.filter((p) => (p.progress || 0) === 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const CourseCard = ({ path }: { path: LearningPath }) => (
    <Link
      key={path.id}
      href={`/learning-paths/${path.id}`}
      className="block flex-none w-[280px] md:w-full snap-center"
    >
      <Card className="group rounded-3xl border-none shadow-md overflow-hidden bg-white hover:shadow-lg transition-all duration-500 h-full flex flex-col">
        <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
          {path.thumbnail ? (
            <img
              src={getImageUrl(path.thumbnail)}
              alt={path.title}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-200">
              <BookOpen className="h-10 w-10" />
            </div>
          )}
          <div className="absolute top-4 right-4 flex gap-2">
            {path.is_claimed && (
              <Badge className="bg-amber-500 text-white border-none p-1.5 rounded-full shadow-lg">
                <Award className="h-3 w-3" />
              </Badge>
            )}
            {(path.progress || 0) >= 99.9 ? (
              <Badge className="bg-emerald-500 border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                Completed
              </Badge>
            ) : (path.progress || 0) > 0 ? (
              <Badge className="bg-amber-500 border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                In Progress
              </Badge>
            ) : null}
          </div>
        </div>
        <CardHeader className="p-4 md:p-6 flex-1">
          <div className="flex items-center gap-2 mb-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <BookOpen className="h-3 w-3 text-indigo-600" />
            Academic Path
          </div>
          <CardTitle className="line-clamp-1 text-base md:text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
            {path.title}
          </CardTitle>
          <p className="line-clamp-2 mt-1 text-xs md:text-sm font-medium text-slate-500 leading-relaxed">
            {path.description}
          </p>
          {(path.progress || 0) > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <span>Progress</span>
                <span>{Math.round(path.progress || 0)}%</span>
              </div>
              <Progress
                value={path.progress}
                className="h-1.5 bg-slate-50 [&>div]:bg-indigo-600"
              />
            </div>
          )}
        </CardHeader>
      </Card>
    </Link>
  );

  const Section = ({ title, courses, icon: Icon, emptyMsg }: any) => {
    if (courses.length === 0 && searchQuery) return null;

    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center text-indigo-600">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              {title}
              <span className="text-sm font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                {courses.length}
              </span>
            </h2>
          </div>
        </div>
        {courses.length > 0 ? (
          <div className="flex flex-nowrap overflow-x-auto no-scrollbar pb-6 -mx-4 px-4 gap-4 snap-x touch-pan-x md:grid md:grid-cols-2 lg:grid-cols-3 md:mx-0 md:px-0 md:gap-8">
            {courses.map((path: any) => (
              <CourseCard key={path.id} path={path} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] px-6">
            <p className="text-slate-400 font-bold text-lg">{emptyMsg}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-indigo-50/50 p-8 md:p-12 rounded-[3rem] border border-indigo-100/50">
        <div className="space-y-3">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
            Learning Paths
          </h1>
          <p className="text-slate-500 text-lg font-bold max-w-xl">
            Explore comprehensive tracks to master new skills and grow your
            professional authority.
          </p>
        </div>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 h-16 bg-white border-none rounded-2xl shadow-2xl shadow-indigo-200/20 focus-visible:ring-2 focus-visible:ring-indigo-600 text-lg font-bold placeholder:text-slate-300"
          />
        </div>
      </div>

      <div className="space-y-24 px-4">
        {inProgress.length > 0 && (
          <Section
            title="In Progress"
            courses={inProgress}
            icon={PlayCircle}
            emptyMsg="You're not currently taking any courses. Pick one below to start!"
          />
        )}

        {(!searchQuery || notStarted.length > 0) && (
          <Section
            title="Available Pathways"
            courses={notStarted}
            icon={BookOpen}
            emptyMsg="All available courses have been started or completed!"
          />
        )}

        {completed.length > 0 && (
          <Section
            title="Completed Pathways"
            courses={completed}
            icon={CheckCircle2}
            emptyMsg="Finish a course to see it here!"
          />
        )}

        {searchQuery && filteredPaths.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Search className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-6">
              No courses found
            </h3>
            <p className="text-slate-500 font-bold">
              We couldn't find any courses matching "{searchQuery}"
            </p>
            <Button
              variant="link"
              onClick={() => setSearchQuery("")}
              className="text-indigo-600 font-black uppercase tracking-widest"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
