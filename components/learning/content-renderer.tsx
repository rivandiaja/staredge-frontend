"use client";

import React, { useState } from "react";
import { ContentBlock } from "@/types/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, XCircle, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ContentRendererProps {
  blocks: ContentBlock[];
}

export function ContentRenderer({ blocks }: ContentRendererProps) {
  // Sort blocks by order_index just in case API doesn't
  const sortedBlocks = [...blocks].sort(
    (a, b) => a.order_index - b.order_index,
  );

  return (
    <div className="space-y-8">
      {sortedBlocks.map((block) => {
        switch (block.type) {
          case "text":
            return <TextBlock key={block.id} content={block.content} />;
          case "code":
            return <CodeBlock key={block.id} content={block.content} />;
          case "video":
            return <VideoBlock key={block.id} content={block.content} />;
          case "image":
            // Simple image renderer for now
            return (
              <div key={block.id} className="rounded-lg overflow-hidden border">
                <img
                  src={block.content}
                  alt="Content"
                  className="w-full h-auto"
                />
              </div>
            );
          case "quiz":
            return <QuizBlock key={block.id} content={block.content} />;
          case "input":
            return <InputBlock key={block.id} content={block.content} />;
          default:
            return (
              <div
                key={block.id}
                className="p-4 border border-dashed rounded text-muted-foreground"
              >
                Unsupported block type: {block.type}
              </div>
            );
        }
      })}
    </div>
  );
}

function QuizBlock({ content }: { content: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  let quizData;
  try {
    quizData = JSON.parse(content);
  } catch (e) {
    return <div className="text-red-500">Invalid Quiz Data</div>;
  }

  const { question, options, explanation } = quizData;

  // Helper to get safe ID
  const getOptionId = (option: any, index: number) => {
    return option.id ? String(option.id) : `opt-${index}`;
  };

  const isCorrect = options?.find(
    (o: any, i: number) => getOptionId(o, i) === selected,
  )?.isCorrect;

  return (
    <div className="border rounded-lg p-6 bg-card space-y-4 shadow-sm select-none">
      <h3 className="font-semibold text-lg">{question || "Untitled Quiz"}</h3>

      <RadioGroup
        onValueChange={setSelected}
        disabled={submitted}
        value={selected || ""}
      >
        {options?.map((option: any, index: number) => {
          const optionId = getOptionId(option, index);
          return (
            <div
              key={optionId}
              className={cn(
                "flex items-center space-x-2 border p-3 rounded-md transition-colors cursor-pointer hover:bg-muted/50",
                submitted &&
                  option.isCorrect &&
                  "border-green-500 bg-green-500/10",
                submitted &&
                  !option.isCorrect &&
                  selected === optionId &&
                  "border-red-500 bg-red-500/10",
              )}
            >
              <RadioGroupItem value={optionId} id={optionId} />
              <Label htmlFor={optionId} className="flex-1 cursor-pointer">
                {option.text}
              </Label>
              {submitted && option.isCorrect && (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
              {submitted && !option.isCorrect && selected === optionId && (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </div>
          );
        })}
      </RadioGroup>

      {!submitted ? (
        <Button onClick={() => setSubmitted(true)} disabled={!selected}>
          Check Answer
        </Button>
      ) : (
        <div
          className={cn(
            "p-4 rounded-md text-sm",
            isCorrect
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
          )}
        >
          <p className="font-bold mb-1">
            {isCorrect ? "Correct!" : "Incorrect"}
          </p>
          <p>{explanation}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSubmitted(false);
              setSelected(null);
            }}
            className="mt-2 text-xs h-7"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}

function InputBlock({ content }: { content: string }) {
  let inputData;
  try {
    inputData = JSON.parse(content);
  } catch (e) {
    // Fallback if content is just a string
    inputData = { label: "Input", placeholder: content || "Type here..." };
  }

  const { label, placeholder } = inputData;

  return (
    <div className="space-y-2 p-4 border rounded-lg bg-muted/10 select-none">
      <Label>{label || "Input"}</Label>
      <Input placeholder={placeholder} />
    </div>
  );
}

function TextBlock({ content }: { content: string }) {
  // In a real app, use a markdown renderer like 'react-markdown'
  // For MVP, valid usage of simple text with newlines
  return (
    <div className="prose dark:prose-invert max-w-none select-none">
      {content.split("\n").map((line, i) => (
        <p key={i} className="mb-4">
          {line}
        </p>
      ))}
    </div>
  );
}

function CodeBlock({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  let code = content;
  let language = "javascript";
  let allowCopy = true;

  try {
    const data = JSON.parse(content);
    if (data && typeof data === "object" && data.code !== undefined) {
      code = data.code;
      language = data.language || "javascript";
      allowCopy = data.allowCopy !== false;
    }
  } catch (e) {
    // Not JSON, use plain content
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-lg overflow-hidden border bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-white/5">
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          {language}
        </span>
        {allowCopy && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-400 hover:text-zinc-50 hover:bg-white/10"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </div>
      <div className="p-2">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "1rem",
            backgroundColor: "transparent",
            fontSize: "0.875rem",
          }}
          codeTagProps={{
            style: {
              fontFamily: "var(--font-mono)",
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

function VideoBlock({ content }: { content: string }) {
  // Basic youtube embed detection or direct video link
  // Assuming content is a URL
  const isYoutube =
    content.includes("youtube.com") || content.includes("youtu.be");

  if (isYoutube) {
    // Extract video ID (naive impl)
    let videoId = "";
    if (content.includes("v=")) {
      videoId = content.split("v=")[1].split("&")[0];
    } else if (content.includes("youtu.be/")) {
      videoId = content.split("youtu.be/")[1];
    }

    return (
      <div className="aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="Video Content"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-black">
      <video controls className="w-full h-full" src={content} />
    </div>
  );
}
