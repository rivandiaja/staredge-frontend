"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; // Assuming you have this
import { Plus, Trash2, CheckCircle2 } from "lucide-react";

export interface QuizData {
  question: string;
  options: { text: string; isCorrect: boolean }[];
  explanation?: string;
}

interface QuizEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

export function QuizEditor({ initialContent, onChange }: QuizEditorProps) {
  const [data, setData] = useState<QuizData>({
    question: "",
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  });

  useEffect(() => {
    if (initialContent) {
      try {
        const parsed = JSON.parse(initialContent);
        setData(parsed);
      } catch (e) {
        // console.error("Failed to parse quiz data", e);
      }
    }
  }, []); // Only parse on mount for now to strictly follow "initialContent" semantics

  // Debounced update to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(JSON.stringify(data));
    }, 500);
    return () => clearTimeout(timer);
  }, [data, onChange]);

  const updateOption = (
    index: number,
    field: keyof QuizData["options"][0],
    value: any,
  ) => {
    const newOptions = [...data.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setData({ ...data, options: newOptions });
  };

  const addOption = () => {
    setData({
      ...data,
      options: [...data.options, { text: "", isCorrect: false }],
    });
  };

  const removeOption = (index: number) => {
    setData({
      ...data,
      options: data.options.filter((_, i) => i !== index),
    });
  };

  const setCorrect = (index: number) => {
    // Ensure only one correct answer for basic MCQ, or allow multiple?
    // For now, let's allow multiple (checkbox behavior) or single.
    // Let's stick to single correct for simplicity if that's the requirement,
    // but the PRD says "Multiple Choice", which implies one correct usually.
    // Let's toggle.
    const newOptions = data.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index, // Mutual exclusion for single correct answer
    }));
    setData({ ...data, options: newOptions });
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-card">
      <div className="space-y-2">
        <Label>Question</Label>
        <Input
          value={data.question}
          onChange={(e) => setData({ ...data, question: e.target.value })}
          placeholder="Enter the question here..."
        />
      </div>

      <div className="space-y-3">
        <Label>Options</Label>
        {data.options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex-none pt-2">
              {/* Custom Radio-like behavior using Checkbox or similar visual */}
              <Button
                type="button"
                variant={option.isCorrect ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => setCorrect(index)}
                title="Mark as correct answer"
              >
                {option.isCorrect && <CheckCircle2 className="h-4 w-4" />}
              </Button>
            </div>
            <Input
              value={option.text}
              onChange={(e) => updateOption(index, "text", e.target.value)}
              placeholder={`Option ${index + 1}`}
              className={
                option.isCorrect ? "border-primary ring-1 ring-primary" : ""
              }
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-red-500"
              onClick={() => removeOption(index)}
              disabled={data.options.length <= 2}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addOption}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Option
        </Button>
      </div>

      <div className="space-y-2 pt-2">
        <Label>Explanation (Optional)</Label>
        <Input
          value={data.explanation || ""}
          onChange={(e) => setData({ ...data, explanation: e.target.value })}
          placeholder="Explain why the answer is correct..."
        />
      </div>
    </div>
  );
}
