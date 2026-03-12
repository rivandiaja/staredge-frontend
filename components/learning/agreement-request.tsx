"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "../ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock } from "lucide-react";

interface AgreementRequestProps {
  moduleId: number;
  moduleTitle: string;
  onSigned: () => void;
}

export function AgreementRequest({
  moduleId,
  moduleTitle,
  onSigned,
}: AgreementRequestProps) {
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);

  const handleSign = async () => {
    if (!agreed) return;

    setSigning(true);
    try {
      await api.post(`/modules/${moduleId}/agreement`);
      toast.success("Agreement signed successfully");
      onSigned();
    } catch (error) {
      console.error("Failed to sign agreement", error);
      toast.error("Failed to sign agreement. Please try again.");
    } finally {
      setSigning(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8 border-destructive/20 shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto bg-muted rounded-full p-3 w-fit mb-4">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle>Copyright Agreement</CardTitle>
        <CardDescription>
          Accessing <strong>{moduleTitle}</strong> requires your agreement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md border">
          <p className="mb-2">
            <strong>Intellectual Property Rights</strong>
          </p>
          <p className="mb-2">
            By accessing this content, you acknowledge that all materials (text,
            video, code) are the intellectual property of Staredge Digital and
            its authors.
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              You agree not to distribute, share, or reproduce this content.
            </li>
            <li>
              You agree to use this content solely for personal learning
              purposes.
            </li>
          </ul>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={agreed}
            onCheckedChange={(c: boolean | string) => setAgreed(!!c)}
          />
          <Label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I agree to the terms and conditions above.
          </Label>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={!agreed || signing}
          onClick={handleSign}
        >
          {signing ? "Signing..." : "Sign Agreement & Unlock"}
        </Button>
      </CardFooter>
    </Card>
  );
}
