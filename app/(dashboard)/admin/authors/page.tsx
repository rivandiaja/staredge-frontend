"use client";

import { useEffect, useState } from "react";
import {
  Award,
  Search,
  UserCheck,
  Mail,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Plus,
  TrendingUp,
  Star,
  Video,
  Trash2,
  Edit,
} from "lucide-react";
import { api, getImageUrl } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Author {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  author_profile?: {
    bio: string;
    occupation: string;
  };
  total_courses?: number;
  total_webinars?: number;
  avatar?: string;
}

export default function AuthorManagementPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isRecruitOpen, setIsRecruitOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Edit user state
  const [editingUser, setEditingUser] = useState<
    Partial<Author> & { bio?: string; occupation?: string }
  >({});

  // Recruit state
  const [recruitSearch, setRecruitSearch] = useState("");
  const [potentialUsers, setPotentialUsers] = useState<any[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  const fetchAuthors = async () => {
    try {
      const response = await api.get<{ data: any[] }>(
        "/admin/users?role=author",
      );
      setAuthors(response.data.data);
    } catch (error) {
      toast.error("Failed to load author data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const searchPotentialUsers = async () => {
    if (!recruitSearch.trim()) return;
    setSearchingUsers(true);
    try {
      const res = await api.get<{ data: any[] }>("/admin/users?role=user");
      // Filter manually on client for simplicity in this dev phase
      const matches = res.data.data.filter(
        (u) =>
          u.name.toLowerCase().includes(recruitSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(recruitSearch.toLowerCase()),
      );
      setPotentialUsers(matches);
    } catch (e) {
      toast.error("Error searching users");
    } finally {
      setSearchingUsers(false);
    }
  };

  const promoteToAuthor = async (userId: number) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: "author" });
      toast.success("User successfully promoted to Author!");
      setIsRecruitOpen(false);
      setRecruitSearch("");
      setPotentialUsers([]);
      fetchAuthors();
    } catch (e) {
      toast.error("Failed to promote user");
    }
  };

  const handleUpdateUser = async () => {
    try {
      if (!editingUser.id) return;
      await api.put(`/admin/users/${editingUser.id}`, editingUser);
      toast.success("Author profile updated successfully");
      setIsEditOpen(false);
      fetchAuthors();
    } catch (error) {
      toast.error("Failed to update author");
    }
  };

  const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, {
        is_active: !currentStatus,
      });
      toast.success(
        currentStatus ? "Account deactivated" : "Account activated",
      );
      fetchAuthors();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteAuthor = async (authorId: number) => {
    if (
      !confirm(
        "Are you sure you want to remove this Author? They will lose their author privileges and their account will be permanently deleted.",
      )
    )
      return;
    try {
      await api.delete(`/admin/users/${authorId}`);
      toast.success("Author removed successfully");
      fetchAuthors();
    } catch (e) {
      toast.error("Failed to remove author");
    }
  };

  const filteredAuthors = authors.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()),
  );

  const totalCourses = authors.reduce(
    (acc, a) => acc + (a.total_courses || 0),
    0,
  );
  const totalWebinars = authors.reduce(
    (acc, a) => acc + (a.total_webinars || 0),
    0,
  );

  const authorStats = [
    {
      label: "Total Instructors",
      value: authors.length,
      icon: UserCheck,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Global Courses",
      value: totalCourses,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Live Webinars",
      value: totalWebinars,
      icon: Video,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Avg Rating",
      value: "4.9",
      icon: Star,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-10 pb-20 max-w-7xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Author Management 🏆
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Monitoring the performance and activities of Staredge instructors.
          </p>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 snap-x">
          <Dialog open={isRecruitOpen} onOpenChange={setIsRecruitOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold px-6 h-11 transition-all shadow-lg shadow-indigo-500/20 shrink-0 snap-start">
                <Plus className="h-5 w-5 mr-2" /> Recruit Author
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl md:rounded-[2.5rem] border-none shadow-2xl p-6 md:p-8 w-[95vw] md:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">
                  Recruit New Author
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Search student by name/email..."
                    value={recruitSearch}
                    onChange={(e) => setRecruitSearch(e.target.value)}
                    className="rounded-2xl h-12"
                    onKeyDown={(e) =>
                      e.key === "Enter" && searchPotentialUsers()
                    }
                  />
                  <Button
                    onClick={searchPotentialUsers}
                    disabled={searchingUsers}
                    className="h-12 rounded-2xl bg-slate-900 px-6 w-full sm:w-auto"
                  >
                    {searchingUsers ? (
                      "..."
                    ) : (
                      <>
                        <Search className="h-5 w-5 mr-2 sm:mr-0" />{" "}
                        <span className="sm:hidden">Search</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                  {potentialUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-100 transition-all"
                    >
                      <div>
                        <p className="font-bold text-slate-900 leading-none">
                          {u.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{u.email}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => promoteToAuthor(u.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold h-9 text-[10px] tracking-widest px-4"
                      >
                        PROMOTE
                      </Button>
                    </div>
                  ))}
                  {recruitSearch &&
                    potentialUsers.length === 0 &&
                    !searchingUsers && (
                      <p className="text-center text-slate-400 text-sm py-8 italic font-medium">
                        Search for active students to promote them to Author.
                      </p>
                    )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-3xl md:rounded-[2.5rem] border-none shadow-2xl p-6 md:p-8 w-[95vw] md:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              Edit Author Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-1">
                Full Name
              </label>
              <Input
                placeholder="John Doe"
                value={editingUser.name || ""}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, name: e.target.value })
                }
                className="rounded-2xl h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-1">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={editingUser.email || ""}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
                className="rounded-2xl h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-1">
                Role
              </label>
              <select
                value={editingUser.role || "author"}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, role: e.target.value as any })
                }
                className="w-full rounded-2xl h-12 border border-slate-200 bg-white px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
              >
                <option value="user">Student</option>
                <option value="author">Author</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-1">
                Occupation
              </label>
              <Input
                placeholder="Senior Engineer"
                value={editingUser.occupation || ""}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    occupation: e.target.value,
                  })
                }
                className="rounded-2xl h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 pl-1">
                Bio
              </label>
              <textarea
                placeholder="Tell us about yourself..."
                value={editingUser.bio || ""}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, bio: e.target.value })
                }
                className="w-full rounded-2xl p-4 border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none min-h-[100px]"
              />
            </div>

            <Button
              onClick={handleUpdateUser}
              className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold mt-2 shadow-lg shadow-indigo-500/20"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Slider on Mobile */}
      <div className="flex overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 gap-4 snap-x">
        {authorStats.map((stat, i) => (
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

      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          placeholder="Search authors..."
          className="pl-12 rounded-2xl border-slate-200 h-12 bg-white focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 w-full bg-slate-100 rounded-4xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAuthors.map((author) => (
            <Card
              key={author.id}
              className="border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-3xl md:rounded-4xl overflow-hidden bg-white group flex flex-col"
            >
              <CardContent className="p-6 md:p-8">
                <div className="flex justify-between items-start">
                  <div className="h-20 w-20 bg-indigo-50 rounded-4xl flex items-center justify-center font-black text-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 overflow-hidden">
                    {author.avatar ? (
                      <img
                        src={getImageUrl(author.avatar)}
                        alt={author.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      author.name.charAt(0)
                    )}
                  </div>
                  <Badge
                    className={cn(
                      "border-none font-black text-[10px] tracking-widest px-3 py-1",
                      author.is_active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700",
                    )}
                  >
                    {author.is_active ? "ACTIVE" : "SUSPENDED"}
                  </Badge>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingUser({
                          ...author,
                          bio: author.author_profile?.bio || "",
                          occupation: author.author_profile?.occupation || "",
                        });
                        setIsEditOpen(true);
                      }}
                      className="h-8 w-8 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleStatusToggle(author.id, author.is_active)
                      }
                      className={cn(
                        "h-8 w-8 rounded-full transition-colors",
                        author.is_active
                          ? "text-slate-300 hover:text-amber-600 hover:bg-amber-50"
                          : "text-slate-300 hover:text-emerald-600 hover:bg-emerald-50",
                      )}
                    >
                      <UserCheck className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAuthor(author.id)}
                      className="h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-6 space-y-1">
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                    {author.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                    <Mail className="h-3 w-3" />
                    <span className="text-xs">{author.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="p-3 md:p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">
                      Courses
                    </p>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-indigo-600" />
                      <span className="text-base md:text-lg font-black text-slate-900">
                        {author.total_courses || 0}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 md:p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">
                      Webinars
                    </p>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-emerald-600" />
                      <span className="text-base md:text-lg font-black text-slate-900">
                        {author.total_webinars || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">
                      Joined
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {new Date(author.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <Button
                    asChild
                    className="h-11 px-6 rounded-2xl bg-slate-900 hover:bg-indigo-600 font-black text-xs transition-all flex items-center gap-2"
                  >
                    <Link href={`/author/${author.username || author.id}`}>
                      Full Profile <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredAuthors.length === 0 && (
            <div className="col-span-full h-96 flex flex-col items-center justify-center bg-slate-50 rounded-4xl border-2 border-dashed border-slate-200">
              <div className="h-20 w-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4">
                <UserCheck className="h-10 w-10 text-slate-200" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Author not found
              </h3>
              <p className="text-sm text-slate-400 font-medium max-w-xs text-center">
                Try searching with other keywords or recruit a new author.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
