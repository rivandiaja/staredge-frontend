"use client";

import { useEffect, useState } from "react";
import { api, getImageUrl } from "@/lib/api";
import { User } from "@/types/api";
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
import { toast } from "sonner";
import {
  User as UserIcon,
  Upload,
  Loader2,
  ShieldCheck,
  Mail,
  Fingerprint,
} from "lucide-react";

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    username: "",
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
        password: "",
        username: user.username || "",
        avatar: user.avatar || "",
      });
    } catch (error) {
      toast.error("Failed to load admin profile");
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
      await api.put("/cms/profile", {
        ...formData,
        bio: "", // Admin doesn't need bio
        occupation: "System Administrator",
      });
      toast.success("Admin profile updated successfully!");
      setFormData((prev) => ({ ...prev, password: "" }));
      fetchProfileData();
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-[600px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 space-y-6 md:space-y-10">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200">
          <ShieldCheck className="text-white h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Admin Profile
          </h1>
          <p className="text-slate-500 font-medium">
            Manage your administrative account identity.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Avatar Sidebar */}
        <div className="md:col-span-1">
          <Card className="group rounded-3xl md:rounded-4xl border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
            <CardContent className="p-6 md:p-8 flex flex-col items-center text-center">
              <div className="relative group mb-6">
                <div className="h-40 w-40 rounded-[2.5rem] bg-slate-50 overflow-hidden border-4 border-white shadow-xl relative">
                  {formData.avatar ? (
                    <img
                      src={getImageUrl(formData.avatar)}
                      alt="Admin Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon className="h-16 w-16 text-slate-200" />
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-600 via-indigo-600 to-emerald-600" />
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-3 rounded-2xl shadow-2xl cursor-pointer hover:scale-110 transition-transform">
                  <Upload className="h-5 w-5" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900 leading-none">
                  {formData.name}
                </h2>
                <p className="text-indigo-600 font-bold text-[10px] tracking-widest uppercase">
                  Level 10 Admin
                </p>
              </div>

              <div className="w-full h-px bg-slate-100 my-8" />

              <div className="w-full space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600 truncate">
                    {profile?.email}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Fingerprint className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">
                    ID: {profile?.id}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2">
          <Card className="group rounded-3xl md:rounded-4xl border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
            <CardHeader className="p-6 md:p-8 pb-0">
              <CardTitle className="text-xl md:text-2xl font-black">
                Account Settings
              </CardTitle>
              <CardDescription className="text-xs md:text-sm font-medium">
                Update your identity within the Staredge platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSave} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Administrative Email
                    </Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="rounded-2xl border-slate-200 h-14 font-bold focus:ring-4 focus:ring-indigo-100 transition-all px-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                      New Security Password
                    </Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="rounded-2xl border-slate-200 h-14 font-bold focus:ring-4 focus:ring-indigo-100 transition-all px-6"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Full Legal Name
                    </Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="rounded-2xl border-slate-200 h-14 font-bold focus:ring-4 focus:ring-indigo-100 transition-all px-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Admin Username
                    </Label>
                    <Input
                      value={formData.username}
                      placeholder="admin_username"
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="rounded-2xl border-slate-200 h-14 font-bold focus:ring-4 focus:ring-indigo-100 transition-all px-6"
                    />
                    <p className="text-[10px] text-slate-400 font-medium pl-1">
                      Used for logs and administrative identification.
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    disabled={saving}
                    className="w-full h-16 rounded-3xl font-black bg-indigo-600 hover:bg-slate-900 text-white shadow-2xl shadow-indigo-100 transition-all text-lg"
                  >
                    {saving ? (
                      <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                    ) : (
                      "Update Identity"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
