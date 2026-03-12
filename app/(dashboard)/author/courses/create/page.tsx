"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, getImageUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  thumbnail: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export default function AuthorCourseCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      thumbnail: "",
    },
  });

  const thumbnailValue = watch("thumbnail");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post<{ url: string }>("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // API returns /uploads/filename.png
      // Prepend backend base URL if needed, but relative should work if served correctly
      setValue("thumbnail", res.data.url);
      toast.success("Image uploaded");
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: CourseFormValues) => {
    setLoading(true);
    try {
      const res = await api.post("/cms/learning-paths", data);
      toast.success("Course created successfully");

      if (res.data?.data?.id) {
        router.push(`/author/courses/${res.data.data.id}/edit`);
      } else {
        router.push("/author/courses");
      }
    } catch (error: unknown) {
      console.error("Failed to create course", error);
      let msg = "Failed to create course";
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.error || msg;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/author/courses">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Create New Course</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>
            Basic information about your learning path.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Advanced React Patterns"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Briefly describe what students will learn..."
                className="min-h-[100px]"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail Image</Label>
              <div className="flex flex-col gap-4">
                {thumbnailValue && (
                  <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={getImageUrl(thumbnailValue)}
                      className="h-full w-full object-cover"
                      alt="Thumbnail Preview"
                      onError={(e) => {
                        // Fallback to local preview if remote fails
                        if (preview)
                          (e.target as HTMLImageElement).src = preview;
                      }}
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    id="thumbnail-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                <input type="hidden" {...register("thumbnail")} />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={loading || uploading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Course
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
