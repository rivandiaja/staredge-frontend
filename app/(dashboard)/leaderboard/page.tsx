"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, getImageUrl } from "@/lib/api";
import { User } from "@/types/api";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trophy,
  Star,
  Zap,
  User as UserIcon,
  Crown,
  Medal,
  Search,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get("/leaderboard");
        setLeaderboard(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const filteredLeaderboard = leaderboard.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const topThree = filteredLeaderboard.slice(0, 3);
  const others = filteredLeaderboard.slice(3);

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Header section with back button */}
      <div className="bg-linear-to-br from-indigo-50/50 via-white to-slate-50/50 p-8 md:p-12 rounded-[3rem] border border-indigo-100/50 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all"
          >
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
            Back to Hub
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200">
              <Trophy className="h-7 w-7 text-white fill-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
              Global Hall of Fame
            </h1>
          </div>
          <p className="text-slate-500 text-lg font-bold max-w-xl">
            Celebrating the most dedicated minds in our professional guild.
          </p>
        </div>

        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <Input
            placeholder="Search legends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 h-16 bg-white border-none rounded-2xl shadow-2xl shadow-indigo-200/20 focus-visible:ring-2 focus-visible:ring-indigo-600 text-lg font-bold placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* Top 3 Podium */}
      {filteredLeaderboard.length >= 3 && !searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end pt-12 pb-4 px-4 md:px-0">
          {/* Silver - Rank 2 */}
          <div className="order-2 md:order-1 flex flex-col items-center group">
            <Link
              href={`/portfolio/${topThree[1].username || topThree[1].id}`}
              className="flex flex-col items-center w-full"
            >
              <div className="relative mb-6">
                <div className="h-28 w-28 md:h-24 md:w-24 rounded-[2rem] md:rounded-full bg-slate-50 border-4 border-slate-200 overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-110">
                  {topThree[1].avatar ? (
                    <img
                      src={getImageUrl(topThree[1].avatar)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-slate-100">
                      <UserIcon className="h-10 w-10 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-linear-to-br from-slate-200 to-slate-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <Medal className="h-5 w-5 text-white" />
                </div>
              </div>
              <h3 className="font-black text-xl text-slate-700 text-center tracking-tight">
                {topThree[1].name}
              </h3>
              <div className="flex items-center gap-1.5 mt-2 bg-slate-100 px-4 py-1 rounded-full">
                <Zap className="h-3 w-3 text-slate-500 fill-slate-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {topThree[1].xp?.toLocaleString()} XP
                </span>
              </div>
              <div className="w-full h-24 md:h-32 bg-linear-to-b from-slate-100 to-slate-200 mt-6 rounded-[2rem] md:rounded-t-3xl shadow-inner border-x border-t border-slate-300/50 flex items-center justify-center">
                <span className="text-4xl font-black text-slate-400/30 italic">
                  2nd
                </span>
              </div>
            </Link>
          </div>

          {/* Gold - Rank 1 */}
          <div className="order-1 md:order-2 flex flex-col items-center group">
            <Link
              href={`/portfolio/${topThree[0].username || topThree[0].id}`}
              className="flex flex-col items-center w-full"
            >
              <div className="relative mb-8 scale-110 md:scale-125">
                <div className="h-36 w-36 md:h-32 md:w-32 rounded-[2.5rem] md:rounded-full bg-yellow-50 border-4 border-yellow-400 overflow-hidden shadow-[0_0_60px_rgba(245,158,11,0.2)] transition-transform duration-500 group-hover:scale-110">
                  {topThree[0].avatar ? (
                    <img
                      src={getImageUrl(topThree[0].avatar)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-yellow-100/30">
                      <UserIcon className="h-14 w-14 text-yellow-500" />
                    </div>
                  )}
                </div>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                  <Crown className="h-12 w-12 text-yellow-400 fill-yellow-400 drop-shadow-lg animate-bounce" />
                </div>
                <div className="absolute -bottom-2 -right-2 h-14 w-14 bg-linear-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                  <Trophy className="h-7 w-7 text-white fill-white" />
                </div>
              </div>
              <h3 className="font-black text-2xl md:text-3xl text-slate-900 text-center tracking-tighter mb-1">
                {topThree[0].name}
              </h3>
              <div className="flex items-center gap-2 bg-linear-to-r from-yellow-400 to-amber-600 text-white px-5 py-2 rounded-full shadow-xl shadow-yellow-200 transition-all group-hover:shadow-yellow-300">
                <Zap className="h-4 w-4 fill-white" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">
                  {topThree[0].xp?.toLocaleString()} XP
                </span>
              </div>
              <div className="w-full h-40 md:h-48 bg-linear-to-b from-yellow-300 to-yellow-500 mt-8 rounded-[2rem] md:rounded-t-[3rem] shadow-2xl border-x border-t border-yellow-600 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 opacity-50 blur-2xl" />
                <span className="text-6xl md:text-7xl font-black text-yellow-900/20 italic relative z-10">
                  1st
                </span>
              </div>
            </Link>
          </div>

          {/* Bronze - Rank 3 */}
          <div className="order-3 flex flex-col items-center group">
            <Link
              href={`/portfolio/${topThree[2].username || topThree[2].id}`}
              className="flex flex-col items-center w-full"
            >
              <div className="relative mb-6">
                <div className="h-28 w-28 md:h-24 md:w-24 rounded-[2rem] md:rounded-full bg-orange-50 border-4 border-orange-300 overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-110">
                  {topThree[2].avatar ? (
                    <img
                      src={getImageUrl(topThree[2].avatar)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-orange-100/30">
                      <UserIcon className="h-10 w-10 text-orange-300" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-linear-to-br from-orange-300 to-orange-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <Medal className="h-5 w-5 text-white" />
                </div>
              </div>
              <h3 className="font-black text-xl text-slate-700 text-center tracking-tight">
                {topThree[2].name}
              </h3>
              <div className="flex items-center gap-1.5 mt-2 bg-orange-50 px-4 py-1 rounded-full border border-orange-100">
                <Zap className="h-3 w-3 text-orange-500 fill-orange-500" />
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                  {topThree[2].xp?.toLocaleString()} XP
                </span>
              </div>
              <div className="w-full h-16 md:h-24 bg-linear-to-b from-orange-100 to-orange-200 mt-6 rounded-[2rem] md:rounded-t-3xl shadow-inner border-x border-t border-orange-300/50 flex items-center justify-center">
                <span className="text-3xl font-black text-orange-400/30 italic">
                  3rd
                </span>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Full Leaderboard List */}
      <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden mx-4 md:mx-0">
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    Rank
                  </th>
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    Legend
                  </th>
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    Progress Metric (XP)
                  </th>
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">
                    Activity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50/50">
                {loading
                  ? [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-8 py-6">
                          <div className="h-4 w-4 bg-slate-100 rounded" />
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-slate-100 rounded-full" />
                            <div className="h-4 w-32 bg-slate-100 rounded" />
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="h-4 w-16 bg-slate-100 rounded" />
                        </td>
                        <td className="px-8 py-6">
                          <div className="h-4 w-4 bg-slate-100 rounded ml-auto" />
                        </td>
                      </tr>
                    ))
                  : filteredLeaderboard.map((u, i) => (
                      <tr
                        key={u.id}
                        className={cn(
                          "group hover:bg-indigo-50/30 transition-all duration-300",
                          u.id === user?.id && "bg-indigo-50/50",
                        )}
                      >
                        <td className="px-8 py-6">
                          <span
                            className={cn(
                              "text-lg font-black italic",
                              i === 0
                                ? "text-yellow-500"
                                : i === 1
                                  ? "text-slate-400"
                                  : i === 2
                                    ? "text-orange-500"
                                    : "text-slate-300",
                            )}
                          >
                            #{i + 1}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="h-12 w-12 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-md group-hover:scale-110 transition-transform">
                                {u.avatar ? (
                                  <img
                                    src={getImageUrl(u.avatar)}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <UserIcon className="h-6 w-6 text-slate-400" />
                                  </div>
                                )}
                              </div>
                              {u.id === user?.id && (
                                <div className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white" />
                              )}
                            </div>
                            <div>
                              <h5 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
                                {u.name}
                                {u.id === user?.id && (
                                  <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase italic">
                                    You
                                  </span>
                                )}
                              </h5>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                @{u.username || "staredge_member"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-indigo-600 fill-indigo-600" />
                              <span className="text-xl font-black text-slate-900">
                                {u.xp?.toLocaleString()}
                              </span>
                            </div>
                            <div className="h-1.5 w-32 bg-slate-100 rounded-full mt-2 overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{
                                  width: `${Math.min(100, ((u.xp || 0) / (leaderboard[0]?.xp || 1)) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-indigo-600 shadow-sm border border-transparent hover:border-indigo-100"
                            asChild
                          >
                            <Link href={`/portfolio/${u.username || u.id}`}>
                              View Legend
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                {!loading && filteredLeaderboard.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-24 text-center">
                      <div className="h-20 w-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-dashed border-slate-200 shadow-inner">
                        <Search className="h-10 w-10 text-slate-200" />
                      </div>
                      <h4 className="font-black text-slate-900 text-2xl tracking-tighter">
                        No legends found
                      </h4>
                      <p className="text-slate-400 font-medium mt-2">
                        Try refining your search parameters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Optimized List */}
          <div className="md:hidden divide-y divide-slate-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="p-6 animate-pulse flex items-center gap-4"
                >
                  <div className="h-10 w-10 bg-slate-100 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-slate-100 rounded" />
                    <div className="h-3 w-20 bg-slate-100 rounded" />
                  </div>
                </div>
              ))
            ) : filteredLeaderboard.length > 0 ? (
              filteredLeaderboard.map((u, i) => (
                <Link key={u.id} href={`/portfolio/${u.username || u.id}`}>
                  <div
                    className={cn(
                      "p-6 flex items-center justify-between transition-colors",
                      u.id === user?.id
                        ? "bg-indigo-50/50"
                        : "active:bg-slate-50",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="h-14 w-14 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-md">
                          {u.avatar ? (
                            <img
                              src={getImageUrl(u.avatar)}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-300">
                              <UserIcon className="h-7 w-7" />
                            </div>
                          )}
                        </div>
                        <div
                          className={cn(
                            "absolute -top-2 -left-2 h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-black border-2 border-white shadow-lg",
                            i === 0
                              ? "bg-yellow-400 text-white"
                              : i === 1
                                ? "bg-slate-300 text-white"
                                : i === 2
                                  ? "bg-orange-400 text-white"
                                  : "bg-white text-slate-400",
                          )}
                        >
                          #{i + 1}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-black text-slate-900 tracking-tight flex items-center gap-2">
                          {u.name}
                          {u.id === user?.id && (
                            <span className="text-[8px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-black uppercase">
                              Me
                            </span>
                          )}
                        </h5>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Zap className="h-3 w-3 text-indigo-500 fill-indigo-500" />
                          <span className="text-sm font-black text-slate-900 tracking-tight">
                            {u.xp?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-20 text-center px-6">
                <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                  <Search className="h-8 w-8 text-slate-200" />
                </div>
                <h4 className="font-black text-slate-900 text-lg">
                  No results found
                </h4>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
