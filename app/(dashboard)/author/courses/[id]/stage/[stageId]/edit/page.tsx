"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { StageDetail } from "@/types/api";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { ContentEditor } from "@/components/author/content-editor";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ id: string; stageId: string }>;
}

export default function StageEditorPage({ params }: PageProps) {
  const { id: courseId, stageId } = use(params);
  const [stage, setStage] = useState<StageDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStage = async () => {
    try {
      const res = await api.get<{ data: StageDetail }>(`/stages/${stageId}`);
      setStage(res.data.data);
    } catch (error) {
      console.error("Failed to fetch stage", error);
      toast.error("Failed to load stage content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStage();
  }, [stageId]);

  if (loading) return <div className="p-8">Loading editor...</div>;
  if (!stage) return <div className="p-8">Stage not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/author/courses/${courseId}/edit`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Edit Content: {stage.title}
          </h1>
        </div>
        <div className="ml-auto">
          <Button variant="outline" asChild>
            <Link
              href={`/learning-paths/${courseId}/stage/${stageId}`}
              target="_blank"
            >
              Preview Stage
            </Link>
          </Button>
        </div>
      </div>

      <ContentEditor
        stageId={parseInt(stageId)}
        initialBlocks={stage.blocks || []}
        onUpdate={fetchStage}
      />
    </div>
  );
}
