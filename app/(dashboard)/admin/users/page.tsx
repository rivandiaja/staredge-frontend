"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  MoreHorizontal,
  Mail,
  Shield,
  ShieldCheck,
  User as UserIcon,
  Filter,
  ArrowUpDown,
  Download,
  MoreVertical,
  UserCheck,
  UserX,
  Trash2,
  Edit,
} from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "author" | "admin";
  is_active: boolean;
  created_at: string;
  author_profile?: {
    bio: string;
    occupation: string;
  };
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // New user state
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as const,
  });

  // Edit user state
  const [editingUser, setEditingUser] = useState<
    Partial<User> & { bio?: string; occupation?: string }
  >({});

  const fetchUsers = async () => {
    try {
      const response = await api.get<{ data: User[] }>("/admin/users");
      setUsers(response.data.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    try {
      if (!editingUser.id) return;
      await api.put(`/admin/users/${editingUser.id}`, editingUser);
      toast.success("User updated successfully");
      setIsEditOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to change role");
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
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (userId: number) => {
    if (
      !confirm(
        "Are you sure you want to PERMANENTLY delete this user? This action cannot be undone.",
      )
    )
      return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleCreateUser = async () => {
    try {
      if (!newUser.name || !newUser.email || !newUser.password) {
        toast.error("Please fill all fields");
        return;
      }
      await api.post("/admin/users", newUser);
      toast.success("User created successfully!");
      setIsAddOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "user" });
      fetchUsers();
    } catch (error) {
      toast.error("Failed to create user");
    }
  };

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Email", "Role", "Status", "Joined Date"];
    const rows = filteredUsers.map((u) => [
      u.id,
      u.name,
      u.email,
      u.role.toUpperCase(),
      u.is_active ? "Active" : "Suspended",
      new Date(u.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `users_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none font-black text-[10px]">
            <ShieldCheck className="h-3 w-3 mr-1" /> ADMIN
          </Badge>
        );
      case "author":
        return (
          <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none font-black text-[10px]">
            <Shield className="h-3 w-3 mr-1" /> AUTHOR
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none font-black text-[10px]">
            <UserIcon className="h-3 w-3 mr-1" /> STUDENT
          </Badge>
        );
    }
  };

  const userStats = [
    {
      label: "Total Registries",
      value: users.length,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Students",
      value: users.filter((u) => u.role === "user" && u.is_active).length,
      icon: UserIcon,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Platform Authors",
      value: users.filter((u) => u.role === "author").length,
      icon: Shield,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Suspended",
      value: users.filter((u) => !u.is_active).length,
      icon: Mail,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-10 pb-20 max-w-7xl mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            User Management 👥
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Manage access, roles, and data for all platform users.
          </p>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 snap-x">
          <Button
            variant="outline"
            onClick={exportToCSV}
            className="rounded-xl border-slate-200 font-bold px-4 hover:bg-slate-50 transition-all shrink-0 snap-start"
          >
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold px-4 transition-all shadow-lg shadow-indigo-500/20 shrink-0 snap-start">
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl md:rounded-[2.5rem] border-none shadow-2xl p-6 md:p-8 w-[95vw] md:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">
                  Add New User
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 mt-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 pl-1">
                    Full Name
                  </label>
                  <Input
                    placeholder="John Doe"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
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
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="rounded-2xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 pl-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className="rounded-2xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 pl-1">
                    Initial Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value as any })
                    }
                    className="w-full rounded-2xl h-12 border border-slate-200 bg-white px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  >
                    <option value="user">Student</option>
                    <option value="author">Author</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <Button
                  onClick={handleCreateUser}
                  className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold mt-2 shadow-lg shadow-indigo-500/20"
                >
                  Create User Account
                </Button>
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
              Edit User Profile
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
                value={editingUser.role || "user"}
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

            {(editingUser.role === "author" || editingUser.role === "admin") && (
              <>
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
              </>
            )}

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
        {userStats.map((stat, i) => (
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

      <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-50 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name or email..."
              className="pl-11 rounded-2xl border-slate-200 h-11 bg-white focus:ring-2 focus:ring-indigo-500/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar snap-x">
            <Button
              variant="ghost"
              className="h-11 rounded-2xl font-bold text-slate-600 hover:bg-white hover:shadow-sm shrink-0 snap-start"
            >
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
            <Button
              variant="ghost"
              className="h-11 rounded-2xl font-bold text-slate-600 hover:bg-white hover:shadow-sm shrink-0 snap-start"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" /> Sort
            </Button>
          </div>
        </div>

        <div className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-50">
                <TableHead className="hidden md:table-cell w-[80px] font-black text-slate-400 text-[10px] uppercase tracking-widest pl-8">
                  ID
                </TableHead>
                <TableHead className="font-black text-slate-400 text-[10px] uppercase tracking-widest">
                  User Details
                </TableHead>
                <TableHead className="hidden sm:table-cell font-black text-slate-400 text-[10px] uppercase tracking-widest text-center">
                  Identity
                </TableHead>
                <TableHead className="font-black text-slate-400 text-[10px] uppercase tracking-widest text-center">
                  Role
                </TableHead>
                <TableHead className="hidden lg:table-cell font-black text-slate-400 text-[10px] uppercase tracking-widest text-center">
                  Joined Date
                </TableHead>
                <TableHead className="w-[100px] text-right pr-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-bold text-slate-400">
                        Syncing database...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <TableRow
                    key={u.id}
                    className="hover:bg-slate-50/50 transition-colors border-slate-50 group"
                  >
                    <TableCell className="hidden md:table-cell font-mono text-xs font-bold text-slate-400 pl-8">
                      #{u.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          {u.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <p className="font-black text-slate-900 leading-none">
                            {u.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Mail className="h-3 w-3 text-slate-300" />
                            <span className="text-xs text-slate-400 font-medium">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-center font-bold text-xs">
                      {u.is_active ? (
                        <span className="text-emerald-600">Active</span>
                      ) : (
                        <span className="text-rose-500">Suspended</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {getRoleBadge(u.role)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-center">
                      <div className="flex flex-col text-center">
                        <span className="text-xs font-black text-slate-700">
                          {new Date(u.created_at).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                          Registered
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-full"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="rounded-2xl border-slate-100 p-2 shadow-xl"
                        >
                          <DropdownMenuLabel className="font-black text-[10px] uppercase text-slate-400 px-3">
                            Quick Actions
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingUser({
                                ...u,
                                bio: u.author_profile?.bio || "",
                                occupation: u.author_profile?.occupation || "",
                              });
                              setIsEditOpen(true);
                            }}
                            className="rounded-xl font-bold text-indigo-600 focus:bg-indigo-50 focus:text-indigo-700 cursor-pointer"
                          >
                            <Edit className="h-4 w-4 mr-2" /> Edit User Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusToggle(u.id, u.is_active)
                            }
                            className={cn(
                              "rounded-xl font-bold cursor-pointer",
                              u.is_active
                                ? "text-amber-600 focus:bg-amber-50"
                                : "text-emerald-600 focus:bg-emerald-50",
                            )}
                          >
                            {u.is_active
                              ? "Deactivate Account"
                              : "Activate Account"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(u.id)}
                            className="rounded-xl font-bold text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="h-10 w-10 text-slate-200" />
                      <p className="text-sm font-bold text-slate-400">
                        User not found.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
