"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

type AuthContextValue = {
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();

  async function login(email: string, password: string) {
    const res = await fetch(`/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Login failed");
    const data = await res.json();
    setAccessToken(data.access_token || null);
    router.push("/");
  }

  async function logout() {
    setAccessToken(null);
    await fetch(`/api/auth/logout`, { method: "POST" }).catch(() => {});
    router.push("/");
  }

  async function refresh() {
    const res = await fetch(`/api/auth/refresh`, { method: "POST" });
    if (!res.ok) return null;
    const data = await res.json();
    setAccessToken(data.access_token || null);
    return data.access_token || null;
  }

  return (
    <AuthContext.Provider value={{ accessToken, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
