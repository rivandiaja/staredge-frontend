"use client";

import { useEffect, useState, use } from "react";
import { api, getImageUrl } from "@/lib/api";
import { User, Certificate } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Download,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Layout,
  Star,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { formatDate, cn } from "@/lib/utils";

interface PublicCertData {
  certificate: Certificate;
  user: User;
}

export default function PublicCertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { user: currentUser } = useAuth();
  const { code } = use(params);
  const [data, setData] = useState<PublicCertData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const response = await api.get<PublicCertData>(`/certificates/${code}`);
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch certificate", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [code]);

  const isOwner = currentUser?.id === data?.certificate.user_id;

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-white rounded-3xl shadow-2xl flex items-center justify-center mx-auto">
            <Award className="h-8 w-8 text-amber-500 animate-bounce" />
          </div>
          <p className="font-black text-slate-400 uppercase tracking-widest text-xs">
            Verifying Credential...
          </p>
        </div>
      </div>
    );

  if (!data)
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Invalid Certificate Code
          </h1>
          <p className="text-slate-500 mt-4 font-bold italic">
            The credential you are looking for may have been revoked or does not
            exist.
          </p>
          <Button className="mt-8 rounded-2xl" asChild>
            <Link href="/">Back to Staredge</Link>
          </Button>
        </div>
      </div>
    );

  const { certificate: cert, user } = data;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-10 px-4 print:p-0 print:bg-white">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: white !important;
            margin: 0;
            padding: 0;
          }
          header,
          nav,
          footer,
          .no-print {
            display: none !important;
          }
          .print-container {
            width: 100%;
            height: auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding-top: 0mm;
          }
          .cert-card-print {
            width: 180mm !important; /* Slightly smaller than 210mm to fit safe area */
            margin: 0 auto !important;
            box-shadow: none !important;
            border: 1px solid #f1f5f9 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      <div className="min-h-screen bg-slate-50/50 pb-20 pt-10 px-4 print:p-0 print:bg-white print-container">
        {/* Verification Banner */}
        <div className="no-print max-w-4xl mx-auto w-full mb-12 bg-emerald-500/10 border border-emerald-500/20 rounded-4xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-500/5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-emerald-800 tracking-tight">
                Official Verified Credential
              </h2>
              <p className="text-emerald-600/80 text-sm font-bold">
                This achievement is authentic and verified by Staredge Digital
                Academy.
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-500 text-white border-none rounded-full px-6 py-2 font-black text-xs tracking-widest uppercase">
            STATUS: ACTIVE
          </Badge>
        </div>

        {/* Certificate Card */}
        <Card className="cert-card-print relative overflow-hidden rounded-3xl md:rounded-[4rem] border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] bg-white p-6 md:p-20 print:p-12 text-center mx-auto max-w-4xl w-full">
          {/* Decorative Elements */}
          <div className="no-print absolute top-0 left-0 w-full h-4 bg-linear-to-r from-amber-400 via-amber-600 to-amber-400" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50" />

          <div className="relative z-10 space-y-8 md:space-y-12 print:space-y-12">
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-20 w-20 md:h-32 md:w-32 print:h-32 print:w-32 bg-amber-50 rounded-full flex items-center justify-center shadow-inner relative z-10">
                  <Award className="h-10 w-10 md:h-16 md:w-16 print:h-16 print:w-16 text-amber-500" />
                </div>
                <Sparkles className="absolute -top-4 -right-4 h-8 w-8 md:h-12 md:w-12 print:h-12 print:w-12 text-amber-200 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2 md:space-y-4 print:space-y-4">
              <h1 className="text-4xl md:text-7xl print:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none italic font-serif">
                Certificate
              </h1>
              <p className="text-slate-400 font-black text-[10px] md:text-xs print:text-xs tracking-[0.4em] uppercase">
                of Completion
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-slate-500 font-bold italic text-sm md:text-lg print:text-lg">
                This is to officially certify that
              </p>
              <h2 className="text-3xl md:text-6xl print:text-4xl font-black text-slate-900 tracking-tight py-2 md:py-4 print:py-4 border-b-2 border-slate-100 w-fit mx-auto break-words max-w-full px-4">
                {user.name}
              </h2>
            </div>

            <div className="space-y-2 md:space-y-4 print:space-y-4 pt-2 md:pt-4 print:pt-4">
              <p className="text-slate-500 font-bold text-sm md:text-lg print:text-lg">
                has successfully fulfilled all requirements to be recognized for
              </p>
              <h3 className="text-xl md:text-5xl print:text-3xl font-black text-indigo-600 tracking-tight leading-tight px-4 break-words">
                {cert.learning_path?.title || "Professional Mastery"}
              </h3>
            </div>

            <div className="pt-4 md:pt-6 print:pt-6 border-t border-slate-50 space-y-8 md:space-y-12 print:space-y-12">
              {/* Top Row: Details */}
              <div className="grid grid-cols-2 gap-4 md:gap-12 print:gap-12 text-center">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Verify Code
                  </p>
                  <p className="text-lg font-mono font-black text-slate-700">
                    {cert.certificate_code}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Date Issued
                  </p>
                  <p className="text-lg font-black text-slate-700">
                    {formatDate(cert.issued_at)}
                  </p>
                </div>
              </div>

              {/* Bottom Row: Scanners and Authority */}
              <div className="grid grid-cols-2 gap-12 items-center text-center">
                <div className="group">
                  <div className="h-40 w-40 md:h-40 md:w-40 rounded-2xl bg-white mx-auto border-2 border-slate-100 overflow-hidden shadow-sm p-2 transition-transform group-hover:scale-105">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        typeof window !== "undefined"
                          ? window.location.href
                          : `https://staredge.id/certificates/${cert.certificate_code}`,
                      )}`}
                      className="w-full h-full object-contain"
                      alt="Scan to Verify"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="h-24 w-24 md:h-28 md:w-28 bg-slate-900 rounded-3xl mx-auto mb-2 flex items-center justify-center shadow-2xl rotate-3">
                    <Zap className="h-10 w-10 md:h-12 md:w-12 text-indigo-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-slate-900 leading-none">
                      Staredge Academy
                    </p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      Issuing Authority
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer Actions */}
        <div className="no-print mt-20 flex flex-col md:flex-row items-center justify-center gap-6">
          {isOwner && (
            <Button
              variant="outline"
              className="rounded-2xl h-14 px-8 font-black border-2 hover:bg-white hover:shadow-xl transition-all"
              onClick={() => window.print()}
            >
              <Download className="mr-2 h-5 w-5" /> Save PDF / Print
            </Button>
          )}
          <Button
            className="rounded-2xl h-14 px-8 font-black bg-indigo-600 hover:bg-slate-900 text-white shadow-2xl shadow-indigo-200 transition-all"
            asChild
          >
            <Link href={`/portfolio/${user.username || user.id}`}>
              <ExternalLink className="mr-2 h-5 w-5" /> View Recipient Portfolio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
