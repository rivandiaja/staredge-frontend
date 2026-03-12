"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, getImageUrl } from "@/lib/api";
import { User, LearningPath, Webinar } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User as UserIcon,
  BookOpen,
  Video,
  Loader2,
  Calendar,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "../../../../lib/utils";

export default function PublicAuthorPortfolio() {
  const { username } = useParams();
  const [data, setData] = useState<{
    author: User;
    courses: LearningPath[];
    webinars: Webinar[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/authors/${username}`);
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch author portfolio", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [username]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );

  if (!data)
    return (
      <div className="flex flex-col h-screen items-center justify-center text-center p-4">
        <h1 className="text-4xl font-black text-slate-900 mb-2">
          Author Not Found
        </h1>
        <p className="text-slate-500 font-medium">
          The author you are looking for doesn't exist or is not active.
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Minimalist Profile Header */}
      <div className="bg-white border-b pt-10 md:pt-16 pb-8 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-2xl md:rounded-3xl bg-slate-50 overflow-hidden border-2 border-slate-100 shadow-sm shrink-0">
              {data.author.avatar ? (
                <img
                  src={getImageUrl(data.author.avatar)}
                  alt={data.author.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon className="h-10 w-10 text-slate-200" />
                </div>
              )}
            </div>
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                {data.author.name}
              </h1>
              <p className="text-blue-600 font-bold text-xs md:text-sm tracking-widest uppercase">
                {data.author.author_profile?.occupation || "Independent Author"}
              </p>
              <div className="max-w-2xl text-slate-500 font-medium text-xs md:text-base leading-relaxed line-clamp-2 md:line-clamp-none">
                {data.author.author_profile?.bio ||
                  "Expert educator at Staredge Academy."}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-12 md:mt-16 space-y-12 md:space-y-16">
        {/* Courses Section - Horizontal Slider on Mobile */}
        {data.courses.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <h2 className="text-lg md:text-2xl font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" /> Published Courses
              </h2>
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1 font-bold text-[10px] md:text-xs"
              >
                {data.courses.length} Courses
              </Badge>
            </div>
            <div className="flex flex-nowrap overflow-x-auto no-scrollbar pb-6 -mx-4 px-4 gap-4 snap-x touch-pan-x md:grid md:grid-cols-2 lg:grid-cols-3 md:mx-0 md:px-0 md:gap-8">
              {data.courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/learning-paths/${course.id}`}
                  className="block flex-none w-[280px] md:w-full snap-center"
                >
                  <Card className="group rounded-3xl border-none shadow-md overflow-hidden bg-white hover:shadow-lg transition-all duration-500 min-w-[280px] md:min-w-0 h-full">
                    <div className="aspect-video relative overflow-hidden bg-slate-50">
                      {course.thumbnail ? (
                        <img
                          src={getImageUrl(course.thumbnail)}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          alt={course.title}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-10 w-10 text-slate-100" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="p-4 md:p-6">
                      <div className="flex items-center gap-2 mb-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        <BookOpen className="h-3 w-3 text-blue-600" />
                        Curriculum Course
                      </div>
                      <CardTitle className="text-base md:text-lg font-black line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </CardTitle>
                      <p className="text-slate-500 line-clamp-2 text-xs md:text-sm font-medium mt-1">
                        {course.description}
                      </p>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Webinars Section - Horizontal Slider on Mobile */}
        {data.webinars.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <h2 className="text-lg md:text-2xl font-black text-slate-900 flex items-center gap-2">
                <Video className="h-5 w-5 text-emerald-600" /> Live Interactions
              </h2>
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1 font-bold text-[10px] md:text-xs"
              >
                {data.webinars.length} Webinars
              </Badge>
            </div>
            <div className="flex flex-nowrap overflow-x-auto no-scrollbar pb-6 -mx-4 px-4 gap-4 snap-x touch-pan-x md:grid md:grid-cols-2 lg:grid-cols-3 md:mx-0 md:px-0 md:gap-8">
              {data.webinars.map((webinar) => (
                <Link
                  key={webinar.id}
                  href={`/webinars/${webinar.id}`}
                  className="block flex-none w-[280px] md:w-full snap-center"
                >
                  <Card className="group rounded-3xl border-none shadow-md overflow-hidden bg-white hover:shadow-lg transition-all duration-500 min-w-[280px] md:min-w-0 h-full">
                    <div className="aspect-video relative overflow-hidden bg-slate-50">
                      {webinar.banner ? (
                        <img
                          src={getImageUrl(webinar.banner)}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          alt={webinar.title}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-10 w-10 text-slate-100" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-emerald-500 text-white border-none font-bold text-[9px] px-2 py-1 rounded-full shadow-lg">
                          LIVE
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="p-4 md:p-6">
                      <div className="flex items-center gap-2 mb-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        <Calendar className="h-3 w-3" />
                        {formatDate(webinar.scheduled_at)}
                      </div>
                      <CardTitle className="text-base md:text-lg font-black line-clamp-1 group-hover:text-emerald-600 transition-colors">
                        {webinar.title}
                      </CardTitle>
                      <p className="text-slate-500 line-clamp-2 text-xs md:text-sm font-medium mt-1">
                        {webinar.description}
                      </p>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {!data.courses.length && !data.webinars.length && (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserIcon className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">
              Portfolio Still Empty
            </h3>
            <p className="text-slate-500 font-medium">
              This author hasn't published any items yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
