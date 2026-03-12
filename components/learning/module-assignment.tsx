"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Send, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ModuleAssignmentProps {
  moduleId: number;
  moduleTitle: string;
  instructions?: string;
  status?: "pending" | "approved" | "rejected" | "";
  onSuccess?: () => void;
  isPathProject?: boolean;
}

export function ModuleAssignment({
  moduleId,
  moduleTitle,
  instructions,
  status,
  onSuccess,
  isPathProject,
}: ModuleAssignmentProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Please provide your project link or description");
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = isPathProject
        ? `/learning-paths/${moduleId}/submit-project`
        : `/modules/${moduleId}/submission`;
      await api.post(endpoint, { content });
      toast.success(
        isPathProject
          ? "Final course project submitted successfully!"
          : "Assignment submitted successfully!",
      );
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Submission failed", error);
      toast.error("Failed to submit assignment");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "approved") {
    return (
      <Card className="bg-emerald-50 border-emerald-100 shadow-none rounded-3xl">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-black text-emerald-900">Assignment Approved</h4>
            <p className="text-sm font-medium text-emerald-700">
              Your work for "{moduleTitle}" has been verified by the author.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "pending") {
    return (
      <Card className="bg-amber-50 border-amber-100 shadow-none rounded-3xl">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-black text-amber-900">Awaiting Review</h4>
            <p className="text-sm font-medium text-amber-700">
              Your project for "{moduleTitle}" is currently being reviewed by
              the author.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-indigo-100 shadow-xl shadow-indigo-50 rounded-[2.5rem] overflow-hidden">
      <CardHeader className="bg-indigo-50/50 p-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Send className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl font-black text-slate-900">
            Final Project Submission
          </CardTitle>
        </div>
        <div className="text-slate-600 font-medium text-base">
          {instructions ? (
            <div className="bg-white/50 p-4 rounded-2xl border border-indigo-100 mt-2">
              <p className="text-indigo-900 font-black text-xs uppercase tracking-widest mb-2">
                Instructions from Author:
              </p>
              <div className="text-slate-700 whitespace-pre-wrap">
                {instructions}
              </div>
            </div>
          ) : (
            <p>
              Submit your final task for <strong>{moduleTitle}</strong>. Provide
              a Github repository link or explain your solution below.
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-4">
        {status === "rejected" && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-black text-rose-900 uppercase tracking-tight">
                Revision Required
              </p>
              <p className="text-rose-700 font-medium italic">
                Your previous submission was not approved. Please check the
                feedback and resubmit.
              </p>
            </div>
          </div>
        )}
        <Textarea
          placeholder="Paste your Github link or project summary here..."
          className="min-h-[150px] rounded-2xl border-slate-200 focus-visible:ring-indigo-600 font-medium py-4 px-6 text-lg"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={submitting}
        />
      </CardContent>
      <CardFooter className="p-8 pt-0">
        <Button
          onClick={handleSubmit}
          disabled={submitting || !content.trim()}
          className="w-full h-14 bg-indigo-600 hover:bg-slate-900 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 transition-all active:scale-95"
        >
          {submitting ? "Submitting Work..." : "Submit Project"}
        </Button>
      </CardFooter>
    </Card>
  );
}
