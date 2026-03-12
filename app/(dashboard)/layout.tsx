"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Menu, BookOpen } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/30">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="font-black text-lg tracking-tight text-slate-900">
              Staredge
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-xl"
          >
            <Menu className="h-6 w-6 text-slate-600" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:block sticky top-0 h-screen" />

        {/* Mobile Sidebar Overlay */}
        <div
          className={cn(
            "fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 md:hidden",
            isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
          onClick={() => setIsSidebarOpen(false)}
        />
        <Sidebar
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 transform md:hidden h-full",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
          onMobileClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
