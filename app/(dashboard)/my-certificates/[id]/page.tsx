"use client";

import { useEffect, useState, use } from "react";
import { api } from "@/lib/api";
import { Certificate } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Award, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CertificateDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCert = async () => {
      try {
        // Backend doesn't have a specific `GET /my-certificates/:id` endpoint in the contract
        // But it likely exists or we can filter from /my-certificates
        // Let's assume we can fetch all and filter for MVP if specific endpoint is missing
        // OR try to fetch specific.
        // Contract says: GET /my-certificates -> list.
        // Let's try to filter from list for now since contract didn't specify detail endpoint explicitly

        const response = await api.get<{ data: Certificate[] }>(
          "/my-certificates",
        );
        const found = response.data.data.find((c) => c.id === parseInt(id));
        setCert(found || null);
      } catch (error) {
        console.error("Failed to fetch certificate", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCert();
  }, [id]);

  if (loading) return <div>Loading certificate...</div>;
  if (!cert) return <div>Certificate not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Button variant="ghost" className="mb-4" asChild>
        <Link href="/my-certificates">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Certificates
        </Link>
      </Button>

      <Card className="border-4 border-double border-primary/20 shadow-xl bg-orange-50/50 dark:bg-zinc-900/50 print:shadow-none print:border-4">
        <CardHeader className="text-center space-y-6 py-12">
          <div className="mx-auto bg-primary/10 rounded-full p-6 w-fit mb-4">
            <Award className="h-16 w-16 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-primary uppercase font-serif">
              Certificate of Completion
            </h1>
            <p className="text-muted-foreground uppercase tracking-widest text-sm">
              This is to certify that
            </p>
          </div>

          {/* We need user name here. Certificate model has user_id, but not name. 
               We can get it from auth context or implicit knowledge. 
               For MVP let's assume "The Student" or fetch user profile. 
           */}
          <div className="py-4 border-b border-t border-dashed border-primary/30 w-3/4 mx-auto">
            <h2 className="text-3xl font-bold font-serif italic">
              Student #{cert.user_id}
            </h2>
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground uppercase tracking-widest text-sm">
              Has successfully completed the course
            </p>
            <h3 className="text-2xl font-bold text-foreground">
              {cert.learning_path?.title ||
                `Learning Path #${cert.learning_path_id}`}
            </h3>
          </div>
        </CardHeader>

        <CardContent className="text-center pb-12 space-y-6">
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-sm text-left border p-4 rounded bg-background/50">
            <div className="text-muted-foreground">Certificate ID:</div>
            <div className="font-mono text-right">{cert.certificate_code}</div>

            <div className="text-muted-foreground">Issued Date:</div>
            <div className="text-right">{formatDate(cert.issued_at)}</div>
          </div>

          <div className="print:hidden pt-8">
            <Button onClick={() => window.print()}>
              <Download className="mr-2 h-4 w-4" /> Print Certificate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
