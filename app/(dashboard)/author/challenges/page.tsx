"use client";

import { useEffect, useState } from "react";
import { api, getImageUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Plus,
  Zap,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Settings,
  Image as ImageIcon,
  Loader2,
  Search,
  Edit,
  CheckCircle2,
  Clock,
  Layers,
  LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ChallengesManagerPage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    thumbnail: "",
    difficulty: "medium",
    status: "draft",
  });

  const fetchChallenges = async () => {
    try {
      const res = await api.get("/cms/challenges");
      setChallenges(res.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch challenges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleOpenModal = (challenge: any = null) => {
    if (challenge) {
      setFormData({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description || "",
        thumbnail: challenge.thumbnail || "",
        difficulty: challenge.difficulty || "medium",
        status: challenge.status || "draft",
      });
    } else {
      setFormData({
        id: null,
        title: "",
        description: "",
        thumbnail: "",
        difficulty: "medium",
        status: "draft",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title) return toast.error("Title is required");

    setIsSubmitting(true);
    try {
      if (formData.id) {
        await api.put(`/cms/challenges/${formData.id}`, formData);
        toast.success("Challenge updated!");
      } else {
        await api.post("/cms/challenges", formData);
        toast.success("Challenge created! Now you can add content blocks.");
      }
      setIsModalOpen(false);
      fetchChallenges();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this challenge?")) return;

    try {
      await api.delete(`/cms/challenges/${id}`);
      toast.success("Challenge deleted");
      fetchChallenges();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const totalChallenges = challenges.length;
  const publishedCount = challenges.filter(
    (c) => c.status === "published",
  ).length;
  const draftCount = totalChallenges - publishedCount;

  const challengeStats = [
    {
      label: "Global Challenges",
      value: totalChallenges,
      icon: LayoutGrid,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Active / Published",
      value: publishedCount,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Draft Projects",
      value: draftCount,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Total Blocks",
      value: challenges.reduce((acc, c) => acc + (c.blocks?.length || 0), 0),
      icon: Layers,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-10 pb-20 max-w-7xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Challenge Factory 🏭
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Design and deploy high-impact coding challenges for your students.
          </p>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 snap-x">
          <Button
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold px-6 h-11 transition-all shadow-lg shadow-indigo-500/20 shrink-0 snap-start"
          >
            <Plus className="mr-2 h-5 w-5" /> Start New Challenge
          </Button>
        </div>
      </div>

      {/* Stats Slider on Mobile */}
      <div className="flex overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 gap-4 snap-x">
        {challengeStats.map((stat, i) => (
          <Card
            key={i}
            className="border-none shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden bg-white min-w-[150px] md:min-w-0 snap-center p-5 flex flex-col items-center text-center gap-2"
          >
            <div className={cn("p-2.5 rounded-2xl", stat.bg)}>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                {stat.label}
              </p>
              <h3 className="text-xl font-black text-slate-900">
                {stat.value.toLocaleString()}
              </h3>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <Input
            placeholder="Search for challenges..."
            className="pl-12 rounded-2xl border-slate-200 h-12 bg-white focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
          />
        </div>
      </div>
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-slate-200" />
        </div>
      ) : challenges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {challenges.map((challenge) => (
            <Card
              key={challenge.id}
              className="group border-none shadow-xl hover:shadow-2xl transition-all duration-500 rounded-4xl overflow-hidden bg-white"
            >
              <div className="aspect-video relative overflow-hidden bg-slate-100">
                {challenge.thumbnail ? (
                  <img
                    src={getImageUrl(challenge.thumbnail)}
                    alt={challenge.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Zap className="h-12 w-12 text-slate-200" />
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge
                    className={cn(
                      "border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg",
                      challenge.status === "published"
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-500 text-white",
                    )}
                  >
                    {challenge.status}
                  </Badge>
                  <Badge className="bg-yellow-500 text-white border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg">
                    {challenge.difficulty}
                  </Badge>
                </div>
              </div>

              <CardHeader className="p-6">
                <CardTitle className="text-xl font-black group-hover:text-yellow-600 transition-colors line-clamp-1">
                  {challenge.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-2 font-medium">
                  {challenge.description || "No description provided."}
                </CardDescription>
              </CardHeader>

              <CardFooter className="p-6 pt-0 flex gap-3">
                <Button
                  asChild
                  className="flex-1 bg-slate-900 hover:bg-slate-800 rounded-2xl h-11 font-bold"
                >
                  <Link href={`/author/challenges/${challenge.id}/edit`}>
                    <Edit2 className="mr-2 h-4 w-4" /> Edit Content
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOpenModal(challenge)}
                  className="rounded-2xl h-11 px-4 border-slate-200"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDelete(challenge.id)}
                  className="rounded-2xl h-11 px-4 border-slate-200 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-4xl">
          <CardContent className="flex flex-col items-center justify-center p-20 text-center">
            <div className="h-20 w-20 bg-white shadow-inner rounded-3xl flex items-center justify-center mb-6 border">
              <Zap className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black mb-2">No Challenges Yet</h3>
            <p className="text-muted-foreground mb-8 max-w-sm font-medium">
              Start creating interactive challenges to keep your students
              engaged and test their skills.
            </p>
            <Button
              onClick={() => handleOpenModal()}
              className="bg-yellow-500 hover:bg-yellow-600 shadow-xl shadow-yellow-200 px-10 h-14 rounded-full font-bold text-lg"
            >
              Create Your First Challenge
            </Button>
          </CardContent>
        </Card>
      )}

      {/* MODAL SETTINGS */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-4xl border-none p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              Challenge Settings
            </DialogTitle>
            <DialogDescription className="font-medium">
              Update the metadata for this challenge.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Title
              </Label>
              <Input
                placeholder="Ex: Master the React Basics"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="rounded-2xl h-12 border-slate-200 font-bold focus:ring-yellow-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Description
              </Label>
              <Textarea
                placeholder="What is this challenge about?"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="rounded-2xl min-h-[100px] border-slate-200 font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Difficulty
                </Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(v) =>
                    setFormData({ ...formData, difficulty: v })
                  }
                >
                  <SelectTrigger className="rounded-2xl h-12 border-slate-200 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    <SelectItem value="easy" className="font-bold">
                      Easy
                    </SelectItem>
                    <SelectItem value="medium" className="font-bold">
                      Medium
                    </SelectItem>
                    <SelectItem value="hard" className="font-bold">
                      Hard
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger className="rounded-2xl h-12 border-slate-200 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    <SelectItem value="draft" className="font-bold">
                      Draft
                    </SelectItem>
                    <SelectItem
                      value="published"
                      className="font-bold text-emerald-600"
                    >
                      Published
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl h-12 font-bold shadow-lg shadow-yellow-100"
            >
              {isSubmitting ? "Saving..." : "Save Challenge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
