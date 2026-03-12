"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { User, AuthResponse } from "@/types/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for token on mount
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Verify token by fetching user profile or just restore state if we trust localStorage
          // For now, we'll assume valid if user data is also in storage or just set loaded
          // Ideally, we have a /me endpoint to verify token
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch (error) {
          console.error("Auth check failed", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  // Protect routes workflow
  useEffect(() => {
    if (!loading) {
      const isAuthGroup =
        pathname.startsWith("/login") || pathname.startsWith("/register");
      const isDashboard =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/learning-paths") ||
        pathname.startsWith("/challenges") ||
        pathname.startsWith("/my-certificates") ||
        pathname.startsWith("/author") ||
        pathname.startsWith("/admin");

      if (!user && isDashboard) {
        router.push("/login");
      }

      if (user && isAuthGroup) {
        router.push("/dashboard");
      }
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
