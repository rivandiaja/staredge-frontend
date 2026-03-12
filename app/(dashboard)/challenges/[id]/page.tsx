"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { api, getImageUrl } from "@/lib/api";
import { Challenge, ChallengeBlock } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  Trophy,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { ContentRenderer } from "@/components/learning/content-renderer";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";

export default function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionContent, setSubmissionContent] = useState("");

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await api.get(`/challenges/${id}`);
        setChallenge(res.data.data.challenge);
        setIsCompleted(res.data.data.is_completed);
        setSubmission(res.data.data.submission);
        if (res.data.data.submission) {
          setSubmissionContent(res.data.data.submission.content);
        }
      } catch (error) {
        toast.error("Failed to load challenge");
        router.push("/challenges");
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [id]);

  const handleSubmit = async () => {
    if (!submissionContent.trim()) {
      return toast.error("Please provide your answer before submitting.");
    }

    setSubmitting(true);
    try {
      await api.post(`/challenges/${id}/submit`, {
        content: submissionContent,
      });
      toast.success("Challenge submitted! An author will review it soon.");
      // Refresh state instead of redirecting if needed, but router push is fine
      router.push("/challenges");
    } catch (error) {
      toast.error("Failed to submit challenge");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Zap className="h-12 w-12 text-yellow-500 animate-bounce fill-yellow-500" />
          <p className="font-black text-slate-400 uppercase tracking-widest text-xs">
            Preparing Mission...
          </p>
        </div>
      </div>
    );
  }

  if (!challenge) return <div>Challenge not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="space-y-6">
        <Link
          href="/challenges"
          className="group flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest hover:text-yellow-600 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to list
        </Link>

        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Zap className="h-40 w-40 text-yellow-500 fill-yellow-500" />
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <Badge className="bg-yellow-500 text-white border-none px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase">
              {challenge.difficulty}
            </Badge>
            {isCompleted ? (
              <Badge className="bg-emerald-500 text-white border-none px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase flex items-center gap-1.5 shadow-lg shadow-emerald-100">
                <CheckCircle2 className="h-3 w-3" /> Task Completed
              </Badge>
            ) : (
              <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase">
                Interactive Task
              </Badge>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {challenge.title}
          </h1>
          <p className="text-slate-500 font-bold text-lg mt-4 leading-relaxed max-w-2xl">
            {challenge.description}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="prose prose-slate max-w-none">
          <ContentRenderer blocks={(challenge.blocks as any) || []} />
        </div>
      </div>

      {/* Submission Area */}
      <div className="bg-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200 text-white space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <Trophy className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Ready to Submit?</h2>
            <p className="text-slate-400 font-medium">
              Explain your solution or provide the link to your work here.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Textarea
            placeholder="Type your solution here..."
            className="min-h-[200px] bg-white/5 border-white/10 rounded-2xl p-6 text-lg font-medium focus-visible:ring-yellow-500/50 placeholder:text-slate-600"
            value={submissionContent}
            onChange={(e) => setSubmissionContent(e.target.value)}
          />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
            <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              Your response will be reviewed by an instructor.
            </div>

            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl h-16 px-10 font-black text-lg shadow-xl shadow-yellow-500/20 w-full md:w-auto transition-all active:scale-95 disabled:opacity-50"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting Mission...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Submit Mission
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
