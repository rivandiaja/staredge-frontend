import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md border-slate-100">
      <div className="max-w-7xl mx-auto flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-200">
            <span className="text-white font-black text-xl">S</span>
          </div>
          <span className="font-black text-xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
            Staredge Digital
          </span>
        </Link>

        {/* Desktop Nav Removed as requested */}

        <div className="flex flex-1 items-center justify-end gap-3">
          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="rounded-xl font-bold text-slate-600"
              asChild
            >
              <Link href="/login">Login</Link>
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 rounded-xl font-bold px-6"
              asChild
            >
              <Link href="/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
