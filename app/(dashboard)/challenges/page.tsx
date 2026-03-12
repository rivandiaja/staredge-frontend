"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, getImageUrl } from "@/lib/api";
import { Challenge } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Search,
  Loader2,
  Trophy,
  Users,
  Clock,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await api.get("/challenges");
        setChallenges(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch challenges", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  const filteredChallenges = challenges.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  const activeChallenges = filteredChallenges.filter((c) => !c.is_completed);
  const completedChallenges = filteredChallenges.filter((c) => c.is_completed);

  const ChallengeCard = ({ challenge }: { challenge: Challenge }) => (
    <Link
      href={`/challenges/${challenge.id}`}
      className="block flex-none w-[280px] md:w-full snap-center"
    >
      <Card className="group rounded-3xl border-none shadow-md overflow-hidden bg-white hover:shadow-lg transition-all duration-500 h-full flex flex-col">
        <div className="aspect-video relative overflow-hidden bg-slate-100">
          {challenge.thumbnail ? (
            <img
              src={getImageUrl(challenge.thumbnail)}
              alt={challenge.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Zap className="h-10 w-10 text-slate-200" />
            </div>
          )}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="flex gap-2">
              <Badge className="bg-yellow-500 text-white border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg">
                {challenge.difficulty}
              </Badge>
            </div>
            {challenge.is_completed && (
              <Badge className="bg-emerald-500 text-white border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Solved
              </Badge>
            )}
          </div>
        </div>

        <CardHeader className="p-4 md:p-6 flex-1">
          <div className="flex items-center gap-2 mb-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <Zap className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            Daily Mission
          </div>
          <CardTitle className="text-base md:text-lg font-black group-hover:text-yellow-600 transition-colors line-clamp-1 tracking-tight">
            {challenge.title}
          </CardTitle>
          <p className="line-clamp-2 mt-1 text-xs md:text-sm font-medium text-slate-500 leading-relaxed">
            {challenge.description ||
              "Take on this challenge to sharpen your skills."}
          </p>

          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Users className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-wider">
                42 Solved
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-wider">
                ~10 Mins
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );

  const Section = ({ title, challenges, icon: Icon, emptyMsg }: any) => {
    if (challenges.length === 0 && searchQuery) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-yellow-600">
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            {title}
            <span className="text-sm font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
              {challenges.length}
            </span>
          </h2>
        </div>
        {challenges.length > 0 ? (
          <div className="flex flex-nowrap overflow-x-auto no-scrollbar pb-6 -mx-4 px-4 gap-4 snap-x touch-pan-x md:grid md:grid-cols-2 lg:grid-cols-3 md:mx-0 md:px-0 md:gap-8">
            {challenges.map((c: any) => (
              <ChallengeCard key={c.id} challenge={c} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-3xl px-6">
            <p className="text-slate-400 font-bold">{emptyMsg}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-20">
      {/* Header Section */}
      <div className="bg-yellow-50/50 p-8 md:p-12 rounded-[3.5rem] border border-yellow-100/50 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-200">
              <Zap className="h-6 w-6 text-white fill-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
              Daily Missions
            </h1>
          </div>
          <p className="text-slate-500 text-lg font-bold max-w-xl">
            Test your skills with short, interactive tasks. Level up your
            profile and earn XP faster.
          </p>
        </div>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-yellow-600 transition-colors" />
          <Input
            placeholder="Search missions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 h-16 bg-white border-none rounded-2xl shadow-2xl shadow-yellow-200/20 focus-visible:ring-2 focus-visible:ring-yellow-500 text-lg font-bold placeholder:text-slate-300"
          />
        </div>
      </div>

      <div className="space-y-24 px-4">
        {activeChallenges.length > 0 && (
          <Section
            title="Active Missions"
            challenges={activeChallenges}
            icon={Zap}
            emptyMsg="You've completed all active missions! Check back soon for more."
          />
        )}

        {completedChallenges.length > 0 && (
          <Section
            title="Mission History"
            challenges={completedChallenges}
            icon={Trophy}
            emptyMsg="Finish a challenge to see your mission history here!"
          />
        )}

        {searchQuery && filteredChallenges.length === 0 && (
          <div className="py-20 text-center space-y-6">
            <div className="h-20 w-20 bg-white shadow-inner rounded-3xl flex items-center justify-center mb-6 border mx-auto">
              <Trophy className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-6">
              No missions found
            </h3>
            <p className="text-slate-500 font-bold">
              We couldn't find any missions matching "{searchQuery}"
            </p>
            <Button
              variant="link"
              onClick={() => setSearchQuery("")}
              className="text-yellow-600 font-black uppercase tracking-widest"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
