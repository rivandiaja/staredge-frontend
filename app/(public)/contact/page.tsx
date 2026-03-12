"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  MessageSquare,
  MapPin,
  Send,
  Phone,
  CheckCircle2,
  Github,
  Instagram,
  Twitter,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api } from "@/lib/api";

const iconMap: Record<string, LucideIcon> = {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Twitter,
  Github,
};

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/contact/settings");
        setSettings(res.data.data);
      } catch (err) {
        console.error("Failed to fetch contact settings", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    setLoading(true);
    try {
      await api.post("/contact/messages", data);
      toast.success("Message sent! Our team will contact you shortly.");
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const getS = (key: string) => settings?.[key];

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <section className="pt-32 pb-20 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <Badge className="bg-indigo-600/10 text-indigo-600 border-none font-bold px-4 py-1.5 rounded-full uppercase text-[10px] tracking-widest">
            Contact Us
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
            Let's Talk About <br />
            <span className="text-indigo-600">Your Future</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
            Have questions about courses, partnerships, or need technical
            assistance? We are here to listen.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-5 space-y-10">
              <div className="space-y-8">
                {/* Email */}
                <div className="flex items-start gap-5">
                  <div className="h-14 w-14 bg-white rounded-2xl shadow-xl shadow-slate-200/50 flex items-center justify-center shrink-0 border border-slate-100">
                    <Mail className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">
                      {getS("email")?.label || "Email Support"}
                    </h3>
                    <p className="text-slate-500 font-medium mt-1 whitespace-pre-wrap">
                      {getS("email")?.value || "support@staredge.digital"}
                    </p>
                    <p className="text-xs text-indigo-600 font-bold mt-1 uppercase tracking-tighter">
                      Response within 24 Hours
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-5">
                  <div className="h-14 w-14 bg-white rounded-2xl shadow-xl shadow-slate-200/50 flex items-center justify-center shrink-0 border border-slate-100">
                    <Phone className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">
                      {getS("phone")?.label || "WhatsApp Business"}
                    </h3>
                    <p className="text-slate-500 font-medium mt-1 whitespace-pre-wrap">
                      {getS("phone")?.value || "+62 812-3456-7890"}
                    </p>
                    <p className="text-xs text-emerald-600 font-bold mt-1 uppercase tracking-tighter">
                      Available: Work Hours
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-5">
                  <div className="h-14 w-14 bg-white rounded-2xl shadow-xl shadow-slate-200/50 flex items-center justify-center shrink-0 border border-slate-100">
                    <MapPin className="h-6 w-6 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">
                      {getS("address")?.label || "Headquarters"}
                    </h3>
                    <div className="text-slate-500 font-medium mt-1 whitespace-pre-wrap">
                      {getS("address")?.value ||
                        "Digital Hub BSD, Level 12\nTangerang, Indonesia"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-indigo-600 rounded-[3rem] text-white shadow-2xl space-y-6">
                <h4 className="text-xl font-black">Follow Us</h4>
                <div className="flex gap-4">
                  {["instagram", "twitter", "github"].map((key) => {
                    const s = getS(key);
                    if (!s && key === "instagram")
                      return (
                        <a
                          key={key}
                          href="#"
                          className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shadow-lg"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      );
                    if (!s && key === "twitter")
                      return (
                        <a
                          key={key}
                          href="#"
                          className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shadow-lg"
                        >
                          <Twitter className="h-5 w-5" />
                        </a>
                      );
                    if (!s && key === "github")
                      return (
                        <a
                          key={key}
                          href="#"
                          className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shadow-lg"
                        >
                          <Github className="h-5 w-5" />
                        </a>
                      );

                    const Icon = iconMap[s.icon] || Mail;
                    return (
                      <a
                        key={key}
                        href={s.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shadow-lg"
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    );
                  })}
                </div>
                <p className="text-sm text-indigo-100 font-medium italic">
                  {" "}
                  Join our community for daily updates!
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-[4rem] p-10 md:p-14 shadow-2xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                  <MessageSquare className="h-12 w-12 text-slate-50 opacity-20" />
                </div>

                <h2 className="text-3xl font-black text-slate-900 mb-8">
                  Send a Message
                </h2>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-6 relative z-10"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 pl-1">
                        Full Name
                      </label>
                      <Input
                        name="name"
                        placeholder="John Doe"
                        required
                        className="rounded-2xl h-14 border-slate-100 bg-slate-50 focus:bg-white transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 pl-1">
                        Email
                      </label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        required
                        className="rounded-2xl h-14 border-slate-100 bg-slate-50 focus:bg-white transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 pl-1">
                      Subject
                    </label>
                    <Input
                      name="subject"
                      placeholder="Question about courses..."
                      required
                      className="rounded-2xl h-14 border-slate-100 bg-slate-50 focus:bg-white transition-all shadow-inner"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 pl-1">
                      Your Message
                    </label>
                    <textarea
                      name="message"
                      required
                      placeholder="How can we help you today?"
                      className="w-full min-h-[160px] rounded-3xl border-slate-100 bg-slate-50 p-6 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all shadow-inner"
                    />
                  </div>

                  <Button
                    disabled={loading}
                    className="w-full h-16 rounded-[2rem] bg-indigo-600 hover:bg-slate-900 font-black text-lg transition-all shadow-2xl shadow-indigo-200 mt-4 group"
                  >
                    {loading ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Now{" "}
                        <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
