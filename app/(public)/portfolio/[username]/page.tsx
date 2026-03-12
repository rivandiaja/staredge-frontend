"use client";

import { useEffect, useState, use } from "react";
import { api, getImageUrl } from "@/lib/api";
import { User, Certificate, LearningPath } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  BookOpen,
  Loader2,
  TrendingUp,
  Briefcase,
  MapPin,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Zap,
  Layout,
  Star,
  ShieldCheck,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PortfolioData {
  user: User;
  rank: number;
  certificates: Certificate[];
  courses: (LearningPath & { user_progress: number })[];
}

export default function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await api.get(`/profile/${username}`);
        const user = res.data.user;

        // If the user is an admin or author, they should use the /author/[username] portfolio view
        if (user && (user.role === "admin" || user.role === "author")) {
          router.replace(`/author/${username}`);
          return;
        }

        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch portfolio", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [username, router]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-white rounded-3xl shadow-2xl flex items-center justify-center mx-auto">
            <Sparkles className="h-8 w-8 text-indigo-600 animate-pulse" />
          </div>
          <p className="font-black text-slate-400 uppercase tracking-widest text-xs">
            Unlocking Portfolio...
          </p>
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Portfolio Not Found
        </h1>
      </div>
    );

  const { user } = data;
  const certificates = data.certificates || [];
  const courses = data.courses || [];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Premium Hero Section */}
      <div className="relative bg-white border-b overflow-hidden pt-12 pb-12 md:pt-32 md:pb-24">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[80%] bg-linear-to-br from-indigo-100/50 to-transparent blur-[120px]" />
          <div className="absolute top-[20%] -right-[5%] w-[40%] h-[60%] bg-linear-to-tl from-rose-100/50 to-transparent blur-[100px]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center">
            <div className="relative group">
              <div className="h-40 w-40 md:h-64 md:w-64 rounded-[2.5rem] md:rounded-[3.5rem] bg-white p-1.5 md:p-2 shadow-2xl rotate-3 transition-transform group-hover:rotate-0 duration-500">
                <div className="w-full h-full rounded-[2.2rem] md:rounded-[3rem] bg-slate-100 overflow-hidden border-4 border-slate-50">
                  {user.avatar ? (
                    <img
                      src={getImageUrl(user.avatar)}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={user.name}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Layout className="h-16 w-16 md:h-20 md:w-20 text-slate-200" />
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 md:-bottom-4 md:-right-4 bg-emerald-500 text-white p-3 md:p-4 rounded-xl md:rounded-3xl shadow-2xl animate-bounce">
                <ShieldCheck className="h-6 w-6 md:h-8 md:w-8" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4 md:space-y-6">
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Badge className="bg-indigo-600 text-white border-none rounded-full px-4 py-1.5 font-black text-[10px] tracking-widest uppercase shadow-lg shadow-indigo-200">
                  {user.role} achievement
                </Badge>
                <Badge className="bg-slate-100 text-slate-600 border-none rounded-full px-4 py-1.5 font-black text-[10px] tracking-widest uppercase">
                  LVL {((user.xp || 0) / 1000).toFixed(0)} Explorer
                </Badge>
              </div>

              <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                {user.name}
              </h1>

              <p className="text-base md:text-2xl font-bold text-slate-500 max-w-2xl leading-relaxed px-4 md:px-0">
                {user.author_profile?.bio ||
                  "A dedicated learner making progress through the Staredge curriculum."}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-8 pt-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center shadow-xs">
                    <Briefcase className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest">
                      Occupation
                    </p>
                    <p className="text-xs font-black text-slate-700 tracking-tight">
                      {user.author_profile?.occupation || "Learner"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center shadow-xs">
                    <Star className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest">
                      Reputation
                    </p>
                    <p className="text-xs font-black text-slate-700 tracking-tight">
                      {user.xp?.toLocaleString() || 0} XP Points
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20 space-y-20">
        {/* Core Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2 md:px-0">
          {[
            {
              label: "Tracks Taken",
              value: courses.length,
              icon: BookOpen,
              color: "bg-indigo-600",
            },
            {
              label: "Certifications",
              value: certificates.length,
              icon: Award,
              color: "bg-amber-500",
            },
            {
              label: "Milestones",
              value: courses.filter((c) => c.user_progress === 100).length,
              icon: Zap,
              color: "bg-emerald-500",
            },
            {
              label: "Global Rank",
              value:
                user.role === "admin" || user.role === "author"
                  ? "Elite"
                  : `#${data.rank}`,
              icon: TrendingUp,
              color: "bg-rose-500",
            },
          ].map((stat, i) => (
            <Card
              key={i}
              className="rounded-3xl md:rounded-[2.5rem] border-none shadow-xl shadow-slate-200/40 p-5 md:p-6 flex flex-col items-center justify-center text-center bg-white group hover:-translate-y-2 transition-transform duration-300"
            >
              <div
                className={cn(
                  "h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 shadow-lg",
                  stat.color,
                )}
              >
                <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {stat.value}
              </p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
                {stat.label}
              </p>
            </Card>
          ))}
        </div>

        {/* Certificates Showcase */}
        <div className="space-y-8 md:space-y-10">
          <div className="flex items-center gap-4 px-2 md:px-0">
            <div className="h-12 w-12 bg-white shadow-md rounded-2xl flex items-center justify-center text-amber-500 border border-amber-50">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                Award Gallery
              </h2>
              <p className="text-xs md:text-lg font-bold text-slate-400">
                Verified professional milestones.
              </p>
            </div>
          </div>

          {certificates.length > 0 ? (
            <div className="flex flex-nowrap overflow-x-auto no-scrollbar pb-8 -mx-4 px-4 gap-4 snap-x touch-pan-x md:grid md:grid-cols-3 md:mx-0 md:px-0 md:gap-8">
              {certificates.map((cert) => (
                <Card
                  key={cert.id}
                  className="relative group flex-none w-[280px] md:w-full snap-center overflow-hidden rounded-[2.5rem] md:rounded-4xl border-none shadow-xl shadow-slate-200/50 bg-white aspect-4/5 flex flex-col items-center justify-center text-center p-8 md:p-10 hover:scale-[1.02] transition-transform duration-500"
                >
                  <div className="absolute inset-x-0 top-0 h-3 bg-linear-to-r from-amber-400 to-amber-600" />

                  <div className="relative mb-6 md:mb-10">
                    <div className="h-20 w-20 md:h-28 md:w-28 bg-amber-50 rounded-full flex items-center justify-center relative z-10 shadow-inner">
                      <Award className="h-10 w-10 md:h-14 md:w-14 text-amber-500" />
                    </div>
                    <Sparkles className="absolute -top-3 -right-3 md:-top-4 md:-right-4 h-8 w-8 md:h-12 md:w-12 text-amber-200 animate-pulse" />
                  </div>

                  <h3 className="text-lg md:text-2xl font-black text-slate-900 leading-tight mb-4 tracking-tight">
                    {cert.learning_path?.title || "Course Certificate"}
                  </h3>

                  <div className="space-y-1 mb-6 md:mb-8">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                      Verifiable Code
                    </p>
                    <Badge
                      variant="secondary"
                      className="bg-slate-50 text-slate-600 font-mono text-[9px] rounded-lg px-3"
                    >
                      {cert.certificate_code}
                    </Badge>
                  </div>

                  <div className="mt-auto w-full pt-4 md:pt-6 border-t border-slate-50 flex items-center justify-end">
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase text-slate-300">
                        Issued
                      </p>
                      <p className="text-xs md:text-sm font-black text-slate-700">
                        {new Date(cert.issued_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-slate-950/95 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-8 md:p-10 space-y-6 text-white text-center">
                    <ShieldCheck className="h-12 w-12 md:h-16 md:w-16 text-emerald-400" />
                    <div className="space-y-2">
                      <h4 className="text-xl md:text-2xl font-black tracking-tight">
                        Verified Credential
                      </h4>
                      <p className="text-[10px] md:text-sm font-medium opacity-80 leading-relaxed">
                        Blockchain-verified and cryptographically signed by
                        Staredge.
                      </p>
                    </div>
                    <Button
                      className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-widest transition-colors shadow-xl shadow-black/20"
                      asChild
                    >
                      <Link href={`/certificates/${cert.certificate_code}`}>
                        View Original
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] p-20 text-center border-4 border-dashed border-slate-100">
              <Award className="h-20 w-20 text-slate-100 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">
                No certifications yet
              </h3>
              <p className="text-slate-400 mt-2 font-bold italic">
                Curating excellence takes time. Stay tuned.
              </p>
            </div>
          )}
        </div>

        {/* Course History Section */}
        <div className="space-y-10 pb-20">
          <div className="flex items-center gap-4 px-2 md:px-0">
            <div className="h-12 w-12 bg-white shadow-md rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-50">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                Academic Journey
              </h2>
              <p className="text-xs md:text-lg font-bold text-slate-400">
                Educational mastery and skill acquisition.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:gap-10">
            {courses.map((course, idx) => (
              <div
                key={course.id}
                className="group relative flex flex-col md:flex-row gap-6 md:gap-10 items-center px-4 md:px-0"
              >
                {/* Vertical Line for Journey */}
                {idx !== courses.length - 1 && (
                  <div className="absolute left-[50%] md:left-[60px] top-24 bottom-0 w-1 bg-slate-200 hidden md:block" />
                )}

                <div className="relative z-10 h-24 w-24 md:h-32 md:w-32 shrink-0 rounded-3xl md:rounded-[2.5rem] bg-white border-4 md:border-8 border-slate-50 hidden md:flex items-center justify-center shadow-xl">
                  <div className="h-10 w-10 md:h-12 md:w-12 bg-linear-to-br from-indigo-500 to-indigo-700 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-white text-lg md:text-xl shadow-lg">
                    {idx + 1}
                  </div>
                </div>

                <Link
                  href={`/learning-paths/${course.id}`}
                  className="flex-1 w-full"
                >
                  <Card className="rounded-3xl md:rounded-[3rem] border-none shadow-xl shadow-slate-200/40 bg-white overflow-hidden p-6 md:p-12 hover:shadow-indigo-100 transition-shadow transition-transform active:scale-[0.98]">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                      <div className="h-28 w-28 md:h-48 md:w-48 bg-slate-100 rounded-2xl md:rounded-[2.5rem] overflow-hidden shrink-0 border-4 border-slate-50 mx-auto md:mx-0">
                        <img
                          src={getImageUrl(course.thumbnail)}
                          className="w-full h-full object-cover"
                          alt={course.title}
                        />
                      </div>
                      <div className="flex-1 space-y-4 md:space-y-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="text-center md:text-left">
                            <h3 className="text-xl md:text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                              {course.title}
                            </h3>
                            <p className="text-sm md:text-lg font-medium text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                              {course.description}
                            </p>
                          </div>
                          <div className="text-center shrink-0 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                            <div className="text-2xl md:text-4xl font-black text-indigo-600 leading-none tracking-tighter">
                              {course.user_progress}%
                            </div>
                            <p className="text-[8px] md:text-[10px] font-black uppercase text-indigo-400 mt-1 tracking-widest leading-none">
                              Complete
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-[9px] md:text-xs font-black uppercase text-slate-300 tracking-widest">
                            <span>Academic Progress</span>
                            <span>
                              {course.user_progress === 100
                                ? "Mastered"
                                : "In Progress"}
                            </span>
                          </div>
                          <Progress
                            value={course.user_progress}
                            className="h-2.5 md:h-4 rounded-full bg-slate-50 [&>div]:bg-indigo-600"
                          />
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                          <Badge className="bg-slate-900 text-white rounded-full px-5 py-1.5 border-none font-black text-[9px] uppercase tracking-widest">
                            {course.xp} XP Points
                          </Badge>
                          {course.user_progress === 100 && (
                            <Badge className="bg-emerald-500 text-white rounded-full px-5 py-1.5 border-none flex items-center gap-2 font-black text-[9px] uppercase tracking-widest">
                              <CheckCircle2 className="h-3 w-3" /> COMPLETED
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
