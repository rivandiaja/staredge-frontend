"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface InputData {
  label: string;
  placeholder: string;
}

interface InputEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

export function InputEditor({ initialContent, onChange }: InputEditorProps) {
  const [data, setData] = useState<InputData>({
    label: "",
    placeholder: "",
  });

  useEffect(() => {
    if (initialContent) {
      try {
        const parsed = JSON.parse(initialContent);
        setData(parsed);
      } catch (e) {
        // ignore
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
    <div className="space-y-4 p-4 border rounded-md bg-card">
      <div className="space-y-2">
        <Label>Input Label</Label>
        <Input
          value={data.label}
          onChange={(e) => setData({ ...data, label: e.target.value })}
          placeholder="e.g. Paste your GitHub repository link..."
        />
      </div>
      <div className="space-y-2">
        <Label>Placeholder Text</Label>
        <Input
          value={data.placeholder}
          onChange={(e) => setData({ ...data, placeholder: e.target.value })}
          placeholder="e.g. https://github.com/username/project"
        />
      </div>
    </div>
  );
}
