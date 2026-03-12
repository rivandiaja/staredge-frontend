"use client";

import { useState, useEffect } from "react";
import { ChallengeBlock } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface ChallengeEditorProps {
  challengeId: number;
  initialBlocks: ChallengeBlock[];
  onUpdate?: () => void;
}

export function ChallengeEditor({
  challengeId,
  initialBlocks,
  onUpdate,
}: ChallengeEditorProps) {
  const [blocks, setBlocks] = useState<ChallengeBlock[]>(initialBlocks);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  const handleAddBlock = async (type: ChallengeBlock["type"]) => {
    setLoading(true);
    try {
      const orderIndex = blocks.length + 1;
      const res = await api.post(`/cms/challenges/${challengeId}/blocks`, {
        challenge_id: challengeId,
        type,
        content: "",
        order_index: orderIndex,
      });
      const newBlock = res.data.data;
      setBlocks([...blocks, newBlock]);
    } catch (error) {
      toast.error("Failed to add block");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlock = async (id: number) => {
    if (!confirm("Delete this block?")) return;
    try {
      await api.delete(`/cms/challenges/blocks/${id}`);
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

    [newBlocks[index], newBlocks[targetIndex]] = [
      newBlocks[targetIndex],
      newBlocks[index],
    ];

    const tempOrder = newBlocks[index].order_index;
    newBlocks[index].order_index = newBlocks[targetIndex].order_index;
    newBlocks[targetIndex].order_index = tempOrder;

    setBlocks(newBlocks);

    try {
      await Promise.all([
        api.put(`/cms/challenges/blocks/${newBlocks[index].id}`, {
          challenge_id: challengeId,
          type: newBlocks[index].type,
          content: newBlocks[index].content,
          order_index: newBlocks[index].order_index,
        }),
        api.put(`/cms/challenges/blocks/${newBlocks[targetIndex].id}`, {
          challenge_id: challengeId,
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
      <div className="sticky top-4 z-20 flex justify-center pointer-events-none">
        <div className="flex items-center bg-white/95 backdrop-blur shadow-2xl border rounded-full p-2 gap-1 pointer-events-auto transition-all hover:scale-105">
          {[
            { type: "text", icon: Type, label: "Text" },
            { type: "code", icon: Code, label: "Code" },
            { type: "image", icon: ImageIcon, label: "Image" },
            { type: "video", icon: Video, label: "Video" },
            { type: "quiz", icon: FileQuestion, label: "Quiz" },
            { type: "input", icon: TextCursorInput, label: "Input" },
          ].map((btn) => (
            <Button
              key={btn.type}
              variant="ghost"
              size="sm"
              onClick={() => handleAddBlock(btn.type as any)}
              disabled={loading}
              className="rounded-full h-10 px-4 font-bold text-slate-600 hover:text-yellow-600 hover:bg-yellow-50"
            >
              <btn.icon className="mr-2 h-4 w-4" /> {btn.label}
            </Button>
          ))}
          <div className="w-px h-6 bg-slate-200 mx-2" />
          <Button
            size="sm"
            className="rounded-full h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg"
            onClick={() => window.history.back()}
          >
            Finish
          </Button>
        </div>
      </div>

      <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
        Changes are saved automatically
      </div>

      <div className="space-y-6 max-w-4xl mx-auto">
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
              challengeId={challengeId}
            />
          ))}

        {blocks.length === 0 && (
          <div className="text-center py-32 border-4 border-dashed rounded-4xl bg-slate-50/50 border-slate-200">
            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border shadow-sm">
              <Plus className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-400">
              Start Building Your Challenge
            </h3>
            <p className="text-slate-400 font-medium mt-1">
              Select a block type from the toolbar to add content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function BlockEditor({
  block,
  index,
  total,
  onDelete,
  onMove,
  onUpdate,
  challengeId,
}: {
  block: ChallengeBlock;
  index: number;
  total: number;
  onDelete: () => void;
  onMove: (dir: "up" | "down") => void;
  onUpdate: (content: string) => void;
  challengeId: number;
}) {
  const [content, setContent] = useState(block.content);
  const [status, setStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const debouncedContent = useDebounce(content, 1000);

  useEffect(() => {
    if (block.content !== content && status === "saved") {
      setContent(block.content);
    }
  }, [block.content]);

  useEffect(() => {
    if (debouncedContent === block.content) return;

    const save = async () => {
      setStatus("saving");
      try {
        await api.put(`/cms/challenges/blocks/${block.id}`, {
          challenge_id: challengeId,
          type: block.type,
          content: debouncedContent,
          order_index: block.order_index,
        });
        setStatus("saved");
        onUpdate(debouncedContent);
      } catch (error) {
        setStatus("unsaved");
        toast.error("Auto-save failed");
      }
    };

    save();
  }, [debouncedContent]);

  return (
    <div className="group relative pl-12 transition-all">
      <div className="absolute left-0 top-2 opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-1 items-end pr-2 w-12 translate-x-2 group-hover:translate-x-0">
        <div className="flex flex-col bg-white/90 backdrop-blur rounded-xl border border-slate-200 shadow-xl p-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-lg text-slate-400 hover:text-yellow-600 hover:bg-yellow-50"
            onClick={() => onMove("up")}
            disabled={index === 0}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-lg text-slate-400 hover:text-yellow-600 hover:bg-yellow-50"
            onClick={() => onMove("down")}
            disabled={index === total - 1}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <div className="h-px bg-slate-100 my-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "rounded-3xl transition-all relative p-1",
          status === "unsaved" && "bg-yellow-50/30",
          status === "saving" && "bg-blue-50/30",
        )}
      >
        <div className="absolute right-4 top-4 z-10">
          {status === "saving" && (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          )}
          {status === "saved" && (
            <CheckCircle2 className="h-4 w-4 text-emerald-500/20" />
          )}
        </div>

        {block.type === "text" && (
          <Textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setStatus("unsaved");
            }}
            placeholder="Start typing your challenge content..."
            className="min-h-[60px] w-full resize-none border-none shadow-none focus-visible:ring-0 px-4 py-3 text-lg font-medium leading-relaxed bg-transparent"
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
        )}

        {block.type === "code" && (
          <div className="my-2 p-1">
            <CodeEditor
              initialContent={content}
              onChange={(v) => {
                setContent(v);
                setStatus("unsaved");
              }}
            />
          </div>
        )}

        {block.type === "quiz" && (
          <div className="border border-slate-100 rounded-3xl my-2 bg-white shadow-sm overflow-hidden">
            <QuizEditor
              initialContent={content}
              onChange={(v) => {
                setContent(v);
                setStatus("unsaved");
              }}
            />
          </div>
        )}

        {block.type === "input" && (
          <div className="border border-slate-100 rounded-3xl my-2 bg-white shadow-sm overflow-hidden">
            <InputEditor
              initialContent={content}
              onChange={(v) => {
                setContent(v);
                setStatus("unsaved");
              }}
            />
          </div>
        )}

        {(block.type === "video" || block.type === "image") && (
          <div className="my-2 p-6 border-2 border-slate-100 rounded-4xl bg-white shadow-sm">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">
              {block.type} Source Link
            </Label>
            <Input
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setStatus("unsaved");
              }}
              placeholder={
                block.type === "video"
                  ? "https://youtube.com/..."
                  : "https://images.unsplash.com/..."
              }
              className="rounded-2xl h-12 border-slate-200 font-medium"
            />
            {content && (
              <div className="mt-6 rounded-3xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center min-h-[200px]">
                {block.type === "image" ? (
                  <img
                    src={content}
                    alt="Preview"
                    className="max-h-[500px] object-contain shadow-2xl"
                  />
                ) : (
                  <div className="aspect-video w-full flex items-center justify-center font-bold text-slate-400 bg-slate-900 border-8 border-white shadow-2xl rounded-2xl m-4">
                    Video Stream Ready
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
