"use client";

import { use, useEffect, useState } from "react";
import { api, getImageUrl } from "@/lib/api";
import { Webinar } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Video,
  User,
  ChevronLeft,
  Share2,
  CheckCircle2,
  Info,
  History,
  ExternalLink,
  PlaySquare,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

export default function WebinarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<{
    webinar: Webinar;
    is_registered: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const fetchWebinar = async () => {
    try {
      const res = await api.get(`/webinars/${id}`);
      setData(res.data.data);
    } catch (error) {
      console.error("Failed to fetch webinar", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchWebinar();
    }
  }, [id]);

  const handleRegister = async () => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }

    setRegistering(true);
    try {
      await api.post(`/webinars/${id}/register`);
      toast.success("Berhasil mendaftar webinar!");
      fetchWebinar(); // Refresh state
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Gagal mendaftar.");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data || !data.webinar) {
    return (
      <div className="flex flex-col h-[600px] items-center justify-center text-center space-y-6 max-w-md mx-auto px-4">
        <div className="h-20 w-20 bg-slate-100 rounded-4xl flex items-center justify-center shadow-inner">
          <Info className="h-10 w-10 text-slate-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Webinar Tidak Ditemukan
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Acara mungkin sudah dihapus, statusnya belum dipublikasi, atau
            tautan yang kamu masukkan salah.
          </p>
        </div>
        <Button
          asChild
          className="rounded-2xl h-12 bg-slate-900 hover:bg-slate-800 px-8 font-bold shadow-xl"
        >
          <Link href="/dashboard">Kembali ke Dashboard</Link>
        </Button>
      </div>
    );
  }

  const { webinar, is_registered } = data;
  const isPast = new Date(webinar.scheduled_at) <= new Date();

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors group"
      >
        <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />{" "}
        Kembali ke Dashboard
      </Link>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge
                className={cn(
                  "border-none rounded-full px-4 py-1.5 font-black text-[10px] tracking-widest uppercase mb-2 shadow-sm",
                  isPast
                    ? "bg-slate-200 text-slate-600"
                    : "bg-rose-100 text-rose-600",
                )}
              >
                {isPast ? "Webinar Terlewati" : "Upcoming Webinar"}
              </Badge>
              {is_registered && (
                <Badge className="bg-emerald-100 text-emerald-600 border-none rounded-full px-4 py-1.5 font-black text-[10px] tracking-widest uppercase mb-2 flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="h-3 w-3" /> Terdaftar
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              {webinar.title}
            </h1>
          </div>

          {/* Banner / Player Area */}
          <div className="relative aspect-video rounded-4xl overflow-hidden border-8 border-white shadow-2xl bg-slate-100 group">
            {webinar.banner ? (
              <img
                src={getImageUrl(webinar.banner)}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Video className="h-20 w-20 text-slate-200" />
              </div>
            )}
            {isPast && webinar.recording_link && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100 rounded-full h-16 w-16 p-0 shadow-2xl group/play"
                  asChild
                >
                  <a href={webinar.recording_link} target="_blank">
                    <PlaySquare className="h-8 w-8 transition-transform group-hover/play:scale-110" />
                  </a>
                </Button>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1.5 bg-indigo-600 rounded-full" />
              <h2 className="text-2xl font-black">Deskripsi Acara</h2>
            </div>
            <p className="text-lg text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
              {webinar.description}
            </p>
          </div>

          {/* Materials Section */}
          {webinar.material_link && (
            <div className="p-8 bg-emerald-50 rounded-4xl border border-emerald-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-black text-emerald-900">
                  Materi Kursus Tersedia
                </h3>
              </div>
              <p className="font-medium text-emerald-700/80">
                Author telah membagikan materi presentasi, modul latihan, atau
                assets yang bisa kamu pelajari secara mandiri.
              </p>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 font-bold px-8 shadow-lg shadow-emerald-200"
                asChild
              >
                <a href={webinar.material_link} target="_blank">
                  Unduh Materi Sekarang
                </a>
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <Card className="rounded-4xl border-none shadow-2xl overflow-hidden bg-white">
            <CardContent className="p-8 space-y-8">
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Calendar className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                      Tanggal
                    </p>
                    <p className="font-bold text-slate-800 tracking-tight">
                      {new Date(webinar.scheduled_at).toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Clock className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                      Waktu & Durasi
                    </p>
                    <p className="font-bold text-slate-800 tracking-tight">
                      {new Date(webinar.scheduled_at).toLocaleTimeString(
                        "id-ID",
                        { hour: "2-digit", minute: "2-digit" },
                      )}{" "}
                      • {webinar.duration} Menit
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                      Pembicara
                    </p>
                    <p className="font-bold text-slate-800 tracking-tight">
                      {webinar.author_name || "Staredge Expert"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="space-y-3">
                {isPast ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                      <History className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-xs font-bold text-blue-700 leading-relaxed">
                        Webinar ini sudah selesai. Kamu bisa mengakses rekaman
                        dan materi di bawah ini jika tersedia.
                      </p>
                    </div>
                    {webinar.recording_link && (
                      <Button
                        className="w-full bg-slate-900 hover:bg-slate-800 rounded-2xl h-14 font-black shadow-xl"
                        asChild
                      >
                        <a href={webinar.recording_link} target="_blank">
                          Tonton Rekaman{" "}
                          <ExternalLink className="h-5 w-5 ml-2" />
                        </a>
                      </Button>
                    )}
                  </div>
                ) : is_registered ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                      <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-xs font-bold text-emerald-700 leading-relaxed">
                        Kamu sudah terdaftar! Link webinar akan aktif otomatis
                        di dashboard saat acara dimulai.
                      </p>
                    </div>
                    <Button
                      className="w-full bg-slate-900 hover:bg-slate-800 rounded-2xl h-14 font-black shadow-xl"
                      asChild
                    >
                      <a href={webinar.link} target="_blank">
                        Buka Link Webinar{" "}
                        <ChevronLeft className="h-5 w-5 ml-2 rotate-180" />
                      </a>
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full bg-rose-500 hover:bg-rose-600 rounded-2xl h-14 font-black text-lg shadow-xl shadow-rose-200 transition-all active:scale-95"
                    onClick={handleRegister}
                    disabled={registering}
                  >
                    {registering ? "Memproses..." : "Ikut Webinar Sekarang"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full rounded-2xl h-12 font-bold border-slate-200"
                >
                  <Share2 className="h-4 w-4 mr-2" /> Bagikan Acara
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 bg-indigo-600/5 rounded-4xl border border-indigo-100">
            <h4 className="font-black text-indigo-900 mb-2">
              Benefit Ikut Serta
            </h4>
            <ul className="space-y-3">
              {[
                "Sertifikat Kehadiran",
                "Materi Presentasi (PDF)",
                "Q&A dengan Expert",
                "Akses Rekaman 24/7",
              ].map((b, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-xs font-bold text-indigo-700/70"
                >
                  <CheckCircle2 className="h-4 w-4 text-indigo-500" /> {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
