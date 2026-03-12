"use client";

import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  UserCheck,
  FileText,
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  ExternalLink,
  Video,
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

interface AdminStats {
  total_users: number;
  total_authors: number;
  total_courses: number;
  published_courses: number;
  draft_courses: number;
  total_webinars: number;
  pending_webinars: number;
  rejected_webinars: number;
  total_certificates: number;
  recent_users: any[];
  recent_authors: any[];
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get<{ data: AdminStats }>("/admin/stats");
        setStats(response.data.data);
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">
            Loading statistical center data...
          </p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: "Total Students",
      value: stats.total_users,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Authors",
      value: stats.total_authors,
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Global Courses",
      value: stats.total_courses,
      icon: BookOpen,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Total Webinars",
      value: stats.total_webinars,
      icon: Video,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      label: "Certificates Issued",
      value: stats.total_certificates,
      icon: Award,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-10 pb-20 max-w-7xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Admin Central 🛡️
          </h1>
          <p className="text-slate-500 font-medium">
            Real-time monitoring of the Staredge system.
          </p>
        </div>
        <div className="flex gap-3">
          {/* Action buttons removed for cleaner header as links are available in cards */}
        </div>
      </div>

      {/* Primary Stats Grid - Horizontal Slider on Mobile */}
      <div className="flex overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 snap-x touch-auto">
        {statCards.map((stat, i) => (
          <Card
            key={i}
            className="border-none shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden group min-w-[160px] xs:min-w-[200px] md:min-w-0 snap-center"
          >
            <CardContent className="p-5 flex flex-col items-center text-center gap-3">
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
          {/* Courses Status Overview */}
          <Card className="border-none shadow-sm rounded-3xl md:rounded-4xl p-5 md:p-8 bg-white">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    System Overview
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                    Content Status
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
              {/* Courses */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-black text-slate-900 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-amber-600" /> Courses
                  </h4>
                  <Link
                    href="/admin/learning-paths"
                    className="text-[10px] font-black text-indigo-600"
                  >
                    MANAGE
                  </Link>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <span className="text-xs font-bold text-emerald-700">
                      Published
                    </span>
                    <span className="text-xl font-black text-emerald-900">
                      {stats.published_courses}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-bold text-slate-500">
                      Draft / Review
                    </span>
                    <span className="text-xl font-black text-slate-900">
                      {stats.draft_courses}
                    </span>
                  </div>
                </div>
              </div>

              {/* Webinars */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-black text-slate-900 flex items-center gap-2">
                    <Video className="h-4 w-4 text-rose-600" /> Webinars
                  </h4>
                  <Link
                    href="/admin/webinars"
                    className="text-[10px] font-black text-indigo-600"
                  >
                    APPROVE
                  </Link>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 border border-amber-100">
                    <span className="text-xs font-bold text-amber-700">
                      Pending Approval
                    </span>
                    <span className="text-xl font-black text-amber-900">
                      {stats.pending_webinars}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-bold text-slate-500">
                      Total Approved
                    </span>
                    <span className="text-xl font-black text-slate-900">
                      {stats.total_webinars -
                        stats.pending_webinars -
                        stats.rejected_webinars}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="space-y-6 md:space-y-8">
          <Card className="border-none shadow-sm rounded-3xl md:rounded-4xl p-6 md:p-8 bg-slate-900 text-white">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
              <UserCheck className="h-6 w-6 text-indigo-400" /> New Authors
            </h3>
            <div className="space-y-5">
              {stats.recent_authors.length > 0 ? (
                stats.recent_authors.map((auth: any) => (
                  <div
                    key={auth.id}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-indigo-500/20 rounded-xl flex items-center justify-center font-bold text-indigo-300">
                        {auth.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm leading-none">
                          {auth.name}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">
                          {auth.email}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/admin/authors`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ExternalLink className="h-4 w-4 text-slate-500" />
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 font-medium">
                  No new authors yet.
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-8 border-slate-700 bg-white/5 text-slate-300 hover:bg-white/10 rounded-2xl h-12 text-xs font-bold"
              asChild
            >
              <Link href="/admin/authors">Manage All Authors</Link>
            </Button>
          </Card>

          <div className="bg-indigo-600/5 rounded-3xl md:rounded-4xl p-6 md:p-8 border border-indigo-100">
            <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" /> New Users
            </h3>
            <div className="space-y-4">
              {stats.recent_users.slice(0, 4).map((u: any) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-white border border-indigo-100 rounded-full flex items-center justify-center text-[10px] font-black text-indigo-600">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-xs truncate">
                      {u.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      {u.email}
                    </p>
                  </div>
                  <Badge className="bg-indigo-100/50 text-indigo-700 text-[9px] h-5 rounded-md font-black border-none">
                    STUDENT
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
