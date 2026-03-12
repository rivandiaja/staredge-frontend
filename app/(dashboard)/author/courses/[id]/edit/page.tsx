"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, getImageUrl } from "@/lib/api";
import { LearningPath, Module, StageSummary } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  ChevronLeft,
  Loader2,
  Save,
  Trash2,
  Plus,
  GripVertical,
  MoreVertical,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ id: string }>;
}

const courseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  thumbnail: z.string().optional(),
  has_final_assignment: z.boolean(),
  final_assignment_instructions: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export default function AuthorCourseEditPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<LearningPath | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Local state for module/stage creation
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");

  const [isAddingStage, setIsAddingStage] = useState<number | null>(null); // module ID
  const [newStageTitle, setNewStageTitle] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      thumbnail: "",
      has_final_assignment: false,
      final_assignment_instructions: "",
    },
  });

  const thumbnailValue = watch("thumbnail");

  const fetchData = async () => {
    try {
      const res = await api.get<{ data: LearningPath }>(
        `/learning-paths/${id}`,
      );
      // Workaround for API response structure variability
      const data: any = res.data;
      let courseData = data.data || data;

      setCourse(courseData);
      reset({
        title: courseData.title,
        description: courseData.description,
        thumbnail: courseData.thumbnail,
        has_final_assignment: !!courseData.has_final_assignment,
        final_assignment_instructions:
          courseData.final_assignment_instructions || "",
      });

      if (courseData.modules) {
        setModules(courseData.modules);
      } else if (courseData.Modules) {
        setModules(courseData.Modules);
      }
    } catch (error) {
      console.error("Failed to fetch course", error);
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

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

      setValue("thumbnail", res.data.url, { shouldDirty: true });
      toast.success("Image uploaded");
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const onUpdateDetails = async (data: CourseFormValues) => {
    setSaving(true);
    try {
      await api.put(`/cms/learning-paths/${id}`, data); // Use PUT for update
      toast.success("Course details updated");
      router.refresh();
      // Reset form with new data to clear isDirty
      reset(data);
    } catch (error) {
      console.error("Failed to update course", error);
      toast.error("Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateModule = async () => {
    if (!newModuleTitle.trim()) return;
    try {
      const orderIndex = modules.length + 1;
      await api.post("/cms/modules", {
        learning_path_id: parseInt(id),
        title: newModuleTitle,
        description: "",
        order_index: orderIndex,
      });
      toast.success("Module created");
      setNewModuleTitle("");
      setIsAddingModule(false);
      fetchData(); // Refresh
    } catch (error) {
      toast.error("Failed to create module");
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm("Are you sure? This will delete all stages in this module."))
      return;
    try {
      await api.delete(`/cms/modules/${moduleId}`);
      toast.success("Module deleted");
      setModules(modules.filter((m) => m.id !== moduleId));
    } catch (error) {
      toast.error("Failed to delete module");
    }
  };

  const handleCreateStage = async (moduleId: number) => {
    if (!newStageTitle.trim()) return;
    try {
      // Calculate order index
      const module = modules.find((m) => m.id === moduleId);
      const stages = module?.stages || [];
      const orderIndex = stages.length + 1;

      const res = await api.post("/cms/stages", {
        module_id: moduleId,
        title: newStageTitle,
        order_index: orderIndex,
      });

      const newStage = res.data.data;

      // Optimistic Update
      setModules(
        modules.map((m) =>
          m.id === moduleId
            ? { ...m, stages: [...(m.stages || []), newStage] }
            : m,
        ),
      );

      toast.success("Stage created");
      setNewStageTitle("");
      setIsAddingStage(null);

      // AUTO-REDIRECT TO EDITOR
      router.push(`/author/courses/${id}/stage/${newStage.id}/edit`);
    } catch (error) {
      toast.error("Failed to create stage");
    }
  };

  const handleDeleteStage = async (stageId: number) => {
    if (!confirm("Delete this stage? User progress will be lost.")) return;
    try {
      await api.delete(`/cms/stages/${stageId}`);
      toast.success("Stage deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete stage");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!course) return <div className="p-8">Course not found</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/author/courses">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Course</h1>
            <p className="text-muted-foreground text-sm">{course.title}</p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/learning-paths/${id}`}>Preview Course</Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[350px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(onUpdateDetails)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input {...register("title")} />
                  {errors.title && (
                    <p className="text-red-500 text-xs">
                      {errors.title.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    {...register("description")}
                    className="min-h-[120px]"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs">
                      {errors.description.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Thumbnail Image</Label>
                  <div className="flex flex-col gap-4">
                    {thumbnailValue && (
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                        <img
                          src={getImageUrl(thumbnailValue)}
                          className="h-full w-full object-cover"
                          alt="Thumbnail Preview"
                          onError={(e) => {
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
                      {uploading && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </div>
                    <input type="hidden" {...register("thumbnail")} />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_final_assignment"
                      checked={watch("has_final_assignment")}
                      onCheckedChange={(checked) =>
                        setValue("has_final_assignment", !!checked, {
                          shouldDirty: true,
                        })
                      }
                    />
                    <Label htmlFor="has_final_assignment" className="font-bold">
                      Require Final Project?
                    </Label>
                  </div>

                  {watch("has_final_assignment") && (
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-indigo-600 font-black">
                        Final Project Instructions
                      </Label>
                      <Textarea
                        {...register("final_assignment_instructions")}
                        placeholder="What should the student submit? (e.g. Github Repo Link)"
                        className="bg-indigo-50/30 border-indigo-100 focus:border-indigo-300 min-h-[100px]"
                      />
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={saving || uploading || !isDirty}
                  className="w-full"
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Details
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Curriculum</CardTitle>
              {!isAddingModule && (
                <Button size="sm" onClick={() => setIsAddingModule(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Module
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {isAddingModule && (
                <div className="flex items-end gap-2 p-4 border rounded bg-secondary/50">
                  <div className="w-full space-y-2">
                    <Label>Module Title</Label>
                    <Input
                      value={newModuleTitle}
                      onChange={(e) => setNewModuleTitle(e.target.value)}
                      placeholder="e.g. Introduction to Hooks"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateModule}>Add</Button>
                    <Button
                      variant="ghost"
                      onClick={() => setIsAddingModule(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <div className="bg-muted p-3 flex items-center justify-between group">
                    <div className="flex items-center gap-3 font-medium">
                      <div className="bg-background w-6 h-6 rounded-full flex items-center justify-center text-xs border">
                        {index + 1}
                      </div>
                      {module.title}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDeleteModule(module.id)}
                          className="text-red-500"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Module
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="p-3 space-y-2 bg-card">
                    {module.stages &&
                      module.stages.map((stage) => (
                        <div
                          key={stage.id}
                          className="flex items-center justify-between p-2 rounded hover:bg-accent/50 group/stage border border-transparent hover:border-border"
                        >
                          <div className="flex items-center gap-2">
                            <div className="text-muted-foreground">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <span>{stage.title}</span>
                          </div>
                          <div className="flex gap-1">
                            {/* Link to Content Editor */}
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={`/author/courses/${id}/stage/${stage.id}/edit`}
                              >
                                <Edit2 className="h-3 w-3 mr-1" /> Edit Content
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => handleDeleteStage(stage.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}

                    {/* Add Stage to Module */}
                    {isAddingStage === module.id ? (
                      <div className="flex gap-2 items-center mt-2 pl-6">
                        <Input
                          value={newStageTitle}
                          onChange={(e) => setNewStageTitle(e.target.value)}
                          placeholder="Stage title..."
                          className="h-8"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreateStage(module.id);
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleCreateStage(module.id)}
                        >
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsAddingStage(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-muted-foreground hover:text-foreground pl-6"
                        onClick={() => setIsAddingStage(module.id)}
                      >
                        <Plus className="mr-2 h-3 w-3" /> Add Lesson
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {modules.length === 0 && !isAddingModule && (
                <div className="text-center py-8 text-muted-foreground">
                  No modules yet. Click "Add Module" to start adding content.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
