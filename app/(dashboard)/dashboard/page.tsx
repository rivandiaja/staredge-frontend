"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PlayCircle,
  BookOpen,
  Zap,
  Trophy,
  Award,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  User as UserIcon,
  Video,
  ExternalLink,
  History,
  Users,
  Layout,
  PlusCircle,
  BarChart3,
  FileText,
  Star,
  TrendingUp,
} from "lucide-react";
import { api, getImageUrl } from "@/lib/api";
import { LearningPath, Webinar, User } from "@/types/api";
import { useAuth } from "@/context/auth-context";
import { Progress } from "@/components/ui/progress";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user } = useAuth();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    xp: 0,
    points: 0,
    rank: 0,
    certificates: 0,
    courses_done: 0,
    level: 1,
  });
  const [authorStats, setAuthorStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const generatePath = (
    data: number[],
    width: number,
    height: number,
    isArea = false,
  ) => {
    if (!data || data.length < 2) return "";
    const max = Math.max(...data, 10);
    const min = 0;
    const range = max - min;
    const stepX = width / (data.length - 1);

    let d = `M 0 ${height - ((data[0] - min) / range) * height}`;

    for (let i = 1; i < data.length; i++) {
      const x = i * stepX;
      const y = height - ((data[i] - min) / range) * height;
      const prevX = (i - 1) * stepX;
      const prevY = height - ((data[i - 1] - min) / range) * height;
      d += ` C ${prevX + stepX / 2} ${prevY}, ${x - stepX / 2} ${y}, ${x} ${y}`;
    }

    if (isArea) {
      d += ` V ${height} H 0 Z`;
    }
    return d;
  };

  const generatePoints = (data: number[], width: number, height: number) => {
    if (!data || data.length === 0) return [];
    const max = Math.max(...data, 10);
    const min = 0;
    const range = max - min;
    const stepX = width / (data.length - 1);

    return data.map((val, i) => ({
      x: i * stepX,
      y: height - ((val - min) / range) * height,
      val,
    }));
  };

  const isAuthor = user?.role === "author" || user?.role === "admin";
  const isStudent = user?.role === "user";
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchers: Promise<any>[] = [
          api.get<any>("/learning-paths"),
          api.get<any>("/webinars"),
          api.get<any>("/landing-page"),
          api.get<any>("/leaderboard"),
        ];

        if (isStudent) {
          fetchers.push(api.get<any>("/user/stats"));
        }

        if (isAuthor) {
          fetchers.push(api.get<any>("/cms/author-stats"));
        }

        const results = await Promise.all(fetchers);

        // Basic data
        const [pathsRes, webinarsRes, landingRes, leaderboardRes] = results;

        const pathsData = Array.isArray(pathsRes.data)
          ? pathsRes.data
          : pathsRes.data?.data || [];
        setPaths(pathsData);

        const webinarData = Array.isArray(webinarsRes.data)
          ? webinarsRes.data
          : webinarsRes.data?.data || [];
        setWebinars(webinarData);

        const leaderboardData = Array.isArray(leaderboardRes.data)
          ? leaderboardRes.data
          : leaderboardRes.data?.data || [];
        setLeaderboard(leaderboardData);

        const landingData = Array.isArray(landingRes.data)
          ? landingRes.data
          : landingRes.data?.data || [];

        // Create dynamic announcements feed
        const newsItems = landingData
          .filter((s: any) => s.type === "news" || s.type === "announcement")
          .map((s: any) => ({
            ...JSON.parse(s.content),
            id: s.id,
            tag: s.type.toUpperCase(),
            timestamp: s.created_at ? new Date(s.created_at).getTime() : 0,
          }));

        const dynamicFeed = [
          ...newsItems,
          ...pathsData.map((p: any) => ({
            id: `path-${p.id}`,
            title: `New Course: ${p.title}`,
            tag: "NEW COURSE",
            date: "Fresh",
            link: `/learning-paths/${p.id}`,
            timestamp: p.created_at ? new Date(p.created_at).getTime() : 0,
          })),
          ...webinarData.map((w: any) => ({
            id: `webinar-${w.id}`,
            title: `Webinar: ${w.title}`,
            tag: "UPCOMING",
            date: "Event",
            link: `/webinars/${w.id}`,
            timestamp: w.created_at ? new Date(w.created_at).getTime() : 0,
          })),
        ]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 5);

        setAnnouncements(dynamicFeed);

        // Role specific stats
        if (isStudent && results[4]) {
          setStats(results[4].data.data);
        }

        if (isAuthor) {
          const authorStatsIdx = isStudent ? 5 : 4;
          if (results[authorStatsIdx]) {
            setAuthorStats(results[authorStatsIdx].data.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleClaimWebinar = async (webinarId: number) => {
    try {
      await api.post(`/webinars/${webinarId}/register`);
      toast.success(
        "Successfully registered for the webinar! You will receive a notification before it starts.",
      );
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Failed to register for webinar.",
      );
    }
  };

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">
            Architecting your workspace...
          </p>
        </div>
      </div>
    );
  }

  const activePaths = paths.filter((p: LearningPath) => (p.progress || 0) > 0);
  const recommendedPaths = paths
    .filter((p: LearningPath) => !(p.progress || 0))
    .slice(0, 3);

  // Separate Webinars
  const now = new Date();
  const upcomingWebinars = webinars.filter(
    (w) => new Date(w.scheduled_at) > now,
  );
  const pastWebinars = webinars.filter((w) => new Date(w.scheduled_at) <= now);

  return (
    <div className="w-full overflow-x-hidden">
      <div className="space-y-6 md:space-y-8 pb-20 w-full max-w-full md:max-w-7xl mx-auto px-0 md:px-6">
        {/* Hero Welcome Section */}
        <section className="relative overflow-hidden rounded-3xl md:rounded-4xl bg-linear-to-br from-indigo-600 via-blue-600 to-indigo-800 p-5 md:p-12 text-white shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-xl md:text-4xl font-black tracking-tight leading-tight text-center md:text-left">
                Hello, {user?.name.split(" ")[0]}! 👋
              </h1>
              <p className="text-[10px] md:text-base text-blue-100 font-medium max-w-lg leading-relaxed opacity-85 text-center md:text-left">
                {isAdmin
                  ? "Manage platform content and system configurations."
                  : "Ready to continue your expertise journey?"}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <Button
                  asChild
                  className="bg-white text-indigo-700 hover:bg-blue-50 rounded-xl font-black px-6 h-11 shadow-lg shadow-indigo-900/10 transition-all hover:scale-105 active:scale-95 text-xs"
                >
                  <Link
                    href={isAuthor ? "/author/submissions" : "/learning-paths"}
                  >
                    {isAuthor ? (
                      <>
                        <CheckCircle2 className="mr-1.5 h-4 w-4" /> Reviews
                      </>
                    ) : (
                      <>
                        <Zap className="mr-1.5 h-4 w-4 fill-indigo-700" /> Start
                      </>
                    )}
                  </Link>
                </Button>
                {isAuthor && (
                  <Button
                    asChild
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl font-black px-6 h-11 backdrop-blur-md transition-all hover:scale-105 active:scale-95 text-xs"
                  >
                    <Link href="/author/courses">
                      <PlusCircle className="mr-1.5 h-4 w-4" /> Create
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {isStudent && (
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute -inset-4 bg-white/20 blur-3xl rounded-full animate-pulse" />
                  <div className="relative bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl w-64 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-yellow-400 rounded-lg">
                        <Zap className="h-5 w-5 text-yellow-900 fill-yellow-900" />
                      </div>
                      <span className="font-bold text-sm tracking-wide">
                        LEVEL {stats.level}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-blue-100">
                        <span>XP PROGRESS</span>
                        <span>{stats.xp % 1000} / 1000</span>
                      </div>
                      <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full transition-all duration-1000"
                          style={{ width: `${(stats.xp % 1000) / 10}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isAuthor && authorStats && (
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl w-72 shadow-2xl relative overflow-hidden group">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-emerald-400 rounded-xl shadow-lg shadow-emerald-400/20">
                      <TrendingUp className="h-5 w-5 text-emerald-900" />
                    </div>
                    <div>
                      <span className="font-black text-[10px] uppercase tracking-widest text-blue-100 block">
                        Platform Pulse
                      </span>
                      <span className="text-[9px] font-bold text-blue-200/50 uppercase">
                        Real-time Analytics
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="relative p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-blue-100 uppercase tracking-widest">
                          Active Reach
                        </span>
                        <span className="text-xl font-black">
                          {authorStats.total_students.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 w-[65%] rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                      </div>
                    </div>
                    <div className="relative p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-blue-100 uppercase tracking-widest">
                          Total Catalog
                        </span>
                        <span className="text-xl font-black">
                          {authorStats.published_courses}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Decoration */}
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <BarChart3 className="h-20 w-20" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Abstract Background Shapes */}
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl" />
        </section>

        {/* Stats Grid - Horizontal Slider on Mobile */}
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 gap-3 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:gap-6 snap-x touch-pan-x">
          {isAuthor && authorStats
            ? /* AUTHOR STATS */
              [
                {
                  label: "Course Catalog",
                  value: `${authorStats.published_courses}/${authorStats.total_courses}`,
                  icon: BookOpen,
                  iconColor: "text-blue-600",
                  bg: "bg-blue-50",
                },
                {
                  label: "Student Enrollments",
                  value: authorStats.total_students.toLocaleString(),
                  icon: Users,
                  iconColor: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
                {
                  label: "Webinar Sessions",
                  value: authorStats.total_webinars,
                  icon: Video,
                  iconColor: "text-rose-600",
                  bg: "bg-rose-50",
                },
                {
                  label: "Webinar Signups",
                  value: authorStats.webinar_registrations.toLocaleString(),
                  icon: Layout,
                  iconColor: "text-indigo-600",
                  bg: "bg-indigo-50",
                },
              ].map((stat, i) => (
                <Card
                  key={i}
                  className="border-none shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-500 rounded-3xl overflow-hidden group min-w-[130px] md:min-w-0 snap-center shrink-0 bg-white"
                >
                  <CardContent className="p-5 flex flex-col items-start gap-3">
                    <div
                      className={cn(
                        "p-3 rounded-xl transition-all duration-500 shadow-sm group-hover:scale-110 group-hover:shadow-md",
                        stat.bg,
                      )}
                    >
                      <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        {stat.label}
                      </p>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        {stat.value}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              ))
            : /* STUDENT STATS */
              [
                {
                  label: "Total XP",
                  value: stats.xp.toLocaleString(),
                  icon: Zap,
                  iconColor: "text-blue-600",
                  bg: "bg-blue-50",
                },
                {
                  label: "Courses Done",
                  value: stats.courses_done,
                  icon: CheckCircle2,
                  iconColor: "text-green-600",
                  bg: "bg-green-50",
                },
                {
                  label: "Rank Global",
                  value: stats.rank > 0 ? `#${stats.rank}` : "N/A",
                  icon: Trophy,
                  iconColor: "text-yellow-600",
                  bg: "bg-yellow-50",
                },
                {
                  label: "Certificates",
                  value: stats.certificates,
                  icon: Award,
                  iconColor: "text-indigo-600",
                  bg: "bg-indigo-50",
                },
              ].map((stat, i) => (
                <Card
                  key={i}
                  className="border-none shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-500 rounded-3xl overflow-hidden group min-w-[130px] md:min-w-0 snap-center shrink-0 bg-white"
                >
                  <CardContent className="p-5 flex flex-col items-start gap-3">
                    <div
                      className={cn(
                        "p-3 rounded-xl transition-all duration-500 shadow-sm group-hover:scale-110 group-hover:shadow-md",
                        stat.bg,
                      )}
                    >
                      <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        {stat.label}
                      </p>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        {stat.value}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 w-full">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-12 min-w-0 w-full">
            {/* Author Quick Actions */}
            {isAuthor && (
              <div className="space-y-12">
                {/* Creator Toolkit */}
                <section>
                  <div className="flex flex-col items-center md:flex-row md:items-center gap-3 mb-6">
                    <div className="hidden md:block h-8 w-1.5 bg-slate-900 rounded-full" />
                    <h2 className="text-xl md:text-2xl font-black tracking-tight text-center">
                      Creator Toolkit
                    </h2>
                  </div>
                  <div className="flex flex-nowrap overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 gap-3 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-6 snap-x touch-pan-x">
                    {[
                      {
                        title: "Content Studio",
                        desc: "Build new paths & modules",
                        icon: PlusCircle,
                        href: "/author/courses",
                        color: "from-indigo-600 to-blue-600",
                        shadow: "shadow-indigo-200",
                      },
                      {
                        title: "Broadcast Hub",
                        desc: "Manage live interactions",
                        icon: Video,
                        href: "/author/webinars",
                        color: "from-rose-500 to-pink-500",
                        shadow: "shadow-rose-100",
                      },
                      {
                        title: "Review Center",
                        desc: "Validate student projects",
                        icon: CheckCircle2,
                        href: "/author/submissions",
                        color: "from-emerald-500 to-teal-500",
                        shadow: "shadow-emerald-100",
                      },
                    ].map((action, i) => (
                      <Link
                        key={i}
                        href={action.href}
                        className="min-w-[180px] md:min-w-0 snap-center shrink-0"
                      >
                        <Card className="hover:shadow-2xl transition-all duration-500 border-none shadow-sm rounded-3xl group h-full bg-white relative overflow-hidden">
                          <CardContent className="p-6 relative z-10">
                            <div
                              className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110 shadow-lg bg-linear-to-br",
                                action.color,
                              )}
                            >
                              <action.icon className="h-6 w-6 text-white" />
                            </div>
                            <h4 className="font-black text-slate-900 text-lg tracking-tight">
                              {action.title}
                            </h4>
                            <p className="text-[13px] font-medium text-slate-500 mt-2 leading-relaxed">
                              {action.desc}
                            </p>
                            <div className="mt-6 flex items-center gap-2 text-xs font-black text-slate-400 group-hover:text-indigo-600 transition-colors">
                              OPEN STUDIO{" "}
                              <ArrowRight className="h-3 w-3 translate-x-0 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </CardContent>
                          {/* Decorative Background Icon */}
                          <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
                            <action.icon className="h-24 w-24" />
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>

                {/* ANALYTICS CHARTS FOR AUTHOR */}
                <section className="space-y-4">
                  <div className="flex flex-col items-center mb-3">
                    <h2 className="text-[10px] font-black tracking-widest uppercase text-slate-400">
                      Analytics Performance
                    </h2>
                  </div>
                  <div className="flex flex-nowrap overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 gap-3 snap-x touch-pan-x md:grid md:grid-cols-2 md:mx-0 md:px-0 md:gap-4">
                    <Card className="rounded-xl border-none shadow-md p-3 bg-white overflow-hidden relative group min-w-[180px] md:min-w-0 snap-center shrink-0">
                      <div className="flex justify-between items-center mb-4 relative z-10">
                        <div>
                          <h4 className="font-black text-sm text-slate-900 leading-tight tracking-tight">
                            Content Ecosystem
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                            Output Velocity Index
                          </p>
                        </div>
                        <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center shadow-inner">
                          <BookOpen className="h-4 w-4 text-indigo-600" />
                        </div>
                      </div>

                      <div className="h-28 w-full relative mt-3">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between py-2 border-b border-slate-50">
                          <div className="w-full h-px bg-slate-50" />
                          <div className="w-full h-px bg-slate-50" />
                          <div className="w-full h-px bg-slate-50" />
                        </div>

                        {/* Professional Multi-Line Chart Visualization */}
                        <svg
                          viewBox="0 0 240 100"
                          className="w-full h-full overflow-hidden"
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <filter id="shadow">
                              <feDropShadow
                                dx="0"
                                dy="4"
                                stdDeviation="4"
                                floodOpacity="0.2"
                              />
                            </filter>
                          </defs>
                          {/* Course Line - Indigo */}
                          <path
                            d={generatePath(
                              authorStats?.activity_trend || [
                                40, 60, 45, 70, 50, 85, 90,
                              ],
                              240,
                              100,
                            )}
                            fill="none"
                            stroke="#4f46e5"
                            strokeWidth="4"
                            strokeLinecap="round"
                            filter="url(#shadow)"
                            className="opacity-90"
                            vectorEffect="non-scaling-stroke"
                          />
                          {generatePoints(
                            authorStats?.activity_trend || [
                              40, 60, 45, 70, 50, 85, 90,
                            ],
                            240,
                            100,
                          ).map((p, i) => (
                            <circle
                              key={i}
                              cx={p.x}
                              cy={p.y}
                              r="3"
                              fill="#4f46e5"
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            />
                          ))}
                        </svg>

                        <div className="absolute top-0 right-0">
                          <div className="flex items-center gap-2 bg-indigo-600/5 backdrop-blur-sm border border-indigo-100/50 px-3 py-1.5 rounded-full">
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce" />
                            <span className="text-[7px] font-black text-indigo-600 uppercase tracking-tighter">
                              Trending
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-6">
                        <div className="relative p-3 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-indigo-100 transition-colors group/stat">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="h-1 w-1 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                              Courses
                            </p>
                          </div>
                          <p className="font-black text-sm text-slate-900">
                            {authorStats?.total_courses || 0}
                          </p>
                        </div>
                        <div className="relative p-3 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-rose-100 transition-colors group/stat">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="h-1 w-1 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                              Webinars
                            </p>
                          </div>
                          <p className="font-black text-sm text-slate-900">
                            {authorStats?.total_webinars || 0}
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Card className="rounded-xl border-none shadow-md p-3 bg-white overflow-hidden relative min-w-[180px] md:min-w-0 snap-center shrink-0">
                      <div className="flex justify-between items-center mb-5">
                        <div>
                          <h4 className="font-black text-xs text-slate-900 leading-tight tracking-tight">
                            Learner Impact
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                            Retention & Growth Trend
                          </p>
                        </div>
                        <div className="h-8 w-8 bg-emerald-50 rounded-lg flex items-center justify-center shadow-inner">
                          <Users className="h-4 w-4 text-emerald-600" />
                        </div>
                      </div>

                      <div className="h-28 w-full relative mt-3">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between py-2 border-b border-slate-50">
                          <div className="w-full h-px bg-slate-50" />
                          <div className="w-full h-px bg-slate-50" />
                          <div className="w-full h-px bg-slate-50" />
                        </div>

                        {/* Professional Area Trend Visualization */}
                        <svg
                          viewBox="0 0 240 100"
                          className="w-full h-full overflow-hidden"
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <linearGradient
                              id="growthGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#10b981"
                                stopOpacity="0.4"
                              />
                              <stop
                                offset="100%"
                                stopColor="#10b981"
                                stopOpacity="0"
                              />
                            </linearGradient>
                          </defs>
                          <path
                            d={generatePath(
                              authorStats?.growth_trend || [
                                20, 35, 30, 45, 40, 55, 65,
                              ],
                              240,
                              100,
                              true,
                            )}
                            fill="url(#growthGradient)"
                            className="w-full h-full"
                            vectorEffect="non-scaling-stroke"
                          />
                          <path
                            d={generatePath(
                              authorStats?.growth_trend || [
                                20, 35, 30, 45, 40, 55, 65,
                              ],
                              240,
                              100,
                            )}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="4"
                            strokeLinecap="round"
                            filter="url(#shadow)"
                            vectorEffect="non-scaling-stroke"
                          />
                          {generatePoints(
                            authorStats?.growth_trend || [
                              20, 35, 30, 45, 40, 55, 65,
                            ],
                            240,
                            100,
                          ).map((p, i) => (
                            <circle
                              key={i}
                              cx={p.x}
                              cy={p.y}
                              r="3"
                              fill="#10b981"
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            />
                          ))}
                        </svg>

                        <div className="absolute top-0 right-0 flex flex-col items-end">
                          <div className="flex items-center gap-1.5 bg-emerald-50/50 backdrop-blur-sm border border-emerald-100/50 px-3 py-1.5 rounded-xl">
                            <TrendingUp className="h-4 w-4 text-emerald-600 shadow-emerald-400" />
                            <span className="text-sm font-black text-emerald-700">
                              +
                              {(
                                (authorStats?.total_students /
                                  (authorStats?.total_students + 10)) *
                                100
                              ).toFixed(0)}
                              %
                            </span>
                          </div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">
                            Monthly Increase
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        <div>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                            Active Learners
                          </p>
                          <p className="text-sm font-black text-slate-900 mt-0.5">
                            {authorStats?.total_students?.toLocaleString() || 0}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          className="rounded-lg font-black text-[9px] text-indigo-600 hover:bg-white hover:shadow-sm transition-all h-8 px-3"
                          asChild
                        >
                          <Link href="/leaderboard">
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  </div>
                </section>
              </div>
            )}

            {/* Active Paths / Content */}
            {isStudent && (
              <section id="continue">
                <div className="flex flex-col items-center md:flex-row md:items-center justify-between mb-6 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="hidden md:block h-6 w-1 bg-blue-600 rounded-full" />
                    <h2 className="text-xl md:text-2xl font-black tracking-tight text-center">
                      Keep Learning
                    </h2>
                  </div>
                  <Link
                    href="/learning-paths"
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    View All <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {activePaths.length > 0 ? (
                  <div className="flex flex-nowrap overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 gap-4 snap-x touch-pan-x md:grid md:grid-cols-2 md:mx-0 md:px-0 md:gap-4">
                    {activePaths.slice(0, 4).map((path: LearningPath) => (
                      <div
                        key={path.id}
                        className="block flex-none w-[280px] md:w-full snap-center"
                      >
                        <Card className="border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-white group h-full">
                          <div className="aspect-video w-full bg-slate-50 relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <BookOpen className="h-10 w-10 text-slate-200" />
                            </div>
                            {path.thumbnail && (
                              <img
                                src={getImageUrl(path.thumbnail)}
                                alt={path.title}
                                className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                              />
                            )}
                            <div className="absolute top-4 left-4">
                              <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 shadow-lg border border-white/10">
                                <Clock className="h-3 w-3" /> Recently Accessed
                              </div>
                            </div>
                          </div>
                          <CardHeader className="p-4 pb-1">
                            <CardTitle className="text-lg font-black line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {path.title}
                            </CardTitle>
                            <div className="flex items-center justify-between mt-3 mb-1.5">
                              <span className="text-[9px] font-black text-blue-600 uppercase tracking-wide">
                                PROGRESS
                              </span>
                              <span className="text-[10px] font-black">
                                {path.progress || 0}%
                              </span>
                            </div>
                            <Progress
                              value={path.progress || 0}
                              className="h-2 rounded-full bg-blue-50"
                            />
                          </CardHeader>
                          <CardFooter className="p-4 pt-3">
                            <Button
                              className="w-full bg-slate-900 hover:bg-blue-600 text-white border-0 shadow-lg hover:shadow-blue-500/20 rounded-xl h-10 font-black text-xs transition-all"
                              asChild
                            >
                              <Link href={`/learning-paths/${path.id}`}>
                                <PlayCircle className="mr-2 h-5 w-5" />
                                Continue Learning
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-nowrap overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 gap-4 snap-x touch-pan-x md:grid md:grid-cols-2 md:mx-0 md:px-0 md:gap-4">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="block flex-none w-[280px] md:w-full snap-center"
                      >
                        <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 p-3 bg-white h-full">
                          <CardContent className="flex flex-col items-center justify-center p-16 text-center">
                            <div className="h-20 w-20 bg-white shadow-inner rounded-3xl flex items-center justify-center mb-6 border">
                              <BookOpen className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="text-2xl font-black mb-2 text-center">
                              Start Your Learning Journey!
                            </h3>
                            <p className="text-muted-foreground mb-8 max-w-sm font-medium leading-relaxed">
                              You haven't started any classes yet. Pick a course
                              that matches your interests and become an expert!
                            </p>
                            <Button
                              className="bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 px-10 h-14 rounded-full font-bold text-lg"
                              asChild
                            >
                              <Link href="/learning-paths">
                                Explore Course Catalog
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
            {/* Upcoming Sessions Section */}
            <section id="webinars" className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <h2 className="text-sm font-black tracking-widest uppercase text-slate-400 text-center w-full">
                  Upcoming Sessions
                </h2>
              </div>
              <div className="flex flex-nowrap overflow-x-auto no-scrollbar pb-6 -mx-4 px-4 gap-4 snap-x touch-pan-x md:grid md:grid-cols-2 lg:grid-cols-2 md:mx-0 md:px-0 md:gap-6">
                {upcomingWebinars.length > 0
                  ? upcomingWebinars.slice(0, 4).map((webinar) => (
                      <div
                        key={webinar.id}
                        className="block flex-none w-[280px] md:w-full snap-center"
                      >
                        <Card className="border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-white group h-full">
                          <div className="aspect-video w-full bg-slate-50 relative overflow-hidden">
                            {webinar.banner ? (
                              <img
                                src={getImageUrl(webinar.banner)}
                                alt={webinar.title}
                                className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Video className="h-10 w-10 text-slate-200" />
                              </div>
                            )}
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-rose-500 text-white border-none rounded-full px-3 py-1 font-black text-[10px] tracking-widest uppercase shadow-lg">
                                Live Soon
                              </Badge>
                            </div>
                          </div>
                          <CardHeader className="p-4 md:p-6 pb-2">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                              <Calendar className="h-3 w-3" />
                              {formatDate(webinar.scheduled_at)}
                            </div>
                            <CardTitle className="text-base md:text-lg font-black group-hover:text-rose-500 transition-colors line-clamp-1">
                              {webinar.title}
                            </CardTitle>
                            <p className="line-clamp-2 mt-1.5 text-xs md:text-sm font-medium text-slate-500">
                              {webinar.description}
                            </p>
                          </CardHeader>
                          {isStudent && (
                            <CardFooter className="p-4 md:p-6 pt-2 flex gap-2">
                              <Button
                                className="flex-1 bg-rose-500 hover:bg-rose-600 rounded-xl h-10 font-bold text-xs shadow-lg shadow-rose-100"
                                onClick={() => handleClaimWebinar(webinar.id)}
                              >
                                Book Ticket
                              </Button>
                              <Button
                                variant="outline"
                                className="rounded-xl h-10 w-10 p-0 border-slate-100 shrink-0"
                                asChild
                              >
                                <Link href={`/webinars/${webinar.id}`}>
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                              </Button>
                            </CardFooter>
                          )}
                        </Card>
                      </div>
                    ))
                  : [1, 2].map((i) => (
                      <div
                        key={i}
                        className="block flex-none w-[280px] md:w-full snap-center"
                      >
                        <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white/50 h-full">
                          <CardContent className="flex flex-col items-center justify-center p-12 text-center opacity-40">
                            <Video className="h-10 w-10 text-slate-300 mb-4" />
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                              No Sessions Found
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
              </div>
            </section>

            {isStudent && (
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="hidden md:block h-6 w-1 bg-indigo-500 rounded-full" />
                  <h2 className="text-xl md:text-2xl font-black tracking-tight text-center">
                    Recommendations
                  </h2>
                </div>
                <div className="flex flex-nowrap overflow-x-auto no-scrollbar pb-6 -mx-4 px-4 gap-4 snap-x touch-pan-x md:grid md:grid-cols-2 md:mx-0 md:px-0 md:gap-4">
                  {recommendedPaths.map((path: LearningPath) => (
                    <Link
                      key={path.id}
                      href={`/learning-paths/${path.id}`}
                      className="block flex-none w-[280px] md:w-full snap-center"
                    >
                      <Card className="border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-white group h-full p-4">
                        <div className="flex gap-4">
                          <div className="h-16 w-16 rounded-xl bg-slate-50 overflow-hidden shrink-0 relative border border-slate-100 shadow-inner">
                            {path.thumbnail ? (
                              <img
                                src={getImageUrl(path.thumbnail)}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                alt={path.title}
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-200">
                                <Star className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-1 py-0.5 min-w-0">
                            <h4 className="font-black text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                              {path.title}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                              {path.description}
                            </p>
                            <div className="flex items-center gap-2 pt-2">
                              <span className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                                <Zap className="h-3 w-3 fill-indigo-600" /> +500
                                XP
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="flex flex-col gap-6 lg:gap-8 px-4 md:px-0 min-w-0 w-full">
            {/* Global Leaderboard Card */}
            <Card className="rounded-xl border-none bg-slate-900 text-white overflow-hidden shadow-xl w-full">
              <div className="p-2.5 space-y-2.5">
                <div className="flex flex-col items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  <h3 className="font-black text-[10px] tracking-widest uppercase italic text-center">
                    Global Rank
                  </h3>
                </div>
                <div className="space-y-4">
                  {leaderboard.length > 0 ? (
                    leaderboard.slice(0, 5).map((u, i) => (
                      <Link
                        key={u.id}
                        href={`/portfolio/${u.username || u.id}`}
                      >
                        <div
                          className={cn(
                            "flex items-center justify-between p-1.5 rounded-lg transition-all hover:bg-white/10 group mb-1",
                            u.id === user?.id
                              ? "bg-indigo-600/30 border border-indigo-500/30"
                              : "bg-white/5",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                "text-xs font-black w-5 text-center",
                                i === 0
                                  ? "text-yellow-400"
                                  : i === 1
                                    ? "text-slate-300"
                                    : i === 2
                                      ? "text-amber-600"
                                      : "text-slate-500",
                              )}
                            >
                              {i + 1}
                            </span>
                            <div className="h-6 w-6 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-white/10">
                              {u.avatar ? (
                                <img
                                  src={getImageUrl(u.avatar)}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <UserIcon className="h-4 w-4 text-slate-500" />
                                </div>
                              )}
                            </div>
                            <div className="space-y-0.5 overflow-hidden">
                              <h5 className="text-[10px] font-bold leading-none truncate group-hover:text-indigo-400 transition-colors">
                                {u.name}
                              </h5>
                              <p className="text-[7px] font-black text-slate-500 uppercase tracking-tighter truncate">
                                {u.xp} XP
                              </p>
                            </div>
                          </div>
                          {i === 0 && (
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          )}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic text-center py-4">
                      Loading rankings...
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 rounded-lg h-7 text-[7px] font-black uppercase tracking-tighter"
                  asChild
                >
                  <Link href="/leaderboard">View All</Link>
                </Button>
              </div>
            </Card>

            {/* Info Staredge - Admin Announcements Only */}
            <div className="bg-indigo-600/5 rounded-xl p-3 border border-indigo-100 w-full">
              <div className="flex flex-col items-center mb-4">
                <h3 className="font-black text-[10px] tracking-widest uppercase text-slate-900 border-b-2 border-indigo-600 pb-1">
                  Staredge Info
                </h3>
              </div>
              <div className="space-y-3">
                {announcements.length > 0 ? (
                  announcements.slice(0, 4).map((item) => (
                    <div key={item.id} className="group cursor-pointer">
                      <a
                        href={item.link || "#"}
                        target={item.link ? "_blank" : undefined}
                        className="block"
                      >
                        <span className="inline-block px-2 py-0.5 bg-indigo-100 text-[9px] font-black text-indigo-700 rounded mb-1 tracking-widest leading-none uppercase">
                          {item.tag}
                        </span>
                        <h5 className="text-sm font-bold group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {item.title}
                        </h5>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {item.date || "Just now"}
                        </p>
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Stay tuned for the latest updates and launches!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
