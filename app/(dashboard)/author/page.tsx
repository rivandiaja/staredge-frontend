"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  Video,
  Award,
  TrendingUp,
  PlusCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AuthorStats {
  total_students: number;
  total_courses: number;
  published_courses: number;
  total_webinars: number;
  webinar_registrations: number;
  activity_trend: number[];
  growth_trend: number[];
}

export default function AuthorDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AuthorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get<{ data: AuthorStats }>("/cms/author-stats");
        setStats(response.data.data);
      } catch (error) {
        console.error("Failed to fetch author stats", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "author" || user?.role === "admin") {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">
            Syncing your creator studio...
          </p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: "My Courses",
      value: stats.total_courses,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Students",
      value: stats.total_students,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Hosted Webinars",
      value: stats.total_webinars,
      icon: Video,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      label: "Webinar Signups",
      value: stats.webinar_registrations,
      icon: UserCheck,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-10 pb-20 max-w-7xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Creator Studio 🎨
          </h1>
          <p className="text-slate-500 font-medium">
            Manage your content and impact global learners.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 h-11 px-6 shadow-lg shadow-indigo-100">
            <Link href="/author/courses/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Course
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid - Horizontal Slider on Mobile */}
      <div className="flex overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 snap-x touch-pan-y">
        {statCards.map((stat, i) => (
          <Card
            key={i}
            className="border-none shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden group min-w-[160px] md:min-w-0 snap-center"
          >
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div
                className={cn(
                  "p-3 rounded-2xl transition-transform group-hover:scale-110",
                  stat.bg,
                )}
              >
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-black text-slate-900">
                  {stat.value.toLocaleString()}
                </h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
           {/* Quick Access Grid */}
           <div className="grid sm:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm rounded-3xl p-8 bg-slate-900 text-white relative overflow-hidden group">
                <div className="relative z-10 space-y-4">
                  <div className="h-12 w-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">Courses Hub</h3>
                    <p className="text-slate-400 text-sm font-medium mt-1">Manage your curriculum and modules.</p>
                  </div>
                  <Button variant="ghost" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl h-11 w-full font-bold" asChild>
                    <Link href="/author/courses">Manage Courses <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
                <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-indigo-500/10 rounded-full blur-2xl" />
              </Card>

              <Card className="border-none shadow-sm rounded-3xl p-8 bg-white border border-slate-100 relative overflow-hidden group">
                <div className="relative z-10 space-y-4">
                  <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">Reviews</h3>
                    <p className="text-slate-400 text-sm font-medium mt-1">Grade student submissions & feedback.</p>
                  </div>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 w-full font-bold shadow-lg shadow-indigo-100" asChild>
                    <Link href="/author/submissions">Go to Queue <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
                <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-emerald-50 rounded-full blur-2xl" />
              </Card>
           </div>

           {/* Information Banner */}
           <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6">
              <div className="h-16 w-16 shrink-0 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-lg">Growth Tip</h4>
                <p className="text-slate-600 font-medium text-sm mt-1">Keeping your courses updated with current industry trends improves student satisfaction scores + rating global ranking.</p>
              </div>
           </div>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-3xl p-6 bg-white border border-slate-100">
            <CardHeader className="p-0 pb-6 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-black">Platform Bio</CardTitle>
              <Award className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div className="aspect-square w-full rounded-2xl bg-slate-50 border relative overflow-hidden">
                {user?.avatar ? (
                  <img src={api.defaults.baseURL + "/uploads/" + user.avatar} alt="" className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-200">
                    <Users className="h-16 w-16" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="font-black text-slate-900">{user?.name}</p>
                <Badge className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest border-none">
                  LICENSED AUTHOR
                </Badge>
              </div>
              <Button variant="outline" className="w-full rounded-xl h-11 font-bold border-slate-200" asChild>
                <Link href="/author/profile">Edit Public Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
