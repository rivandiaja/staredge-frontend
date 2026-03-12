"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  ChevronLeft,
  Play,
  Lock,
  CheckCircle2,
  Eye,
  BookOpen,
  Clock,
  Layout,
  ArrowRight,
  Sparkles,
  Search,
  PlayCircle,
  Edit2,
} from "lucide-react";
import { api, getImageUrl } from "@/lib/api";
import { LearningPath, Module } from "@/types/api";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { ModuleAssignment } from "@/components/learning/module-assignment";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LearningPathDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const isReviewer = user?.role === "admin" || user?.role === "author";

  const [path, setPath] = useState<LearningPath | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);

  const fetchData = async () => {
    try {
      const pathRes = await api.get(`/learning-paths/${id}`);
      const responseData = pathRes.data as any;
      let pathData: LearningPath | null = null;
      let modulesData: Module[] = [];

      if (responseData && responseData.title) {
        pathData = responseData;
        modulesData = responseData.modules || [];
      } else if (responseData && responseData.data) {
        pathData = responseData.data;
        modulesData =
          responseData.data.modules || responseData.data.Modules || [];
      }

      setPath(pathData);
      setModules(modulesData);
    } catch (error) {
      console.error("Failed to fetch learning path", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleClaimCertificate = async () => {
    setIsClaiming(true);
    try {
      const res = await api.post(`/learning-paths/${id}/claim-certificate`);
      toast.success("Certificate claimed successfully!");
      if (res.data?.data?.certificate_code) {
        router.push(`/certificates/${res.data.data.certificate_code}`);
      } else {
        router.push("/my-certificates");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 200) {
        // Sometimes 200 is used for "already claimed"
        toast.info("Certificate already claimed.");
        return;
      }
      toast.error(
        "Failed to claim certificate. Ensure all modules are completed.",
      );
    } finally {
      setIsClaiming(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="text-slate-400 font-bold animate-bounce">
            Designing your curriculum...
          </p>
        </div>
      </div>
    );

  if (!path)
    return <div className="p-10 text-center font-bold">Path not found</div>;

  const totalStages = modules.reduce(
    (acc, mod) => acc + (mod.stages?.length || 0),
    0,
  );
  const completedStages = modules.reduce(
    (acc, mod) => acc + (mod.stages?.filter((s) => s.is_completed).length || 0),
    0,
  );
  const progressValue = Math.round(path.progress || 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-6">
        <Button
          variant="ghost"
          className="w-fit -ml-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl"
          asChild
        >
          <Link href="/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>

        {isReviewer && (
          <div className="bg-slate-900 text-white p-4 rounded-3xl flex items-center justify-between shadow-2xl shadow-slate-200">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-white/10 rounded-2xl flex items-center justify-center">
                <Eye className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-indigo-400">
                  Moderator Mode
                </p>
                <p className="text-sm font-bold">
                  {user?.role === "admin"
                    ? "Full System Bypass"
                    : "Author Review Mode"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-white/20 text-white hover:bg-white/10"
                asChild
              >
                <Link href={`/author/courses/${id}/edit`}>
                  <Edit2 className="mr-2 h-4 w-4" /> Edit Project
                </Link>
              </Button>
              <Badge className="bg-indigo-600 text-white border-none rounded-full px-4 flex items-center">
                PREVIEW
              </Badge>
            </div>
          </div>
        )}

        <div className="relative overflow-hidden bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Sparkles className="h-64 w-64 text-indigo-600" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-none px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase">
                  {path.status === "published" ? "Active Path" : "Draft"}
                </Badge>
                <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase">
                  {totalStages} Stages
                </Badge>
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {path.title}
              </h1>

              <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl">
                {path.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center">
                    <Clock className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      Duration
                    </p>
                    <p className="text-sm font-black text-slate-700">
                      ~{modules.length * 2} Hours
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      Rewards
                    </p>
                    <p className="text-sm font-black text-slate-700">
                      {path.xp} XP
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-80 space-y-6">
              <Card className="rounded-3xl border-none bg-slate-50 p-6 shadow-inner text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                  Your Progress
                </p>
                <div className="relative h-32 w-32 mx-auto mb-6">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle
                      className="text-slate-200 stroke-current"
                      strokeWidth="8"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-indigo-600 stroke-current transition-all duration-1000 ease-out"
                      strokeWidth="8"
                      strokeDasharray={`${progressValue * 2.51}, 251.2`}
                      strokeLinecap="round"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <text
                      x="50"
                      y="55"
                      className="text-2xl font-black fill-slate-900"
                      textAnchor="middle"
                    >
                      {progressValue}%
                    </text>
                  </svg>
                </div>
                <Progress
                  value={progressValue}
                  className="h-2 rounded-full mb-4 bg-white"
                />
                <p className="text-xs font-bold text-slate-500">
                  {completedStages} of {totalStages} tasks done
                </p>
              </Card>

              {progressValue >= 99.9 && (
                <Button
                  onClick={
                    path.is_claimed
                      ? () =>
                          router.push(`/certificates/${path.certificate_code}`)
                      : handleClaimCertificate
                  }
                  disabled={isClaiming}
                  className={cn(
                    "w-full h-16 rounded-3xl font-black text-lg shadow-2xl transition-all active:scale-95",
                    path.is_claimed
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200"
                      : "bg-amber-500 hover:bg-slate-900 text-white shadow-amber-200",
                  )}
                >
                  {isClaiming ? (
                    "Processing..."
                  ) : path.is_claimed ? (
                    <>
                      <CheckCircle2 className="mr-3 h-6 w-6" /> Certificate
                      Claimed
                    </>
                  ) : (
                    <>
                      <Award className="mr-3 h-6 w-6" /> Claim Certificate
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Curriculum Map <Layout className="h-7 w-7 text-indigo-600" />
          </h2>
        </div>

        <div className="grid gap-8">
          {modules.map((module, idx) => (
            <div key={module.id} className="relative pl-8 md:pl-0">
              {/* Continuity Line */}
              {idx !== modules.length - 1 && (
                <div className="absolute left-[13px] top-10 bottom-0 md:left-1/2 w-0.5 bg-slate-100 hidden md:block" />
              )}

              <div
                className={cn(
                  "group relative bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/30 transition-all",
                  module.is_locked
                    ? "opacity-75 blur-[1px]"
                    : "hover:shadow-2xl hover:shadow-indigo-100/50",
                )}
              >
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg",
                          module.is_completed
                            ? "bg-emerald-500 text-white"
                            : module.is_locked
                              ? "bg-slate-100 text-slate-400"
                              : "bg-indigo-600 text-white",
                        )}
                      >
                        {module.is_completed ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-black text-slate-900 leading-none">
                            {module.title}
                          </h3>
                        </div>
                        <p className="text-sm font-medium text-slate-500">
                          {module.description}
                        </p>
                      </div>
                    </div>

                    {!module.is_locked ? (
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          {module.stages?.map((stage) => (
                            <Link
                              href={
                                stage.is_locked && !isReviewer
                                  ? "#"
                                  : `/learning-paths/${id}/stage/${stage.id}`
                              }
                              key={stage.id}
                              className={cn(
                                "group/stage flex items-center justify-between p-4 rounded-3xl border-2 transition-all",
                                stage.is_completed
                                  ? "bg-emerald-50 border-emerald-100 hover:border-emerald-200"
                                  : stage.is_locked && !isReviewer
                                    ? "bg-slate-50 border-slate-50 cursor-not-allowed opacity-50"
                                    : "bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50",
                              )}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={cn(
                                    "h-10 w-10 rounded-2xl flex items-center justify-center transition-transform group-hover/stage:rotate-6",
                                    stage.is_completed
                                      ? "bg-white"
                                      : "bg-slate-100",
                                  )}
                                >
                                  {stage.is_completed ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                  ) : stage.is_locked && !isReviewer ? (
                                    <Lock className="h-5 w-5 text-slate-300" />
                                  ) : (
                                    <Play className="h-5 w-5 text-indigo-600" />
                                  )}
                                </div>
                                <span className="font-bold text-slate-700">
                                  {stage.title}
                                </span>
                              </div>
                              {!stage.is_locked || isReviewer ? (
                                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                              ) : (
                                <Lock className="h-4 w-4 text-slate-300" />
                              )}
                            </Link>
                          ))}
                        </div>

                        {/* Final Project Submission Area (Only for the last module) */}
                        {!isReviewer &&
                          idx === (path.modules?.length || 0) - 1 &&
                          path.has_final_assignment &&
                          (path.modules?.every((m: Module) =>
                            m.stages?.every((s: any) => s.is_completed),
                          ) ||
                            path.final_submission_status) && (
                            <div className="pt-8 mt-6 border-t-2 border-dashed border-slate-100">
                              <ModuleAssignment
                                moduleId={path.id}
                                moduleTitle={path.title}
                                instructions={
                                  path.final_assignment_instructions
                                }
                                status={path.final_submission_status}
                                onSuccess={fetchData}
                                isPathProject
                              />
                            </div>
                          )}
                      </div>
                    ) : (
                      <div className="py-6 px-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                        <Lock className="h-10 w-10 text-slate-200 mb-2" />
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                          Locked Module
                        </p>
                        <p className="text-xs font-bold text-slate-400 ring-offset-2">
                          Finish previous curriculum items to unlock this depth.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
