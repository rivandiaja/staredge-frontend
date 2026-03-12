"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Certificate } from "@/types/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function MyCertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [learningPaths, setLearningPaths] = useState<Record<number, string>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [certsRes, pathsRes] = await Promise.all([
          api.get<{ data: Certificate[] }>("/my-certificates"),
          api.get<{ data: any[] }>("/learning-paths"),
        ]);

        const pathsMap: Record<number, string> = {};
        pathsRes.data.data?.forEach((path: any) => {
          pathsMap[path.id] = path.title;
        });

        setCerts(certsRes.data.data);
        setLearningPaths(pathsMap);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading certificates...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Certificates</h1>
        <p className="text-muted-foreground">
          View and download your earned certificates.
        </p>
      </div>

      {certs.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certs.map((cert) => (
            <Card key={cert.id} className="border-l-4 border-l-primary/50">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {cert.certificate_code}
                  </Badge>
                  <Award className="h-5 w-5 text-yellow-500" />
                </div>
                {/* Prioritizing course/learning path title as requested */}
                <CardTitle className="text-lg">
                  {learningPaths[cert.learning_path_id] ||
                    cert.learning_path?.title ||
                    `Learning Path #${cert.learning_path_id}`}
                </CardTitle>
                <CardDescription>
                  Completed on {formatDate(cert.issued_at)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-end mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/certificates/${cert.certificate_code}`}>
                      View Certificate
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-muted/50 border-dashed">
          <CardHeader className="text-center py-12">
            <div className="mx-auto bg-background rounded-full p-4 w-fit mb-4 border">
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>No certificates yet</CardTitle>
            <CardDescription>
              Complete a learning path to earn your first certificate.
            </CardDescription>
            <Button className="mx-auto mt-4" asChild>
              <Link href="/learning-paths">Start Learning</Link>
            </Button>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
