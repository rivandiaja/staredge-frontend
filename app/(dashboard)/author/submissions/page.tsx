"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  ModuleSubmission,
  ChallengeSubmission,
  PathSubmission,
  Challenge,
  Module,
  LearningPath,
} from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  Trophy,
  Loader2,
  BookOpen,
  Zap,
  ChevronDown,
  ChevronUp,
  Search,
  Award,
  History,
  ShieldCheck,
  ChevronRight,
  Star,
  Layers,
  LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function SubmissionsReviewPage() {
  const [modules, setModules] = useState<ModuleSubmission[]>([]);
  const [challenges, setChallenges] = useState<ChallengeSubmission[]>([]);
  const [paths, setPaths] = useState<PathSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<{
    type: "module" | "challenge" | "path";
    data: any;
  } | null>(null);

  const [reviewForm, setReviewForm] = useState({
    status: "approved",
    feedback: "",
    score: 100,
  });

  const fetchSubmissions = async () => {
    try {
      const res = await api.get("/cms/submissions");
      setModules(res.data.data.modules || []);
      setChallenges(res.data.data.challenges || []);
      setPaths(res.data.data.paths || []);
    } catch (error) {
      toast.error("Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleOpenReview = (
    submission: any,
    type: "module" | "challenge" | "path",
  ) => {
    if (submission.status !== "pending") {
      toast.info("This submission has already been reviewed.");
      return;
    }
    setSelectedSubmission({ type, data: submission });
    setReviewForm({
      status: "approved",
      feedback: "",
      score: type === "challenge" ? 50 : type === "path" ? 250 : 100,
    });
    setIsReviewModalOpen(true);
  };

  const submitReview = async () => {
    if (!selectedSubmission) return;
    try {
      const endpoint =
        selectedSubmission.type === "module"
          ? `/cms/submissions/module/${selectedSubmission.data.id}/review`
          : selectedSubmission.type === "challenge"
            ? `/cms/submissions/challenge/${selectedSubmission.data.id}/review`
            : `/cms/submissions/path/${selectedSubmission.data.id}/review`;

      await api.patch(endpoint, reviewForm);
      toast.success("Submission reviewed successfully!");
      setIsReviewModalOpen(false);
      fetchSubmissions();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to submit review");
    }
  };

  // Grouping Logic
  const groupedChallenges = challenges.reduce(
    (
      acc: Record<
        number,
        { challenge: Challenge; submissions: ChallengeSubmission[] }
      >,
      sub: ChallengeSubmission,
    ) => {
      const cid = sub.challenge_id;
      if (!acc[cid]) {
        acc[cid] = {
          challenge: sub.challenge!,
          submissions: [],
        };
      }
      acc[cid].submissions.push(sub);
      return acc;
    },
    {} as Record<
      number,
      { challenge: Challenge; submissions: ChallengeSubmission[] }
    >,
  );

  const groupedModules = modules.reduce(
    (
      acc: Record<number, { module: Module; submissions: ModuleSubmission[] }>,
      sub: ModuleSubmission,
    ) => {
      const mid = sub.module_id;
      if (!acc[mid]) {
        acc[mid] = {
          module: sub.module!,
          submissions: [],
        };
      }
      acc[mid].submissions.push(sub);
      return acc;
    },
    {} as Record<number, { module: Module; submissions: ModuleSubmission[] }>,
  );

  const groupedPaths = paths.reduce(
    (
      acc: Record<
        number,
        { path: LearningPath; submissions: PathSubmission[] }
      >,
      sub: PathSubmission,
    ) => {
      const pid = sub.learning_path_id;
      if (!acc[pid]) {
        acc[pid] = {
          path: sub.learning_path!,
          submissions: [],
        };
      }
      acc[pid].submissions.push(sub);
      return acc;
    },
    {} as Record<number, { path: LearningPath; submissions: PathSubmission[] }>,
  );

  const totalPending = challenges.length + modules.length + paths.length;

  const submissionStats = [
    {
      label: "Pending Queue",
      value: totalPending,
      icon: History,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Module Tasks",
      value: modules.length,
      icon: Layers,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Challenge Files",
      value: challenges.length,
      icon: LayoutGrid,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Path Finalists",
      value: paths.length,
      icon: Award,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-10 pb-20 max-w-7xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Validation Studio 🛡️
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Review, grade and provide high-impact feedback on student
            submissions.
          </p>
        </div>
      </div>

      {/* Stats Slider on Mobile */}
      <div className="flex overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 gap-4 snap-x">
        {submissionStats.map((stat, i) => (
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

      <Tabs defaultValue="challenges" className="space-y-8">
        <div className="flex overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 snap-x">
          <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-14 w-full md:w-auto min-w-max">
            <TabsTrigger
              value="challenges"
              className="rounded-xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all"
            >
              Challenges ({challenges.length})
            </TabsTrigger>
            <TabsTrigger
              value="modules"
              className="rounded-xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all"
            >
              Modules ({modules.length})
            </TabsTrigger>
            <TabsTrigger
              value="paths"
              className="rounded-xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all"
            >
              Final Submissions ({paths.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="challenges" className="space-y-6">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-slate-200" />
            </div>
          ) : Object.keys(groupedChallenges).length === 0 ? (
            <EmptyState message="No challenge submissions to review." />
          ) : (
            Object.values(groupedChallenges).map((group) => (
              <GroupCard
                key={group.challenge.id}
                title={group.challenge.title}
                description={group.challenge.description}
                type="challenge"
                submissions={group.submissions}
                onReview={(s) => handleOpenReview(s, "challenge")}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="paths" className="space-y-6">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-slate-200" />
            </div>
          ) : Object.keys(groupedPaths).length === 0 ? (
            <EmptyState message="No graduation project submissions to review." />
          ) : (
            Object.values(groupedPaths).map((group) => (
              <GroupCard
                key={group.path.id}
                title={group.path.title}
                description={group.path.description}
                type="path"
                submissions={group.submissions}
                onReview={(s) => handleOpenReview(s, "path")}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* REVIEW DIALOG */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-4xl border-none p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              Grade Submission
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
                Student Submission Content
              </Label>
              <p className="text-slate-900 font-bold wrap-break-word">
                {selectedSubmission?.data?.content}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Status
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant={
                      reviewForm.status === "approved" ? "default" : "outline"
                    }
                    className={cn(
                      "flex-1 rounded-2xl h-12 font-bold",
                      reviewForm.status === "approved"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "",
                    )}
                    onClick={() =>
                      setReviewForm({ ...reviewForm, status: "approved" })
                    }
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                  </Button>
                  <Button
                    variant={
                      reviewForm.status === "rejected" ? "default" : "outline"
                    }
                    className={cn(
                      "flex-1 rounded-2xl h-12 font-bold",
                      reviewForm.status === "rejected"
                        ? "bg-red-600 hover:bg-red-700"
                        : "",
                    )}
                    onClick={() =>
                      setReviewForm({ ...reviewForm, status: "rejected" })
                    }
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Reject
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Score / XP
                </Label>
                <div className="relative">
                  <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-500" />
                  <Input
                    type="number"
                    value={reviewForm.score}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        score: parseInt(e.target.value) || 0,
                      })
                    }
                    className="rounded-2xl h-12 border-slate-200 pl-11 font-black focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Feedback for Student
              </Label>
              <Textarea
                placeholder="Provide constructive feedback..."
                value={reviewForm.feedback}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, feedback: e.target.value })
                }
                className="rounded-3xl min-h-[120px] border-slate-200 font-medium focus:ring-blue-500/20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={submitReview}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-14 font-black shadow-xl shadow-slate-200"
            >
              Submit Review & Notify Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GroupCard({
  title,
  description,
  type,
  submissions,
  onReview,
}: {
  title: string;
  description: string;
  type: "module" | "challenge" | "path";
  submissions: any[];
  onReview: (s: any) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-4xl overflow-hidden bg-white">
      <CardHeader className="p-8 pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-xl",
                  type === "module"
                    ? "bg-blue-50"
                    : type === "path"
                      ? "bg-indigo-50"
                      : "bg-yellow-50",
                )}
              >
                {type === "module" ? (
                  <BookOpen className="h-5 w-5 text-blue-600" />
                ) : type === "path" ? (
                  <Trophy className="h-5 w-5 text-indigo-600" />
                ) : (
                  <Zap className="h-5 w-5 text-yellow-600 fill-yellow-600" />
                )}
              </div>
              <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">
                {title}
              </CardTitle>
            </div>
            <CardDescription className="font-medium text-slate-500 line-clamp-1 max-w-2xl">
              {description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <Badge className="bg-red-500 text-white border-none px-3 py-1 font-black text-[10px] uppercase tracking-widest rounded-full">
                {pendingCount} Pending
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded-xl"
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-8 pt-0">
          <div className="mt-6 space-y-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">
              Student Submissions ({submissions.length})
            </div>
            <div className="grid grid-cols-1 gap-4">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex flex-col md:flex-row justify-between items-center gap-6 p-6 rounded-3xl bg-slate-50/50 border border-slate-100 group hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all"
                >
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-900">
                        {sub.user?.name || "Student"}
                      </span>
                      <Badge
                        className={cn(
                          "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border-none",
                          sub.status === "pending"
                            ? "bg-blue-100 text-blue-600"
                            : sub.status === "approved"
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-red-100 text-red-600",
                        )}
                      >
                        {sub.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-slate-500 italic bg-white/50 p-3 rounded-xl border border-dashed border-slate-200">
                      "{sub.content}"
                    </p>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />{" "}
                        {new Date(sub.created_at).toLocaleDateString()}
                      </span>
                      {sub.status !== "pending" && (
                        <span className="flex items-center gap-1.5 text-emerald-600">
                          <Trophy className="h-3 w-3" /> Score: {sub.score}
                        </span>
                      )}
                    </div>
                  </div>

                  {sub.status === "pending" && (
                    <Button
                      size="sm"
                      className="bg-slate-900 hover:bg-blue-600 text-white rounded-xl h-10 px-6 font-bold shadow-xl shadow-slate-200"
                      onClick={() => onReview(sub)}
                    >
                      Grade Task
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="border-2 border-dashed rounded-4xl bg-slate-50/50">
      <CardContent className="p-20 text-center">
        <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-black text-slate-500 uppercase tracking-tighter">
          {message}
        </h3>
      </CardContent>
    </Card>
  );
}
