"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Settings,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Twitter,
  Github,
  Trash2,
  CheckCircle,
  Eye,
  RefreshCcw,
  Save,
  LucideIcon,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Twitter,
  Github,
};

export default function ContactAdminPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [msgRes, setRes] = await Promise.all([
        api.get("/admin/contact/messages"),
        api.get("/contact/settings"),
      ]);
      setMessages(msgRes.data.data);
      setSettings(setRes.data.data);
    } catch (err) {
      toast.error("Failed to load contact data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/admin/contact/messages/${id}/status`, { status });
      toast.success(`Message marked as ${status}`);
      fetchData();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await api.delete(`/admin/contact/messages/${id}`);
      toast.success("Message deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete message");
    }
  };

  const handleUpdateSetting = async (
    key: string,
    value: string,
    label: string,
    icon: string,
  ) => {
    try {
      await api.post("/admin/contact/settings", { key, value, label, icon });
      toast.success(`${label} updated successfully`);
      fetchData();
    } catch (err) {
      toast.error("Failed to update setting");
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">
            Loading contact system data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Contact Governance 📨
          </h1>
          <p className="text-slate-500 font-medium">
            Manage user inquiries and platform metadata.
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchData}
          className="rounded-xl border-slate-200"
        >
          <RefreshCcw className="h-4 w-4 text-slate-500" />
        </Button>
      </div>

      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-2xl mb-8">
          <TabsTrigger
            value="messages"
            className="rounded-xl font-bold py-2.5 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <MessageSquare className="h-4 w-4 mr-2" /> Inbound Messages
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-xl font-bold py-2.5 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Settings className="h-4 w-4 mr-2" /> Page Content (CRUD)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="mt-0">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-4">
                      Date
                    </TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-4">
                      Sender
                    </TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-4">
                      Subject
                    </TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-4">
                      Status
                    </TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400 py-4 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-20 text-center text-slate-400 font-bold"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <MessageSquare className="h-8 w-8 opacity-20" />
                          No messages received yet.
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    messages.map((msg) => (
                      <TableRow
                        key={msg.id}
                        className="group hover:bg-slate-50/50 transition-colors border-slate-50"
                      >
                        <TableCell className="text-[10px] font-bold text-slate-500">
                          {new Date(msg.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-slate-900">
                            {msg.name}
                          </div>
                          <div className="text-[10px] text-indigo-600 font-black tracking-tighter uppercase">
                            {msg.email}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate font-medium text-slate-600 text-sm">
                          {msg.subject}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "uppercase text-[9px] font-black tracking-widest px-2 py-0.5 rounded-md border-none",
                              msg.status === "unread"
                                ? "bg-amber-100 text-amber-600"
                                : msg.status === "read"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-emerald-100 text-emerald-600",
                            )}
                          >
                            {msg.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-xl text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all"
                              onClick={() => {
                                alert(
                                  `Message from ${msg.name}:\n\n${msg.message}`,
                                );
                                if (msg.status === "unread")
                                  handleUpdateStatus(msg.id, "read");
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {msg.status !== "replied" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-xl text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all"
                                onClick={() =>
                                  handleUpdateStatus(msg.id, "replied")
                                }
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                              onClick={() => handleDeleteMessage(msg.id)}
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
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <div className="grid md:grid-cols-2 gap-8">
            <ContactSettingForm
              title="Identity & Support"
              description="Primary contact handles for current learners."
              fields={[
                { key: "email", label: "Global Support Email", icon: "Mail" },
                {
                  key: "phone",
                  label: "WhatsApp Business Link",
                  icon: "Phone",
                },
                {
                  key: "address",
                  label: "Physical Headquarters",
                  icon: "MapPin",
                },
              ]}
              settings={settings}
              onSave={handleUpdateSetting}
            />
            <ContactSettingForm
              title="Social Ecosystem"
              description="External community links for brand growth."
              fields={[
                {
                  key: "instagram",
                  label: "Instagram Profile",
                  icon: "Instagram",
                },
                {
                  key: "twitter",
                  label: "Twitter / X Profile",
                  icon: "Twitter",
                },
                { key: "github", label: "Github Organization", icon: "Github" },
              ]}
              settings={settings}
              onSave={handleUpdateSetting}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ContactSettingForm({
  title,
  description,
  fields,
  settings,
  onSave,
}: any) {
  return (
    <Card className="border-none shadow-sm rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 bg-white">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-black text-slate-900">
              {title}
            </CardTitle>
            <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0 space-y-8 mt-4">
        {fields.map((field: any) => (
          <SingleSettingField
            key={field.key}
            field={field}
            initialValue={settings[field.key]?.value || ""}
            onSave={onSave}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function SingleSettingField({ field, initialValue, onSave }: any) {
  const [val, setVal] = useState(initialValue);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setVal(initialValue);
  }, [initialValue]);

  const Icon = iconMap[field.icon] || Mail;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pl-1">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
          <Icon className="h-3 w-3" /> {field.label}
        </label>
        {dirty && (
          <span className="text-[9px] font-black text-amber-500 uppercase animate-pulse">
            Unsaved Changes
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={val}
          onChange={(e) => {
            setVal(e.target.value);
            setDirty(e.target.value !== initialValue);
          }}
          placeholder={`Enter ${field.label.toLowerCase()}...`}
          className="rounded-2xl h-14 border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium text-slate-600"
        />
        <Button
          onClick={() => {
            onSave(field.key, val, field.label, field.icon);
            setDirty(false);
          }}
          disabled={!dirty}
          className={cn(
            "h-14 w-14 rounded-2xl transition-all shadow-xl",
            dirty
              ? "bg-indigo-600 hover:bg-slate-900 shadow-indigo-200"
              : "bg-slate-100 text-slate-300 shadow-none cursor-not-allowed",
          )}
        >
          <Save className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
