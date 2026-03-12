"use client";

import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Scale,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-slate-50 border-b">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <Badge className="bg-blue-600/10 text-blue-600 border-none font-bold px-4 py-1.5 rounded-full uppercase text-[10px] tracking-widest">
            Terms & Conditions
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
            The Rules of Engagement at <br />
            <span className="text-blue-600">Staredge Digital</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
            Use our services wisely. This document explains your rights and
            responsibilities as a learner on our platform.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 space-y-16">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: CheckCircle2,
                title: "Account Access",
                desc: "One account per user. You are responsible for maintaining the security of your login credentials.",
                color: "blue",
              },
              {
                icon: FileText,
                title: "Copyright",
                desc: "All material content and videos are the intellectual property of Staredge Digital.",
                color: "indigo",
              },
              {
                icon: AlertCircle,
                title: "Ethics",
                desc: "The use of spamming or disrupting the experience of other users is strictly prohibited.",
                color: "rose",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-8 bg-slate-50 rounded-[2.5rem] space-y-4 border border-slate-100"
              >
                <div
                  className={`h-12 w-12 bg-${item.color}-600 rounded-2xl flex items-center justify-center shadow-lg shadow-${item.color}-200`}
                >
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  {item.title}
                </h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-10 prose prose-slate max-w-none">
            <div className="p-10 bg-blue-600 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <Zap className="absolute -bottom-10 -right-10 h-64 w-64 text-white/10 group-hover:rotate-12 transition-transform duration-700" />
              <div className="relative z-10 space-y-4">
                <h2 className="text-3xl font-black">User License</h2>
                <p className="text-blue-50 font-medium leading-relaxed max-w-2xl">
                  Staredge Digital grants you a limited, non-exclusive, and
                  non-transferable license to access the courses and related
                  content solely for personal educational purposes, not for
                  commercial use or redistribution.
                </p>
              </div>
            </div>

            <div className="grid gap-12 pt-10">
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <Scale className="h-6 w-6 text-slate-400" />
                  Limitation of Liability
                </h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Our services are provided "as is". While we strive to deliver
                  the best educational materials, Staredge Digital does not
                  guarantee that learning outcomes will automatically result in
                  employment or specific financial gains for users.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <ShieldAlert className="h-6 w-6 text-rose-500" />
                  Violations & Termination
                </h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  We reserve the right to suspend or permanently delete your
                  account without refund if evidence of copyright infringement,
                  content piracy, or behavior violating platform ethical norms
                  is found.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
