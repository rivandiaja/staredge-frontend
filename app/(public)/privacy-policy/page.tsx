"use client";

import { Shield, Lock, Eye, BookOpen, Clock, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-slate-50 border-b">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <Badge className="bg-indigo-600/10 text-indigo-600 border-none font-bold px-4 py-1.5 rounded-full uppercase text-[10px] tracking-widest">
            Privacy Policy
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
            Your Privacy is <br />
            <span className="text-indigo-600">Our Priority</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
            We are committed to protecting your personal data and providing full
            transparency on how we utilize that information.
          </p>
          <div className="pt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            Last Updated: February 24, 2026
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 space-y-16">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Data Protection
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                We use encrypted industry-standard security measures to ensure
                all your profile data, grades, and learning progress are safely
                stored on our servers.
              </p>
            </div>
            <div className="space-y-4">
              <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <Eye className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Usage Transparency
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                The data we collect (such as email and name) is only used for
                account personalization, certificate issuance, and learning
                material updates.
              </p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-8">
            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span className="h-2 w-2 bg-indigo-600 rounded-full" />
                Information We Collect
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                When you register at Staredge Digital, we collect basic identity
                information including your full name, email address, and other
                optional profile info. We also record learning activity data
                such as course progress, quiz results, and webinar interactions.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span className="h-2 w-2 bg-indigo-600 rounded-full" />
                Third-Party Information Sharing
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Staredge Digital **never** sells your personal data to third
                parties. We only share data with service partners (such as
                hosting providers or email gateways) required for the technical
                operation of the platform, following strict confidentiality
                standards.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span className="h-2 w-2 bg-indigo-600 rounded-full" />
                User Rights
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                You have full rights to access, update, or request permanent
                deletion of your personal data from our system at any time
                through your profile settings or by contacting our support team.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
