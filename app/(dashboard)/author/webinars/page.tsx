"use client";

import { useEffect, useState } from "react";
import { api, getImageUrl } from "@/lib/api";
import { Webinar } from "@/types/api";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Plus,
  PlusCircle,
  Video,
  Calendar,
  Link as LinkIcon,
  Trash2,
  Edit,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  User as UserIcon,
  Loader2,
  PlaySquare,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export default function AuthorWebinarsPage() {
  const { user } = useAuth();
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState<Webinar | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    banner: "",
    scheduled_date: "",
    scheduled_time: "09:00",
    duration: 60,
    link: "",
    recording_link: "",
    material_link: "",
  });

  const fetchWebinars = async () => {
    try {
      const response = await api.get<{ data: Webinar[] }>("/cms/webinars");
      setWebinars(response.data.data);
    } catch (error) {
      console.error("Failed to fetch webinars", error);
      toast.error("Failed to load webinars");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    setUploading(true);
    try {
      const response = await api.post("/upload", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData((prev) => ({ ...prev, banner: response.data.url }));
      toast.success("Image uploaded!");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWebinars();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.scheduled_date || !formData.scheduled_time) {
        toast.error("Please select both date and time");
        return;
      }

      // Combine date and time into ISO format
      const combinedDateTime = new Date(
        `${formData.scheduled_date}T${formData.scheduled_time}`,
      ).toISOString();

      const payload = {
        title: formData.title,
        description: formData.description,
        banner: formData.banner,
        link: formData.link,
        recording_link: formData.recording_link,
        material_link: formData.material_link,
        scheduled_at: combinedDateTime,
        duration: Number(formData.duration),
      };

      if (editingWebinar) {
        await api.put(`/cms/webinars/${editingWebinar.id}`, payload);
        toast.success("Webinar updated successfully!");
      } else {
        await api.post("/cms/webinars", payload);
        toast.success("Webinar created! Awaiting admin approval.");
      }
      fetchWebinars();
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save webinar");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this webinar?")) return;
    try {
      await api.delete(`/cms/webinars/${id}`);
      setWebinars(webinars.filter((w) => w.id !== id));
      toast.success("Webinar deleted");
    } catch (error) {
      toast.error("Failed to delete webinar");
    }
  };

  const handleOpenModal = (webinar?: Webinar) => {
    if (webinar) {
      const localDate = new Date(webinar.scheduled_at);
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, "0");
      const day = String(localDate.getDate()).padStart(2, "0");
      const hours = String(localDate.getHours()).padStart(2, "0");
      const minutes = String(localDate.getMinutes()).padStart(2, "0");

      const datePart = `${year}-${month}-${day}`;
      const timePart = `${hours}:${minutes}`;

      setEditingWebinar(webinar);
      setFormData({
        title: webinar.title,
        description: webinar.description,
        banner: webinar.banner,
        scheduled_date: datePart,
        scheduled_time: timePart,
        duration: webinar.duration || 60,
        link: webinar.link,
        recording_link: webinar.recording_link || "",
        material_link: webinar.material_link || "",
      });
    } else {
      setEditingWebinar(null);
      setFormData({
        title: "",
        description: "",
        banner: "",
        scheduled_date: "",
        scheduled_time: "09:00",
        duration: 60,
        link: "",
        recording_link: "",
        material_link: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingWebinar(null);
  };

  const getStatusBadge = (webinar: Webinar) => {
    const isPast =
      new Date(webinar.scheduled_at).getTime() +
        (webinar.duration || 60) * 60000 <
      new Date().getTime();

    if (webinar.status === "published" && isPast) {
      return (
        <Badge className="bg-slate-600 text-white border-none font-bold">
          <CheckCircle2 className="h-3 w-3 mr-1" /> EXECUTED
        </Badge>
      );
    }

    switch (webinar.status) {
      case "published":
        return (
          <Badge className="bg-emerald-500 text-white border-none font-bold">
            <CheckCircle2 className="h-3 w-3 mr-1" /> PUBLISHED
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500 text-white border-none font-bold">
            <Clock className="h-3 w-3 mr-1" /> PENDING APPROVAL
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-rose-500 text-white border-none font-bold">
            <AlertCircle className="h-3 w-3 mr-1" /> REJECTED
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">{webinar.status.toUpperCase()}</Badge>
        );
    }
  };

  if (loading)
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Clock className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );

  const totalWebinars = webinars.length;
  const publishedCount = webinars.filter(
    (w) => w.status === "published",
  ).length;
  const draftCount = webinars.filter((w) => w.status === "draft").length;

  const webinarStats = [
    {
      label: "Total Sessions",
      value: totalWebinars,
      icon: PlaySquare,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Live / Published",
      value: publishedCount,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Draft Sessions",
      value: draftCount,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Avg Duration",
      value:
        totalWebinars > 0
          ? `${Math.round(webinars.reduce((acc, w) => acc + w.duration, 0) / totalWebinars)}m`
          : "0m",
      icon: Video,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-10 pb-20 max-w-7xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Broadcaster Studio 🎙️
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Host, manage and distribute high-impact live interactive sessions.
          </p>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 snap-x">
          <Button
            onClick={() => handleOpenModal()}
            className="bg-rose-600 hover:bg-rose-700 rounded-xl font-bold px-6 h-11 transition-all shadow-lg shadow-rose-500/20 shrink-0 snap-start"
          >
            <Plus className="mr-2 h-5 w-5" /> Schedule Webinar
          </Button>
        </div>
      </div>

      {/* Stats Slider on Mobile */}
      <div className="flex overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 gap-4 snap-x">
        {webinarStats.map((stat, i) => (
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
                {stat.value}
              </h3>
            </div>
          </Card>
        ))}
      </div>

      {webinars.length === 0 ? (
        <Card className="border-2 border-dashed bg-slate-50/50 rounded-[2.5rem]">
          <CardContent className="flex flex-col items-center justify-center p-20 text-center">
            <div className="mb-6 rounded-3xl bg-white p-8 border shadow-sm">
              <Video className="h-16 w-16 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              No Scheduled Webinars
            </h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto font-medium">
              Start hosting live sessions to engage with your students in
              real-time. Admin approval is required before publishing.
            </p>
            <Button
              size="lg"
              onClick={() => handleOpenModal()}
              className="rounded-2xl"
            >
              Create Your First Webinar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {webinars.map((webinar) => (
            <Card
              key={webinar.id}
              className="group border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white flex flex-col"
            >
              <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-900 opacity-5 group-hover:opacity-10 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="h-12 w-12 text-indigo-100 group-hover:scale-110 transition-transform duration-500" />
                </div>
                {webinar.banner && (
                  <img
                    src={getImageUrl(webinar.banner)}
                    alt={webinar.title}
                    className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                  />
                )}
                <div className="absolute top-6 right-6">
                  {getStatusBadge(webinar)}
                </div>
              </div>

              <CardHeader className="p-8 pb-0">
                <div className="flex items-center gap-3 text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-3 opacity-60">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />{" "}
                    {formatDate(webinar.scheduled_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {webinar.duration || 0}{" "}
                    Minutes
                  </div>
                </div>
                <CardTitle className="text-2xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {webinar.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-slate-500 font-medium mt-3 leading-relaxed">
                  {webinar.description}
                </CardDescription>

                {/* Post-webinar Resources Info */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {webinar.recording_link && (
                    <Badge
                      variant="secondary"
                      className="bg-indigo-50 text-indigo-600 border-none font-bold text-[9px]"
                    >
                      <PlaySquare className="h-3 w-3 mr-1" /> Recording Linked
                    </Badge>
                  )}
                  {webinar.material_link && (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px]"
                    >
                      <FileText className="h-3 w-3 mr-1" /> Materials Linked
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-slate-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-600">
                    Author: {webinar.author_name || "Unknown"}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-8 pt-6 mt-auto">
                <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-slate-600 text-[10px] font-bold truncate">
                    <LinkIcon className="h-3.5 w-3.5 text-indigo-500" />
                    MEET: {webinar.link}
                  </div>
                  {webinar.recording_link && (
                    <div className="flex items-center gap-2 text-indigo-600 text-[10px] font-bold truncate">
                      <PlaySquare className="h-3.5 w-3.5" />
                      REC: {webinar.recording_link}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleOpenModal(webinar)}
                    variant="outline"
                    className="flex-1 rounded-xl font-bold border-slate-200 hover:bg-slate-50"
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit / Add Rec
                  </Button>
                  <Button
                    onClick={() => handleDelete(webinar.id)}
                    variant="ghost"
                    className="rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Professional Modal (Manual Overlay) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={handleCloseModal}
          />
          <Card className="relative w-full max-w-2xl bg-white shadow-2xl rounded-[3rem] overflow-y-auto max-h-[90vh] border-none">
            <div className="sticky top-0 right-0 p-8 flex justify-end z-10 bg-white/80 backdrop-blur-md">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseModal}
                className="rounded-full hover:bg-slate-100"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <CardHeader className="p-10 pb-0 pt-2">
              <CardTitle className="text-3xl font-black text-slate-900">
                {editingWebinar ? "Edit Webinar" : "New Webinar Session"}
              </CardTitle>
              <CardDescription className="text-lg font-medium text-slate-500">
                Update details or add recording links for completed sessions.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Webinar Title
                  </Label>
                  <Input
                    required
                    placeholder="e.g., Masterclass Backend Go"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="rounded-xl border-slate-200 h-12 font-bold focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Scheduled Date
                  </Label>
                  <div className="relative group/input">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover/input:text-indigo-500 transition-colors pointer-events-none" />
                    <Input
                      required
                      type="date"
                      value={formData.scheduled_date}
                      onClick={(e) => (e.target as any).showPicker?.()}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scheduled_date: e.target.value,
                        })
                      }
                      className="rounded-xl border-slate-200 h-12 pl-12 font-bold focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Scheduled Time
                  </Label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative group/select">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover/select:text-indigo-500 transition-colors pointer-events-none z-10" />
                      <select
                        required
                        value={formData.scheduled_time.split(":")[0] || "09"}
                        onChange={(e) => {
                          const [h, m] = (
                            formData.scheduled_time || "09:00"
                          ).split(":");
                          setFormData({
                            ...formData,
                            scheduled_time: `${e.target.value}:${m || "00"}`,
                          });
                        }}
                        className="w-full rounded-xl border border-slate-200 h-12 pl-12 pr-4 font-bold focus:ring-2 focus:ring-indigo-500/20 appearance-none bg-white cursor-pointer"
                      >
                        {Array.from({ length: 24 }).map((_, i) => {
                          const val = i.toString().padStart(2, "0");
                          return (
                            <option key={val} value={val}>
                              {val} (Hour)
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <span className="font-black text-slate-300">:</span>
                    <div className="flex-1 relative group/select">
                      <select
                        required
                        value={formData.scheduled_time.split(":")[1] || "00"}
                        onChange={(e) => {
                          const [h, m] = (
                            formData.scheduled_time || "09:00"
                          ).split(":");
                          setFormData({
                            ...formData,
                            scheduled_time: `${h || "09"}:${e.target.value}`,
                          });
                        }}
                        className="w-full rounded-xl border border-slate-200 h-12 px-4 font-bold focus:ring-2 focus:ring-indigo-500/20 appearance-none bg-white cursor-pointer"
                      >
                        {Array.from({ length: 60 }).map((_, i) => {
                          const val = i.toString().padStart(2, "0");
                          return (
                            <option key={val} value={val}>
                              {val} (Min)
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Duration (Minutes)
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      required
                      type="number"
                      min="1"
                      placeholder="e.g., 60"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: Number(e.target.value),
                        })
                      }
                      className="rounded-xl border-slate-200 h-12 pl-11 font-bold focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Meeting / Registration Link
                </Label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    required
                    placeholder="https://zoom.us/j/..."
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    className="rounded-xl border-slate-200 h-12 pl-11 font-bold focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-1">
                  This link is shown to students before the webinar starts.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 text-indigo-600">
                  <Label className="text-xs font-black uppercase tracking-widest">
                    Recording Link (Optional)
                  </Label>
                  <div className="relative">
                    <PlaySquare className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" />
                    <Input
                      placeholder="https://youtube.com/watch?v=..."
                      value={formData.recording_link}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recording_link: e.target.value,
                        })
                      }
                      className="rounded-xl border-indigo-200 h-12 pl-11 font-bold focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
                <div className="space-y-2 text-emerald-600">
                  <Label className="text-xs font-black uppercase tracking-widest">
                    Materials Link (Optional)
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" />
                    <Input
                      placeholder="https://drive.google.com/..."
                      value={formData.material_link}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          material_link: e.target.value,
                        })
                      }
                      className="rounded-xl border-emerald-200 h-12 pl-11 font-bold focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Webinar Banner
                </Label>
                <div className="space-y-4">
                  {formData.banner && (
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border">
                      <img
                        src={getImageUrl(formData.banner)}
                        className="w-full h-full object-cover"
                        alt="Preview"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        onClick={() => setFormData({ ...formData, banner: "" })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 rounded-xl border-dashed border-2 font-bold hover:bg-slate-50 relative"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : (
                        <Upload className="h-5 w-5 mr-2" />
                      )}
                      {uploading ? "Uploading..." : "Upload Banner Image"}
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleImageUpload}
                        accept="image/*"
                      />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Description
                </Label>
                <Textarea
                  placeholder="Tell students what they will learn in this session..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="rounded-2xl border-slate-200 font-medium focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center gap-4 pt-4 pb-10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCloseModal}
                  className="flex-1 h-14 rounded-2xl font-black text-slate-500"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-2 h-14 rounded-2xl font-black bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100"
                >
                  {editingWebinar ? "Save Changes" : "Schedule Webinar"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
