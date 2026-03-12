"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

interface StageNavigationProps {
  learningPathId: string;
  currentStageId: number;
  previousStageId?: number;
  nextStageId?: number;
  isCompleted: boolean;
  onComplete: () => void;
  loading?: boolean;
  isReviewer?: boolean;
}

export function StageNavigation({
  learningPathId,
  currentStageId,
  previousStageId,
  nextStageId,
  isCompleted,
  onComplete,
  loading,
  isReviewer,
}: StageNavigationProps) {
  return (
    <div className="flex items-center justify-between border-t pt-6 bg-background">
      <div>
        {previousStageId ? (
          <Button variant="outline" asChild>
            <Link
              href={`/learning-paths/${learningPathId}/stage/${previousStageId}`}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Link>
          </Button>
        ) : (
          <Button variant="outline" disabled>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        {!isCompleted && !isReviewer && (
          <Button onClick={onComplete} disabled={loading}>
            {loading ? "Completing..." : "Mark as Complete"}
          </Button>
        )}

        {nextStageId ? (
          <Button
            variant={isCompleted ? "default" : "secondary"}
            asChild
            disabled={!isCompleted}
          >
            <Link
              href={`/learning-paths/${learningPathId}/stage/${nextStageId}`}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link href={`/learning-paths/${learningPathId}`}>
              Finish Module
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
