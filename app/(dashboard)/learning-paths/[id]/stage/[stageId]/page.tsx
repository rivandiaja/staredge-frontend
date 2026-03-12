"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { StageDetail, StageSummary, LearningPath, Module } from "@/types/api";
import { ContentRenderer } from "@/components/learning/content-renderer";
import { StageNavigation } from "@/components/learning/stage-navigation";
import { AgreementRequest } from "@/components/learning/agreement-request";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ChevronLeft, Eye } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string; stageId: string }>;
}

export default function StagePage({ params }: PageProps) {
  const { id: learningPathId, stageId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const isReviewer = user?.role === "admin" || user?.role === "author";

  const [stage, setStage] = useState<StageDetail | null>(null);
  const [pathStructure, setPathStructure] = useState<LearningPath | null>(null);
  const [modules, setModules] = useState<Module[]>([]);

  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for Agreement
  const [agreementRequired, setAgreementRequired] = useState(false);
  const [currentModuleId, setCurrentModuleId] = useState<number | null>(null);

  // Fetch Stage Content
  useEffect(() => {
    const fetchStage = async () => {
      setLoading(true);
      setError(null);
      setAgreementRequired(false);

      try {
        const response = await api.get<{ data: StageDetail }>(
          `/stages/${stageId}`,
        );
        setStage(response.data.data);
      } catch (err: unknown) {
        let msg = "Failed to load stage content";
        let isExpectedError = false;

        if (axios.isAxiosError(err)) {
          msg = err.response?.data?.error || msg;

          if (err.response?.status === 403) {
            // Check for specific error codes like AGREEMENT_REQUIRED
            if (err.response?.data?.code === "AGREEMENT_REQUIRED") {
              setAgreementRequired(true);
              isExpectedError = true;
              if (err.response?.data?.module_id) {
                setCurrentModuleId(err.response?.data?.module_id);
              }
            } else if (err.response?.data?.previous_stage_id) {
              toast.error("You must complete the previous stage first.");
              isExpectedError = true;
            } else if (msg.toLowerCase().includes("locked")) {
              isExpectedError = true;
            }
          }
        }

        if (!isExpectedError) {
          console.error("Failed to fetch stage", err);
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStage();
  }, [stageId]); // pending dependency to re-trigger? No, just careful with loop.
  // Actually we shouldn't depend on agreementRequired here to avoid loops.
  // Instead, handleSigned will trigger re-fetch.

  // Fetch Path Structure and identify current module
  useEffect(() => {
    const fetchPath = async () => {
      try {
        // We can use the same type strategy as the detail page
        const res = await api.get<unknown>(`/learning-paths/${learningPathId}`);
        const responseData = res.data as any; // Still need to cast to inspect structure conditionally
        if (responseData && (responseData.title || responseData.data)) {
          const data = responseData.title ? responseData : responseData.data;
          setPathStructure(data);
          if (data.modules && Array.isArray(data.modules)) {
            setModules(data.modules);

            // Find current module
            const currentStageIdNum = parseInt(stageId);
            const foundModule = data.modules.find((m: Module) =>
              (m.stages || []).some((s) => s.id === currentStageIdNum),
            );
            if (foundModule) {
              setCurrentModuleId(foundModule.id);
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch path structure", e);
      }
    };
    fetchPath();
  }, [learningPathId, stageId]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await api.post(`/stages/${stageId}/complete`);
      toast.success("Stage completed!");
      window.location.reload();
    } catch (e) {
      console.error("Completion failed", e);
      toast.error("Failed to complete stage");
    } finally {
      setCompleting(false);
    }
  };

  const handleAgreementSigned = () => {
    // Re-fetch stage content
    setError(null);
    setAgreementRequired(false); // This might trigger re-render but not re-effect if we don't depend on it or call fetch directly
    window.location.reload(); // Easiest way to reset everything and fetch fresh
  };

  // Calculate Previous and Next Stage IDs
  let prevStageId: number | undefined;
  let nextStageId: number | undefined;
  let currentStageCompleted = false;
  let currentModuleTitle = "Module";

  if (modules.length > 0) {
    const allStages = modules.flatMap((m) => m.stages || []);
    const currentIndex = allStages.findIndex((s) => s.id === parseInt(stageId));

    if (currentIndex !== -1) {
      if (currentIndex > 0) prevStageId = allStages[currentIndex - 1].id;
      if (currentIndex < allStages.length - 1)
        nextStageId = allStages[currentIndex + 1].id;
      currentStageCompleted = allStages[currentIndex].is_completed;
    }

    if (currentModuleId) {
      const mod = modules.find((m) => m.id === currentModuleId);
      if (mod) currentModuleTitle = mod.title;
    }
  }

  if (loading && !stage && !error && !agreementRequired)
    return <div className="p-8">Loading stage content...</div>;

  // Show Agreement Request if required
  if (agreementRequired && currentModuleId) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/learning-paths/${learningPathId}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Locked Content</h1>
        </div>
        <AgreementRequest
          moduleId={currentModuleId}
          moduleTitle={currentModuleTitle}
          onSigned={handleAgreementSigned}
        />
      </div>
    );
  }

  if (error && !agreementRequired) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold text-destructive">Access Denied</h2>
        <p>{error}</p>
        <Button asChild>
          <Link href={`/learning-paths/${learningPathId}`}>
            Back to Curriculum
          </Link>
        </Button>
      </div>
    );
  }

  if (!stage) return <div>Stage not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/learning-paths/${learningPathId}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{stage.title}</h1>
          <p className="text-muted-foreground text-sm">
            {pathStructure?.title}
          </p>
        </div>
      </div>

      {isReviewer && (
        <div
          className={cn(
            "px-6 py-4 rounded-3xl font-black text-sm flex items-center justify-between shadow-xl mb-8 border-b-4",
            user?.role === "admin"
              ? "bg-rose-600 text-white shadow-rose-100 border-rose-800"
              : "bg-indigo-600 text-white shadow-indigo-100 border-indigo-800",
          )}
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <p className="tracking-tight uppercase text-lg leading-none mb-1">
                {user?.role === "admin" ? "ADMIN REVIEW" : "AUTHOR PREVIEW"}
              </p>
              <p
                className={cn(
                  "text-[11px] font-bold uppercase tracking-widest opacity-80",
                  user?.role === "admin" ? "text-rose-100" : "text-indigo-100",
                )}
              >
                {user?.role === "admin"
                  ? "SYSTEM MODERATOR VIEW & QC BYPASS"
                  : "CONTENT CREATOR VIEW & FLOW TEST"}
              </p>
            </div>
          </div>
          <Badge
            className={cn(
              "bg-white border-none font-black text-xs px-3 h-8 shadow-sm",
              user?.role === "admin" ? "text-rose-600" : "text-indigo-600",
            )}
          >
            PREVIEW ONLY
          </Badge>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          {stage.blocks && stage.blocks.length > 0 ? (
            <ContentRenderer blocks={stage.blocks} />
          ) : (
            <p className="text-center text-muted-foreground py-12">
              No content available for this stage.
            </p>
          )}
        </CardContent>
      </Card>

      <StageNavigation
        learningPathId={learningPathId}
        currentStageId={parseInt(stageId)}
        previousStageId={prevStageId}
        nextStageId={nextStageId}
        isCompleted={isReviewer ? true : currentStageCompleted}
        onComplete={handleComplete}
        loading={completing}
        isReviewer={isReviewer}
      />
    </div>
  );
}
