"use client";

import { useEffect, useState } from "react";
import { api, getImageUrl } from "@/lib/api";
import { User, Certificate } from "@/types/api";
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
import {
  User as UserIcon,
  Upload,
  ExternalLink,
  Award,
  BookOpen,
  Loader2,
  Share2,
  TrendingUp,
  Mail,
  Lock,
  Camera,
  Heart,
  Briefcase,
  Zap,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [rank, setRank] = useState<number>(0);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
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
      const res = await api.get<{ data: User; rank: number }>("/cms/profile");
      const user = res.data.data;
      setProfile(user);
      setRank(res.data.rank);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        username: user.username || "",
        bio: user.author_profile?.bio || "",
        occupation: user.author_profile?.occupation || "",
        avatar: user.avatar || "",
      });

      const certsRes = await api.get<{ data: Certificate[] }>(
        "/my-certificates",
      );
      setCertificates(certsRes.data.data);
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
      toast.success("Avatar updated!");
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
      toast.success("Profile saved successfully!");
      setFormData((prev) => ({ ...prev, password: "" }));
      fetchProfileData();
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const copyPortfolioLink = () => {
    if (!profile) return;
    const route =
      profile.role === "admin" || profile.role === "author"
        ? "author"
        : "portfolio";
    const identifier = profile.username || profile.id;
    const url = `${window.location.origin}/${route}/${identifier}`;
    navigator.clipboard.writeText(url);
    toast.success(
      `${route.charAt(0).toUpperCase() + route.slice(1)} portfolio link copied!`,
    );
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Account Settings
          </h1>
          <p className="text-slate-500 font-medium text-lg mt-2">
            Configure your presence on the platform and build your professional
            portfolio.
          </p>
        </div>
        <Button
          onClick={copyPortfolioLink}
          className="rounded-3xl font-black h-14 px-8 bg-blue-600 hover:bg-slate-900 text-white shadow-2xl shadow-blue-200 transition-all active:scale-95"
        >
          <Share2 className="h-5 w-5 mr-3" /> Get Portfolio Link
        </Button>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Profile Visualization Sticky Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white sticky top-10">
            <div className="h-32 bg-linear-to-br from-blue-600 to-indigo-700 w-full" />
            <CardContent className="px-8 pb-10 flex flex-col items-center text-center -mt-16">
              <div className="relative group mb-6">
                <div className="h-32 w-32 rounded-[2.5rem] bg-white p-1.5 shadow-2xl relative">
                  <div className="w-full h-full rounded-[2.2rem] bg-slate-100 overflow-hidden">
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
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-[2.2rem]">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  )}
                  <label className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3 rounded-2xl shadow-xl cursor-pointer hover:scale-110 active:scale-90 transition-all border-4 border-white">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>

              <h2 className="text-3xl font-black text-slate-900 leading-tight">
                {formData.name || "Staredge Student"}
              </h2>
              <p className="text-indigo-600 font-black text-xs tracking-widest uppercase mt-2 bg-indigo-50 px-4 py-1.5 rounded-full">
                {formData.occupation || "Learning Explorer"}
              </p>

              {profile?.role === "user" && (
                <div className="w-full grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-slate-50 p-4 rounded-3xl text-center">
                    <p className="text-2xl font-black text-slate-900">
                      {profile?.xp || 0}
                    </p>
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      Total XP
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-3xl text-center">
                    <p className="text-2xl font-black text-slate-900">
                      {certificates.length}
                    </p>
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      Awards
                    </p>
                  </div>
                </div>
              )}

              <div className="w-full h-px bg-slate-100 my-8" />

              <div className="w-full space-y-4 text-left">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center shrink-0">
                    <Heart className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-slate-400 leading-none mb-1">
                      Passions
                    </p>
                    <p className="text-sm font-bold text-slate-600 line-clamp-2">
                      {formData.bio || "No passions shared yet."}
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-2xl font-bold border-2 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all"
                    asChild
                  >
                    <a
                      href={`/${profile?.role === "admin" || profile?.role === "author" ? "author" : "portfolio"}/${profile?.username || profile?.id}`}
                      target="_blank"
                    >
                      View Public Portfolio{" "}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Forms */}
        <div className="lg:col-span-8 space-y-10">
          <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/50 bg-white">
            <CardHeader className="p-10 pb-0">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-black">
                    Core Profile
                  </CardTitle>
                  <CardDescription className="text-lg font-bold">
                    Public identity & login credentials
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              <form onSubmit={handleSave} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Mail className="h-3 w-3" /> Email Address
                    </Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="rounded-2xl border-slate-200 h-14 font-black transition-all focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Lock className="h-3 w-3" /> New Password
                    </Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="rounded-2xl border-slate-200 h-14 font-black transition-all focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500">
                      Display Name
                    </Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="rounded-2xl border-slate-200 h-14 font-black transition-all focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500">
                      Username (Handle)
                    </Label>
                    <Input
                      value={formData.username}
                      placeholder="username"
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="rounded-2xl border-slate-200 h-14 font-black transition-all focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Occupation & Industry
                  </Label>
                  <Input
                    value={formData.occupation}
                    placeholder="e.g. Design Student / Frontend Developer"
                    onChange={(e) =>
                      setFormData({ ...formData, occupation: e.target.value })
                    }
                    className="rounded-2xl border-slate-200 h-14 font-black transition-all focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Personal Bio / Objectives
                  </Label>
                  <Textarea
                    value={formData.bio}
                    placeholder="Short summary about your goals and interests..."
                    rows={5}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className="rounded-4xl border-slate-200 font-bold p-6 transition-all focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <Button
                  disabled={saving}
                  className="w-full h-16 rounded-3xl font-black bg-slate-900 hover:bg-indigo-600 text-white shadow-2xl shadow-indigo-100 transition-all text-lg active:scale-95"
                >
                  {saving ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    "Sync Profile Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Portfolio Stats Preview */}
          {profile?.role === "user" && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                Achievements Snapshot{" "}
                <TrendingUp className="h-8 w-8 text-emerald-500" />
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-100 bg-white p-8">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-amber-50 rounded-3xl flex items-center justify-center shadow-inner">
                      <Award className="h-8 w-8 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-4xl font-black text-slate-900 leading-none mb-1">
                        {certificates.length}
                      </p>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Certificates Earned
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-100 bg-white p-8">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-rose-50 rounded-3xl flex items-center justify-center shadow-inner">
                      <TrendingUp className="h-8 w-8 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-4xl font-black text-slate-900 leading-none mb-1">
                        #{rank}
                      </p>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Community Rank
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
