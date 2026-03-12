"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BookOpen,
  User,
  LogOut,
  Award,
  PenTool,
  TrendingUp,
  Video,
  Zap,
  CheckCircle2,
  Trophy,
  X,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onMobileClose?: () => void;
  className?: string;
}

const sidebarItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Course Catalog", href: "/learning-paths", icon: BookOpen },
  { name: "Daily Challenges", href: "/challenges", icon: Zap },
  { name: "Global Hall of Fame", href: "/leaderboard", icon: Trophy },
  { name: "My Certificates", href: "/my-certificates", icon: Award },
  { name: "My Portfolio", href: "/profile", icon: User },
];

const authorItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    name: "Submissions Review",
    href: "/author/submissions",
    icon: CheckCircle2,
  },
  { name: "Course Manager", href: "/author/courses", icon: PenTool },
  { name: "Challenges Manager", href: "/author/challenges", icon: Zap },
  { name: "Webinar Manager", href: "/author/webinars", icon: Video },
  { name: "Account Settings", href: "/author/profile", icon: User },
];

const adminItems = [
  { name: "Admin Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "User Management", href: "/admin/users", icon: User },
  { name: "Author Management", href: "/admin/authors", icon: Award },
  { name: "Webinar Management", href: "/admin/webinars", icon: Video },
  { name: "Contact Governance", href: "/admin/contact", icon: MessageSquare },
  {
    name: "Global Catalog",
    href: "/admin/learning-paths",
    icon: LayoutDashboard,
  },
  { name: "Account Settings", href: "/admin/profile", icon: User },
];

export function Sidebar({ onMobileClose, className }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <div
      className={cn(
        "pb-12 w-64 border-r bg-white min-h-screen shadow-sm",
        className,
      )}
    >
      <div className="space-y-4 py-4 h-full flex flex-col">
        <div className="px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2"
            onClick={onMobileClose}
          >
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">
              Staredge
            </h2>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMobileClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="px-3 py-2 flex-1 space-y-6">
          {/* USER MENU */}
          {user?.role === "user" && (
            <div>
              <p className="mb-2 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Menu Utama
              </p>
              <div className="space-y-1">
                {sidebarItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className="w-full justify-start font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                    asChild
                    onClick={onMobileClose}
                  >
                    <Link href={item.href}>
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* AUTHOR MENU */}
          {user?.role === "author" && (
            <div>
              <p className="mb-2 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Authoring
              </p>
              <div className="space-y-1">
                {authorItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className="w-full justify-start font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                    asChild
                    onClick={onMobileClose}
                  >
                    <Link href={item.href}>
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* ADMIN MENU */}
          {user?.role === "admin" && (
            <div>
              <p className="mb-2 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Administrator
              </p>
              <div className="space-y-1">
                {adminItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className="w-full justify-start font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
                    asChild
                    onClick={onMobileClose}
                  >
                    <Link href={item.href}>
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-3 py-2 mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start font-bold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
            onClick={logout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
