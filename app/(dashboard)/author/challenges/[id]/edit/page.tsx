"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/api";
import { Challenge, ChallengeBlock } from "@/types/api";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Zap, ExternalLink, Eye } from "lucide-react";
import Link from "next/link";
import { ChallengeEditor } from "@/components/author/challenge-editor";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function EditChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChallenge = async () => {
    try {
      const res = await api.get(`/cms/challenges/${id}`);
      // Assuming the GET detail for author includes blocks or we might need another preload
      // Our backend GetChallengeDetail already preloads blocks
      setChallenge(res.data.data);
    } catch (error) {
      toast.error("Failed to load challenge");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, [id]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Zap className="h-12 w-12 text-yellow-500 animate-bounce" />
          <p className="font-black text-slate-400 uppercase tracking-widest text-xs">
            Architecting Content...
          </p>
        </div>
      </div>
    );

  if (!challenge) return <div>Challenge not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <Link
            href="/author/challenges"
            className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 hover:text-yellow-600 transition-colors mb-2"
          >
            <ChevronLeft className="h-3 w-3" /> Back to Manager
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {challenge.title}
            </h1>
            <Badge
              variant="outline"
              className="rounded-full border-yellow-200 text-yellow-700 font-bold bg-yellow-50 px-3 uppercase text-[10px]"
            >
              {challenge.difficulty}
            </Badge>
          </div>
          <p className="text-slate-500 font-medium">
            Building immersive content for your students.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            asChild
            className="rounded-2xl h-12 px-6 border-slate-200 font-bold"
          >
            <Link href={`/challenges/${challenge.id}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" /> Preview
            </Link>
          </Button>
          <Button
            className="rounded-2xl h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white font-black shadow-xl shadow-slate-200"
            onClick={() => toast.success("Draft saved as you type!")}
          >
            Save Progress
          </Button>
        </div>
      </div>

      <ChallengeEditor
        challengeId={challenge.id}
        initialBlocks={challenge.blocks || []}
        onUpdate={fetchChallenge}
      />
    </div>
  );
}
