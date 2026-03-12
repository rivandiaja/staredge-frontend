"use client";

import { useEffect, useState } from "react";
import { api, getImageUrl } from "@/lib/api";
import { Webinar } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Video,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Trash2,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export default function AdminWebinarsPage() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWebinars = async () => {
    try {
      // Admin sees everything
      const response = await api.get<{ data: Webinar[] }>("/cms/webinars");
      setWebinars(response.data.data);
    } catch (error) {
      console.error("Failed to fetch webinars", error);
      toast.error("Failed to load webinars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebinars();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await api.patch(`/admin/webinars/${id}/approve`);
      toast.success("Webinar approved and published!");
      fetchWebinars();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to approve webinar");
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Are you sure you want to reject this webinar?")) return;
    try {
      await api.patch(`/admin/webinars/${id}/reject`);
      toast.success("Webinar rejected");
      fetchWebinars();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to reject webinar");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this webinar?"))
      return;
    try {
      await api.delete(`/cms/webinars/${id}`);
      setWebinars(webinars.filter((w) => w.id !== id));
      toast.success("Webinar deleted permanently");
    } catch (error) {
      toast.error("Failed to delete webinar");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-emerald-500 text-white border-none font-bold">
            PUBLISHED
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500 text-white border-none font-bold">
            PENDING
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-rose-500 text-white border-none font-bold">
            REJECTED
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-slate-500 text-white border-none font-bold">
            EXPIRED
          </Badge>
        );
      default:
        return <Badge variant="outline">{status.toUpperCase()}</Badge>;
    }
  };

  if (loading)
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Clock className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );

  return (
    <div className="space-y-6 md:space-y-10 max-w-7xl mx-auto px-4 md:px-0 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 md:pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            System Webinars{" "}
            <ShieldCheck className="h-6 w-6 md:h-8 md:w-8 text-rose-600" />
          </h1>
          <p className="text-slate-500 font-medium text-sm md:text-lg">
            Review, approve, and manage all scheduled webinars.
          </p>
        </div>
      </div>

      {/* Stats Summary - Horizontal Slider on Mobile */}
      <div className="flex overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 gap-4 md:gap-6 snap-x">
        <Card className="rounded-3xl border-none shadow-lg shadow-slate-100 bg-indigo-50/50 min-w-[140px] md:min-w-0 snap-center">
          <CardContent className="p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">
              Total Submission
            </p>
            <p className="text-3xl font-black text-slate-900">
              {webinars.length}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-none shadow-lg shadow-slate-100 bg-amber-50/50 min-w-[140px] md:min-w-0 snap-center">
          <CardContent className="p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">
              Awaiting Review
            </p>
            <p className="text-3xl font-black text-slate-900">
              {webinars.filter((w) => w.status === "pending").length}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-none shadow-lg shadow-slate-100 bg-emerald-50/50 min-w-[140px] md:min-w-0 snap-center">
          <CardContent className="p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">
              Live / Published
            </p>
            <p className="text-3xl font-black text-slate-900">
              {webinars.filter((w) => w.status === "published").length}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-none shadow-lg shadow-slate-100 bg-rose-50/50 min-w-[140px] md:min-w-0 snap-center">
          <CardContent className="p-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-1">
              Rejected
            </p>
            <p className="text-3xl font-black text-slate-900">
              {webinars.filter((w) => w.status === "rejected").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table View */}
      <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-xl shadow-slate-200/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="py-4 md:py-6 px-4 md:px-8 font-black uppercase text-[10px] tracking-widest text-slate-400">
                  Webinar Info
                </TableHead>
                <TableHead className="hidden md:table-cell py-6 px-4 font-black uppercase text-[10px] tracking-widest text-slate-400">
                  Schedule
                </TableHead>
                <TableHead className="py-6 px-4 font-black uppercase text-[10px] tracking-widest text-slate-400 text-center">
                  Status
                </TableHead>
                <TableHead className="hidden lg:table-cell py-6 px-4 font-black uppercase text-[10px] tracking-widest text-slate-400 text-center">
                  Duration
                </TableHead>
                <TableHead className="py-6 px-4 font-black uppercase text-[10px] tracking-widest text-slate-400 text-right pr-8">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webinars.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <Video className="h-12 w-12" />
                      <p className="font-bold text-lg">
                        No webinars submitted for review
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                webinars.map((webinar) => (
                  <TableRow
                    key={webinar.id}
                    className="border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <TableCell className="py-4 md:py-6 px-4 md:px-8">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="h-12 w-16 md:h-16 md:w-24 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-100 relative group">
                          {webinar.banner ? (
                            <img
                              src={getImageUrl(webinar.banner)}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Video className="h-6 w-6 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 leading-tight mb-1 truncate md:whitespace-normal">
                            {webinar.title}
                          </p>
                          <p className="text-[10px] text-slate-500 font-bold opacity-60 truncate">
                            {webinar.author_name || "Unknown"} • #{webinar.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-6 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-700">
                          {formatDate(webinar.scheduled_at)}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-tighter text-indigo-500 opacity-80">
                          Scheduled Date
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 px-4 text-center">
                      {getStatusBadge(webinar.status)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell py-6 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-700">
                          {webinar.duration || 0} Min
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                          Session Length
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 px-4 text-right pr-8">
                      <div className="flex items-center justify-end gap-2">
                        {webinar.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(webinar.id)}
                              className="bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold h-9 px-4"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(webinar.id)}
                              className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold h-9 px-4"
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(webinar.id)}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
