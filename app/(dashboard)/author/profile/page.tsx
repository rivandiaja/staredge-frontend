"use client";

import { useEffect, useState } from "react";
import { api, getImageUrl } from "@/lib/api";
import { User, LearningPath, Webinar } from "@/types/api";
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
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  User as UserIcon,
  Upload,
  ExternalLink,
  BookOpen,
  Video,
  Loader2,
  MapPin,
  Briefcase,
  Globe,
  Share2,
  TrendingUp,
  Users,
  Star,
} from "lucide-react";

export default function AuthorProfilePage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [courses, setCourses] = useState<LearningPath[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    username: "",
    bio: "",
    occupation: "",
    avatar: "",
  });

  const fetchProfileData = async () => {
    try {
      const res = await api.get<{ data: User }>("/cms/profile");
      const user = res.data.data;
      setProfile(user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "", // Keep password empty initially
        username: user.username || "",
        bio: user.author_profile?.bio || "",
        occupation: user.author_profile?.occupation || "",
        avatar: user.avatar || "",
      });

      // Fetch portfolio items (automatic)
      const coursesRes = await api.get<{ data: LearningPath[] }>(
        "/cms/author-courses",
      );
      setCourses(coursesRes.data.data.filter((c) => c.status === "published"));

      const webinarsRes = await api.get<{ data: Webinar[] }>("/cms/webinars");
      setWebinars(
        webinarsRes.data.data.filter((w) => w.status === "published"),
      );
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

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
      setFormData((prev) => ({ ...prev, avatar: response.data.url }));
      toast.success("Avatar uploaded!");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/cms/profile", formData);
      toast.success("Profile updated successfully!");
      setFormData((prev) => ({ ...prev, password: "" })); // Clear password
      fetchProfileData();
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const copyPortfolioLink = () => {
    if (!profile) return;
    const url = `${window.location.origin}/author/${profile.username}`;
    navigator.clipboard.writeText(url);
    toast.success("Portfolio link copied!");
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );

  const profileStats = [
    {
      label: "Reach",
      value: "2.4k+",
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Courses",
      value: courses.length,
      icon: BookOpen,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Webinars",
      value: webinars.length,
      icon: Video,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      label: "Rating",
      value: "4.9",
      icon: Star,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-10 pb-20 max-w-7xl mx-auto px-4 md:px-0">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-indigo-600 via-blue-600 to-indigo-800 p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="group relative">
            <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white/20 overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
              {profile?.avatar ? (
                <img
                  src={getImageUrl(profile.avatar)}
                  className="h-full w-full object-cover"
                  alt={profile.name}
                />
              ) : (
                <div className="h-full w-full bg-white/10 flex items-center justify-center">
                  <UserIcon className="h-16 w-16 text-white/40" />
                </div>
              )}
            </div>
          </div>
          <div className="text-center md:text-left space-y-3">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              {profile?.name}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <Badge className="bg-white/20 backdrop-blur-md text-white border-none rounded-lg px-3 py-1 font-black text-[10px] tracking-widest">
                CERTIFIED AUTHOR
              </Badge>
              <div className="flex items-center gap-2 text-blue-100 text-sm font-bold">
                <Briefcase className="h-4 w-4" /> Instructor
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Stats Slider on Mobile */}
      <div className="flex overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 gap-4 snap-x">
        {profileStats.map((stat, i) => (
          <Card
            key={i}
            className="border-none shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden bg-white min-w-[140px] md:min-w-0 snap-center p-5 flex flex-col items-center text-center gap-2"
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

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="relative group mb-6">
                <div className="h-32 w-32 rounded-[2.5rem] bg-slate-100 overflow-hidden border-4 border-white shadow-lg relative">
                  {formData.avatar ? (
                    <img
                      src={getImageUrl(formData.avatar)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon className="h-12 w-12 text-slate-300" />
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2.5 rounded-2xl shadow-lg cursor-pointer hover:scale-110 transition-transform">
                  <Upload className="h-4 w-4" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              <h2 className="text-2xl font-black text-slate-900">
                {formData.name}
              </h2>
              <p className="text-blue-600 font-bold text-sm tracking-widest uppercase mt-1">
                {formData.occupation || "Independent Author"}
              </p>

              <div className="w-full h-px bg-slate-100 my-6" />

              <div className="w-full space-y-4 text-left">
                <div className="flex items-center gap-3 text-slate-500 font-medium">
                  <Briefcase className="h-4 w-4 text-blue-500" />
                  <span>
                    {webinars.length + courses.length} Published Items
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
                  <Globe className="h-4 w-4 text-emerald-500" />
                  <a
                    href={`/author/${profile?.username}`}
                    className="hover:text-blue-600 underline decoration-blue-200 decoration-2 underline-offset-4"
                    target="_blank"
                  >
                    Public Portfolio Page
                  </a>
                </div>
                <Button
                  onClick={copyPortfolioLink}
                  variant="outline"
                  className="rounded-2xl font-bold border-2 hover:bg-slate-50 w-full"
                >
                  <Share2 className="h-4 w-4 mr-2" /> Share Portfolio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Form & Portfolio */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-2xl font-black">
                Personal Details
              </CardTitle>
              <CardDescription className="font-medium">
                Information shown on your public portfolio.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Email Address
                    </Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="rounded-xl border-slate-200 h-12 font-bold focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                      New Password
                    </Label>
                    <Input
                      type="password"
                      placeholder="Leave blank to keep current"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="rounded-xl border-slate-200 h-12 font-bold focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Display Name
                    </Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="rounded-xl border-slate-200 h-12 font-bold focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Username (Portfolio Link)
                    </Label>
                    <Input
                      value={formData.username}
                      placeholder="e.g. johndoe"
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="rounded-xl border-slate-200 h-12 font-bold focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Occupation / Role
                    </Label>
                    <Input
                      value={formData.occupation}
                      placeholder="e.g. Senior Backend Engineer"
                      onChange={(e) =>
                        setFormData({ ...formData, occupation: e.target.value })
                      }
                      className="rounded-xl border-slate-200 h-12 font-bold focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Professional Bio
                  </Label>
                  <Textarea
                    value={formData.bio}
                    placeholder="Tell your students about yourself..."
                    rows={4}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className="rounded-2xl border-slate-200 font-medium focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <Button
                  disabled={saving}
                  className="w-full h-14 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100"
                >
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Profile Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Automatic Portfolio Preview */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Automatic Portfolio{" "}
              <TrendingUp className="h-6 w-6 text-emerald-500" />
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="rounded-[2rem] border-none shadow-lg shadow-slate-100 bg-blue-50/50 p-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900">
                      {courses.length}
                    </p>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Courses
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="rounded-4xl border-none shadow-lg shadow-slate-100 bg-emerald-50/50 p-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <Video className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900">
                      {webinars.length}
                    </p>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Webinars
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
