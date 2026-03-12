"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
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
  ArrowRight,
  Code,
  BookOpen,
  Terminal,
  User,
  Star,
  Zap,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { api, getImageUrl } from "@/lib/api";
import { LearningPath, User as UserType } from "@/types/api";

export default function LandingPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [authors, setAuthors] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = 400;
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pathsRes, authorsRes] = await Promise.all([
          api.get<any>("/learning-paths"),
          api.get<any>("/authors"),
        ]);

        const pathsData = Array.isArray(pathsRes.data)
          ? pathsRes.data
          : pathsRes.data?.data || [];
        const authorsData = Array.isArray(authorsRes.data)
          ? authorsRes.data
          : authorsRes.data?.data || [];

        setPaths(pathsData.filter((p: any) => p.status === "published"));
        setAuthors(authorsData);
      } catch (error) {
        console.error("Failed to fetch landing data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 lg:py-48 bg-white border-b overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-600 via-indigo-600 to-emerald-600" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4 max-w-4xl">
              <Badge
                variant="outline"
                className="px-4 py-1.5 rounded-full border-indigo-100 bg-indigo-50 text-indigo-600 font-bold tracking-widest uppercase text-[10px] animate-fade-in"
              >
                The Future of Learning Platform
              </Badge>
              <h1 className="text-4xl font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-slate-900 leading-[1.1]">
                Master Coding <br />
                <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
                  Step-by-Step
                </span>
              </h1>
              <p className="mx-auto max-w-[800px] text-slate-500 md:text-xl font-medium leading-relaxed">
                Staredge Digital helps you master technology through structured,
                stage-based learning paths. Perfect for beginners aiming to
                become experts.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pt-4">
              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 h-14 px-10 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-200 transition-all hover:scale-105 w-full sm:w-auto"
                asChild
              >
                <Link href="/register">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-10 rounded-2xl font-black text-lg border-2 hover:bg-slate-50 w-full sm:w-auto"
                asChild
              >
                <Link href="/learning-paths">Explore Modules</Link>
              </Button>
            </div>

            {/* Visual element */}
            <div className="pt-20 w-full max-w-5xl hidden sm:block">
              <div className="relative rounded-[2rem] md:rounded-[3rem] border-4 md:border-8 border-slate-100 shadow-2xl overflow-hidden bg-slate-200 aspect-video">
                <div className="absolute inset-0 bg-linear-to-br from-indigo-500/20 to-blue-500/20 backdrop-blur-3xl flex items-center justify-center">
                  <div className="bg-white/80 p-8 rounded-4xl shadow-xl flex items-center gap-4">
                    <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Code className="text-white h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">
                        Interactive Courses
                      </p>
                      <p className="text-xs font-bold text-slate-500">
                        Learn by doing in our stage-based system
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background blobs */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50 -z-10" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10" />
      </section>

      {/* Features Section */}
      <section className="w-full py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-20">
            <div className="space-y-4 max-w-3xl">
              <Badge
                variant="outline"
                className="px-4 py-1.5 rounded-full border-emerald-100 bg-emerald-50 text-emerald-600 font-bold tracking-widest uppercase text-[10px]"
              >
                Our Advantages
              </Badge>
              <h2 className="text-4xl font-black tracking-tight sm:text-6xl text-slate-900">
                Designed for Focus
              </h2>
              <p className="text-slate-500 md:text-xl font-medium">
                We focus on what matters: clear, progressive learning without
                the noise.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: Terminal,
                title: "Structured Paths",
                desc: "Don't get lost. Follow curated paths from beginner to master with a clean curriculum.",
                color: "indigo",
              },
              {
                icon: Code,
                title: "Learning by Doing",
                desc: "Learn through hands-on practice. Small, measurable steps providing instant feedback.",
                color: "blue",
              },
              {
                icon: BookOpen,
                title: "Webinar Support",
                desc: "Join live sessions to deepen your understanding with professional mentors.",
                color: "emerald",
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="group border-none shadow-xl shadow-slate-200/50 rounded-[3rem] p-10 bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                <CardHeader className="p-0 space-y-6">
                  <div
                    className={`h-16 w-16 bg-${feature.color}-50 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner`}
                  >
                    <feature.icon
                      className={`h-8 w-8 text-${feature.color}-600`}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black text-slate-900 mb-3">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-lg font-medium leading-relaxed">
                      {feature.desc}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Learning Paths */}
      <section className="w-full py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16">
            <div className="space-y-4">
              <Badge
                variant="outline"
                className="px-4 py-1.5 rounded-full border-indigo-100 bg-indigo-50 text-indigo-600 font-black tracking-widest uppercase text-[10px]"
              >
                Featured Curriculum
              </Badge>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                Popular Mission <br className="hidden md:block" /> Paths
              </h2>
            </div>
            <Button
              variant="link"
              className="text-indigo-600 font-black uppercase tracking-widest text-xs group"
              asChild
            >
              <Link href="/learning-paths" className="flex items-center gap-2">
                View All Paths{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-rows-2 grid-flow-col md:grid-rows-none md:grid-cols-2 lg:grid-cols-3 md:grid-flow-row gap-4 md:gap-8 overflow-x-auto md:overflow-visible no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 snap-x touch-auto md:snap-none">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 md:h-96 w-[280px] md:w-full bg-slate-100 rounded-[2.5rem] animate-pulse"
                />
              ))
            ) : paths.length > 0 ? (
              paths.map((path) => (
                <Link
                  key={path.id}
                  href={`/learning-paths/${path.id}`}
                  className="group flex-none w-[280px] md:w-full snap-center"
                >
                  <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden h-full flex flex-col hover:shadow-2xl transition-all duration-500">
                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                      {path.thumbnail ? (
                        <img
                          src={getImageUrl(path.thumbnail)}
                          alt={path.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-200">
                          <BookOpen className="h-10 w-10" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <Zap className="h-3 w-3 text-indigo-600 fill-indigo-600" />
                        <span className="text-[10px] font-black text-slate-900">
                          {path.xp || 0} XP
                        </span>
                      </div>
                    </div>
                    <CardHeader className="p-8 pb-4">
                      <CardTitle className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {path.title}
                      </CardTitle>
                      <CardDescription className="text-slate-500 font-medium line-clamp-2 mt-2">
                        {path.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 mt-auto">
                      <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="h-6 w-6 rounded-full border-2 border-white bg-slate-100"
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">
                            Open to Public
                          </span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed">
                <p className="text-slate-400 font-bold">
                  Modules are being prepared.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Author Showcase Section */}
      <section className="w-full py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4 text-center lg:text-left">
                <Badge
                  variant="outline"
                  className="px-4 py-1.5 rounded-full border-amber-100 bg-amber-50 text-amber-600 font-black tracking-widest uppercase text-[10px]"
                >
                  Curated by Experts
                </Badge>
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight">
                  Learn Directly <br /> from the{" "}
                  <span className="text-indigo-600">Senseis</span>
                </h2>
                <p className="text-slate-500 text-lg md:text-xl font-medium max-w-xl mx-auto lg:mx-0">
                  Every material is crafted by industry practitioners active in
                  their fields. Not just theory, but real-world experience.
                </p>
              </div>

              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-12 w-12 border-slate-200 hover:border-indigo-600 hover:text-indigo-600 transition-all bg-white shadow-sm"
                  onClick={() => scroll("left")}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-12 w-12 border-slate-200 hover:border-indigo-600 hover:text-indigo-600 transition-all bg-white shadow-sm"
                  onClick={() => scroll("right")}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {[
                  {
                    label: "Active Senseis",
                    val: authors.length > 0 ? `${authors.length}+` : "12+",
                  },
                  {
                    label: "Curated Content",
                    val: paths.length > 0 ? `${paths.length}+` : "50+",
                  },
                  {
                    label: "Content Hours",
                    val: paths.length > 0 ? `${paths.length * 4}+` : "200+",
                  },
                  { label: "Satisfaction", val: "4.9/5" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
                  >
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">
                      {stat.val}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div
              ref={sliderRef}
              className="flex flex-nowrap overflow-x-auto no-scrollbar pb-10 -mx-4 px-4 gap-8 snap-x touch-auto md:mx-0 md:px-0"
            >
              {authors.length > 0 ? (
                authors.map((auth) => (
                  <div
                    key={auth.id}
                    className="relative group shrink-0 w-[280px] md:w-[350px] lg:w-full snap-center"
                  >
                    <Card className="relative overflow-hidden rounded-[3rem] md:rounded-[4rem] border border-slate-100 shadow-sm bg-white p-8 md:p-12 text-center flex flex-col items-center h-full hover:shadow-md transition-shadow duration-500">
                      <div className="relative mb-8">
                        <div className="h-32 w-32 md:h-40 md:w-40 rounded-[3.5rem] bg-slate-100 border-8 border-slate-50 overflow-hidden shadow-2xl rotate-3 transition-transform group-hover:rotate-0 duration-500">
                          {auth.avatar ? (
                            <img
                              src={getImageUrl(auth.avatar)}
                              alt={auth.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
                              <User className="h-12 w-12 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl">
                          <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                      </div>

                      <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2 line-clamp-1">
                        {auth.name}
                      </h3>
                      <p className="text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-6">
                        {auth.author_profile?.occupation || "Expert Instructor"}
                      </p>

                      <p className="text-slate-500 font-medium leading-relaxed mb-8 italic line-clamp-2 md:line-clamp-3">
                        "
                        {auth.author_profile?.bio ||
                          "Expert educator at Staredge Academy."}
                        "
                      </p>

                      <Button
                        className="w-full mt-auto h-14 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl"
                        asChild
                      >
                        <Link href={`/author/${auth.username || auth.id}`}>
                          View Author Portfolio
                        </Link>
                      </Button>
                    </Card>
                  </div>
                ))
              ) : (
                <div className="h-96 w-full bg-white rounded-[4rem] border-2 border-dashed flex items-center justify-center text-slate-400 font-bold">
                  Loading Sensei data...
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="bg-slate-900 rounded-[2rem] md:rounded-[4rem] p-8 md:p-20 text-center space-y-10 shadow-3xl">
            <div className="space-y-4 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-6xl font-black tracking-tight text-white">
                Ready to Become a Next Gen <br className="hidden sm:block" />
                <span className="text-blue-400">Digital Creator?</span>
              </h2>
              <p className="text-slate-400 text-xl font-medium">
                Join thousands of learners building their future with Staredge
                Digital.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-blue-50 h-16 px-12 rounded-3xl font-black text-xl shadow-2xl transition-all hover:scale-105 w-full sm:w-auto"
                asChild
              >
                <Link href="/register">Create Free Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
