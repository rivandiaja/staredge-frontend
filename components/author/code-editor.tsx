"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Code } from "lucide-react";

interface CodeData {
  code: string;
  language: string;
  allowCopy: boolean;
}

interface CodeEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "go",
  "html",
  "css",
  "json",
  "bash",
  "sql",
];

export function CodeEditor({ initialContent, onChange }: CodeEditorProps) {
  const [data, setData] = useState<CodeData>({
    code: "",
    language: "javascript",
    allowCopy: true,
  });

  useEffect(() => {
    if (initialContent) {
      try {
        const parsed = JSON.parse(initialContent);
        if (parsed && typeof parsed === "object") {
          setData({
            code: parsed.code || "",
            language: parsed.language || "javascript",
            allowCopy: parsed.allowCopy !== false,
          });
        } else {
          setData((prev) => ({ ...prev, code: initialContent }));
        }
      } catch (e) {
        setData((prev) => ({ ...prev, code: initialContent }));
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(JSON.stringify(data));
    }, 500);
    return () => clearTimeout(timer);
  }, [data, onChange]);

  return (
    <div className="space-y-4 p-4 border rounded-md bg-zinc-950 text-zinc-50">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900 p-2 rounded border border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-zinc-400 text-xs">Language:</Label>
            <select
              value={data.language}
              onChange={(e) => setData({ ...data, language: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs rounded px-2 py-1 outline-none focus:ring-1 focus:ring-primary"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="allow-copy"
              checked={data.allowCopy}
              onCheckedChange={(checked) =>
                setData({ ...data, allowCopy: !!checked })
              }
              className="border-zinc-700 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            />
            <Label
              htmlFor="allow-copy"
              className="text-zinc-400 text-xs cursor-pointer"
            >
              Enable Copy Button
            </Label>
          </div>
        </div>

        <div className="flex items-center gap-1 text-zinc-500">
          <Code className="h-3 w-3" />
          <span className="text-[10px] uppercase font-bold tracking-widest">
            Editor
          </span>
        </div>
      </div>

      <Textarea
        value={data.code}
        onChange={(e) => setData({ ...data, code: e.target.value })}
        placeholder="// Paste your code here..."
        className="w-full bg-transparent border-dashed border-zinc-800 focus-visible:ring-zinc-700 font-mono text-sm min-h-[200px] resize-y"
      />
    </div>
  );
}
