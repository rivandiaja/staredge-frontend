"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock,
  Eye,
  Edit,
  Trash2,
  Layers,
  LayoutGrid,
  List,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { api, getImageUrl } from "@/lib/api";
import { LearningPath } from "@/types/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

export default function AdminLearningPathsPage() {
  const { user } = useAuth();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savingXpId, setSavingXpId] = useState<number | null>(null);

  const fetchPaths = async () => {
    try {
      const response = await api.get<{ data: LearningPath[] }>(
        "/cms/author-courses",
      );
      setPaths(response.data.data);
    } catch (error) {
      console.error("Failed to fetch paths", error);
      toast.error("Failed to load course catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaths();
  }, []);

  const handleUpdateXP = async (id: number, xp: number) => {
    if (isNaN(xp)) return;
    setSavingXpId(id);
    try {
      await api.put(`/cms/learning-paths/${id}`, { xp: xp });
      toast.success(`XP reward updated to ${xp}`);
      await fetchPaths();
    } catch (error: any) {
      console.error("XP Update Error:", error.response?.data || error.message);
      toast.error(
        `Failed to update XP: ${error.response?.data?.error || "Server Error"}`,
      );
    } finally {
      setSavingXpId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this course?"))
      return;

    try {
      await api.delete(`/cms/learning-paths/${id}`);
      toast.success("Course successfully deleted");
      fetchPaths();
    } catch (error: any) {
      console.error("Delete Error:", error.response?.data || error.message);
      toast.error(
        `Failed to delete course: ${error.response?.data?.error || "Server Error"}`,
      );
    }
  };

  const handleUpdateStatus = async (id: number, currentStatus: string) => {
    const newStatus =
      currentStatus === "published" || currentStatus === "PUBLISHED"
        ? "draft"
        : "published";
    try {
      await api.put(`/cms/learning-paths/${id}`, { status: newStatus });
      toast.success(
        `Course status successfully changed to ${newStatus.toUpperCase()}`,
      );
      fetchPaths();
    } catch (error: any) {
      console.error(
        "Status Update Error:",
        error.response?.data || error.message,
      );
      toast.error(
        `Failed to change status: ${error.response?.data?.error || "Server Error"}`,
      );
    }
  };

  const filteredPaths = paths.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  const totalXP = paths.reduce((acc, p) => acc + (p.xp || 0), 0);
  const publishedCount = paths.filter(
    (p) => p.status === "published",
  ).length;

  const pathStats = [
    {
      label: "Global Assets",
      value: paths.length,
      icon: Layers,
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
      value: paths.length - publishedCount,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Total XP Bank",
      value: totalXP,
      icon: TrendingUp,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-10 pb-20 max-w-7xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Global Catalog 📚
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Status moderation and XP reward settings (Admin Only).
          </p>
        </div>
      </div>

      {/* Stats Slider on Mobile */}
      <div className="flex overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 gap-4 snap-x">
        {pathStats.map((stat, i) => (
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <Input
            placeholder="Search for course titles..."
            className="pl-12 rounded-2xl border-slate-200 h-12 bg-white focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[400px] w-full bg-slate-100 rounded-4xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPaths.map((path) => (
            <Card
              key={path.id}
              className="border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-3xl md:rounded-[2.5rem] overflow-hidden bg-white group flex flex-col"
            >
              <div className="aspect-16/10 w-full bg-slate-100 relative overflow-hidden group-hover:shadow-lg transition-all duration-500">
                <div className="absolute top-6 right-6 z-10">
                  <Link
                    href={`/learning-paths/${path.id}`}
                    className="h-10 w-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-xl flex items-center justify-center text-white transition-all transform hover:scale-110 border border-white/20"
                    title="Preview Course"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                </div>

                <Link
                  href={`/learning-paths/${path.id}`}
                  className="absolute inset-0 z-0"
                >
                  {path.thumbnail && (
                    <img
                      src={getImageUrl(path.thumbnail)}
                      alt={path.title}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60" />
                </Link>

                {/* Status Badge */}
                <div className="absolute top-6 left-6 flex gap-2">
                  <Badge
                    className={cn(
                      "rounded-lg px-3 py-1 font-black text-[10px] tracking-widest border-none",
                      path.status === "published"
                        ? "bg-emerald-500 text-white"
                        : "bg-amber-500 text-white",
                    )}
                  >
                    {path.status?.toUpperCase()}
                  </Badge>
                  <Badge className="bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-lg px-3 py-1 font-black text-[10px] tracking-widest">
                    ID: {path.id}
                  </Badge>
                </div>

                <div className="absolute bottom-6 left-6 flex items-center gap-2">
                  <div
                    className={cn(
                      "rounded-lg px-3 py-1 font-black text-xs flex items-center gap-1.5 shadow-lg",
                      user?.role === "admin"
                        ? "bg-rose-600 text-white"
                        : "bg-indigo-600 text-white",
                    )}
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    {path.xp || 0} XP
                  </div>
                  <Badge
                    className={cn(
                      "bg-white border-none rounded-lg px-2 py-1 font-black text-[9px]",
                      user?.role === "admin"
                        ? "text-rose-600"
                        : "text-indigo-600",
                    )}
                  >
                    {user?.role === "admin"
                      ? "ADMIN PREVIEW"
                      : "AUTHOR PREVIEW"}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6 md:p-8 flex-1 flex flex-col">
                <div className="flex-1 space-y-4">
                  <Link href={`/learning-paths/${path.id}`}>
                    <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors cursor-pointer">
                      {path.title}
                    </h3>
                  </Link>

                  <div className="bg-slate-50 rounded-2xl p-4 md:p-5 space-y-4 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Set XP Reward
                      </p>
                      <Badge className="bg-indigo-100 text-indigo-700 border-none text-[10px] h-5">
                        REWARD
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          type="number"
                          defaultValue={path.xp}
                          className="h-11 pl-10 rounded-xl border-slate-200 font-bold text-sm bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                          placeholder="0"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleUpdateXP(
                                path.id,
                                parseInt((e.target as HTMLInputElement).value),
                              );
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                        />
                      </div>
                      <Button
                        size="sm"
                        className="h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold shadow-md shadow-indigo-200"
                        onClick={(e) => {
                          const container = e.currentTarget.parentElement;
                          const input = container?.querySelector(
                            "input",
                          ) as HTMLInputElement;
                          if (input) {
                            handleUpdateXP(path.id, parseInt(input.value));
                          }
                        }}
                        disabled={savingXpId === path.id}
                      >
                        {savingXpId === path.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Save"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50 flex items-center gap-3">
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 h-12 rounded-2xl font-black text-xs border-slate-200 transition-all",
                      path.status === "published"
                        ? "hover:bg-amber-50 hover:text-amber-600"
                        : "hover:bg-emerald-50 hover:text-emerald-600",
                    )}
                    onClick={() =>
                      handleUpdateStatus(path.id, path.status || "draft")
                    }
                  >
                    {path.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-12 w-12 rounded-2xl text-red-400 hover:text-red-500 hover:bg-red-50"
                    onClick={() => handleDelete(path.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
