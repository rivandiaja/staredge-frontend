"use client";

import { useState, useEffect, useCallback } from "react";
import { ContentBlock } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Code,
  Type,
  Video,
  Image as ImageIcon,
  FileQuestion,
  TextCursorInput,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { QuizEditor } from "./quiz-editor";
import { InputEditor } from "./input-editor";
import { CodeEditor } from "./code-editor";
import { useDebounce } from "@/hooks/use-debounce";

interface ContentEditorProps {
  stageId: number;
  initialBlocks: ContentBlock[];
  onUpdate?: () => void;
}

export function ContentEditor({
  stageId,
  initialBlocks,
  onUpdate,
}: ContentEditorProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialBlocks);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  const handleAddBlock = async (type: ContentBlock["type"]) => {
    setLoading(true);
    try {
      const orderIndex = blocks.length + 1;
      const res = await api.post("/cms/blocks", {
        stage_id: stageId,
        type,
        content: "",
        order_index: orderIndex,
      });
      const newBlock = res.data.data;
      setBlocks([...blocks, newBlock]);
      // Toast optional for smoother feel
    } catch (error) {
      console.error("Failed to add block", error);
      toast.error("Failed to add block");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlock = async (id: number) => {
    if (!confirm("Delete this block?")) return;
    try {
      await api.delete(`/cms/blocks/${id}`);
      setBlocks(blocks.filter((b) => b.id !== id));
    } catch (error) {
      toast.error("Failed to delete block");
    }
  };

  const handleUpdateBlockInParent = (id: number, content: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  const handleMoveBlock = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    // Swap locally
    [newBlocks[index], newBlocks[targetIndex]] = [
      newBlocks[targetIndex],
      newBlocks[index],
    ];

    // Swap order_index
    const tempOrder = newBlocks[index].order_index;
    newBlocks[index].order_index = newBlocks[targetIndex].order_index;
    newBlocks[targetIndex].order_index = tempOrder;

    setBlocks(newBlocks);

    // Update backend (optimistic)
    try {
      await Promise.all([
        api.put(`/cms/blocks/${newBlocks[index].id}`, {
          stage_id: stageId,
          type: newBlocks[index].type,
          content: newBlocks[index].content,
          order_index: newBlocks[index].order_index,
        }),
        api.put(`/cms/blocks/${newBlocks[targetIndex].id}`, {
          stage_id: stageId,
          type: newBlocks[targetIndex].type,
          content: newBlocks[targetIndex].content,
          order_index: newBlocks[targetIndex].order_index,
        }),
      ]);
    } catch (error) {
      toast.error("Failed to reorder blocks");
      onUpdate?.();
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Floating/Sticky Toolbar */}
      <div className="sticky top-4 z-20 flex justify-center pointer-events-none">
        <div className="flex items-center bg-background/95 backdrop-blur shadow-lg border rounded-full p-1.5 gap-1 pointer-events-auto transition-all hover:scale-105">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAddBlock("text")}
            disabled={loading}
            className="rounded-full h-8 px-3"
          >
            <Type className="mr-2 h-4 w-4" /> Text
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAddBlock("code")}
            disabled={loading}
            className="rounded-full h-8 px-3"
          >
            <Code className="mr-2 h-4 w-4" /> Code
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAddBlock("image")}
            disabled={loading}
            className="rounded-full h-8 px-3"
          >
            <ImageIcon className="mr-2 h-4 w-4" /> Image
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAddBlock("video")}
            disabled={loading}
            className="rounded-full h-8 px-3"
          >
            <Video className="mr-2 h-4 w-4" /> Video
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAddBlock("quiz")}
            disabled={loading}
            className="rounded-full h-8 px-3"
          >
            <FileQuestion className="mr-2 h-4 w-4" /> Quiz
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAddBlock("input")}
            disabled={loading}
            className="rounded-full h-8 px-3"
          >
            <TextCursorInput className="mr-2 h-4 w-4" /> Input
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            variant="default"
            size="sm"
            className="rounded-full h-8 px-4 bg-green-600 hover:bg-green-700 text-white shadow-sm"
            onClick={() => window.history.back()}
          >
            Done
          </Button>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground mt-2 mb-6">
        All changes are saved automatically
      </div>

      <div className="space-y-4 max-w-3xl mx-auto">
        {blocks
          .sort((a, b) => a.order_index - b.order_index)
          .map((block, index) => (
            <BlockEditor
              key={block.id}
              block={block}
              index={index}
              total={blocks.length}
              onDelete={() => handleDeleteBlock(block.id)}
              onMove={(dir) => handleMoveBlock(index, dir)}
              onUpdate={(content) =>
                handleUpdateBlockInParent(block.id, content)
              }
              stageId={stageId}
            />
          ))}

        {blocks.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/5">
            <h3 className="text-lg font-medium text-muted-foreground">
              Start writing...
            </h3>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Select a block type from the toolbar above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component for individual block editing with auto-save
function BlockEditor({
  block,
  index,
  total,
  onDelete,
  onMove,
  onUpdate,
  stageId,
}: {
  block: ContentBlock;
  index: number;
  total: number;
  onDelete: () => void;
  onMove: (dir: "up" | "down") => void;
  onUpdate: (content: string) => void;
  stageId: number;
}) {
  const [content, setContent] = useState(block.content);
  const [status, setStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const debouncedContent = useDebounce(content, 1000); // Auto-save after 1s of inactivity

  // Sync local state if parent updates (e.g. initial load)
  useEffect(() => {
    if (block.content !== content && status === "saved") {
      setContent(block.content);
    }
  }, [block.content]);

  // Handle Auto-Save
  useEffect(() => {
    if (debouncedContent === block.content) return; // No changes

    const save = async () => {
      setStatus("saving");
      try {
        await api.put(`/cms/blocks/${block.id}`, {
          stage_id: stageId,
          type: block.type,
          content: debouncedContent,
          order_index: block.order_index,
        });
        setStatus("saved");
        onUpdate(debouncedContent); // Sync parent
      } catch (error) {
        setStatus("unsaved");
        toast.error("Failed to auto-save");
      }
    };

    if (debouncedContent !== block.content) {
      save();
    }
  }, [debouncedContent]);

  const handleChange = (val: string) => {
    setContent(val);
    setStatus("unsaved");
  };

  return (
    <div className="group relative pl-10 transition-all">
      {/* Hover Actions (Notion-style handle) */}
      <div className="absolute left-0 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 items-end pr-2 w-10">
        <div className="flex flex-col bg-background/80 backdrop-blur rounded-md border shadow-sm p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={() => onMove("up")}
            disabled={index === 0}
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={() => onMove("down")}
            disabled={index === total - 1}
          >
            <ArrowDown className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-red-500 hover:text-red-600"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Block Content */}
      <div
        className={cn(
          "rounded-lg transition-all relative",
          // status === "unsaved" && "ring-1 ring-yellow-400/50",
          // status === "saving" && "ring-1 ring-blue-400/50"
        )}
      >
        {/* Status Indicator */}
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {status === "saving" && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          )}
          {status === "saved" && (
            <CheckCircle2 className="h-3 w-3 text-green-500/30" />
          )}
        </div>

        {block.type === "text" && (
          <Textarea
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Type something..."
            className="min-h-[40px] w-full resize-none border-none shadow-none focus-visible:ring-0 px-0 py-2 text-base leading-relaxed overflow-hidden bg-transparent"
            rows={Math.max(1, content.split("\n").length)} // Simple auto-grow
            style={{ height: "auto" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
        )}

        {block.type === "code" && (
          <div className="my-2">
            <CodeEditor initialContent={content} onChange={handleChange} />
          </div>
        )}

        {block.type === "quiz" && (
          <div className="border rounded-md my-2">
            <QuizEditor initialContent={content} onChange={handleChange} />
          </div>
        )}

        {block.type === "input" && (
          <div className="border rounded-md my-2">
            <InputEditor initialContent={content} onChange={handleChange} />
          </div>
        )}

        {(block.type === "video" || block.type === "image") && (
          <div className="my-2 p-4 border rounded-md bg-muted/20">
            <Label className="text-xs uppercase text-muted-foreground mb-2 block">
              {block.type.toUpperCase()} URL
            </Label>
            <Input
              value={content}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={
                block.type === "video" ? "YouTube URL..." : "Image URL..."
              }
              className="bg-background"
            />
            {content && (
              <div className="mt-4 rounded overflow-hidden border bg-background flex items-center justify-center">
                {block.type === "image" ? (
                  <img
                    src={content}
                    alt="Preview"
                    className="max-h-[400px] object-contain"
                  />
                ) : (
                  <div className="aspect-video w-full bg-black/5 flex items-center justify-center text-muted-foreground">
                    Video Preview
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
