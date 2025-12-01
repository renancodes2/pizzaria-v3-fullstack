"use client";

import { useAuth } from "../context/AuthProvider";

export function useFetchWithAuth() {
  const { accessToken, refresh } = useAuth();

  async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
    const headers = new Headers(init?.headers as HeadersInit || {});
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

    let res = await fetch(input, { ...init, headers });
    if (res.status === 401) {
      const newToken = await refresh();
      if (newToken) {
        headers.set("Authorization", `Bearer ${newToken}`);
        res = await fetch(input, { ...init, headers });
      }
    }
    return res;
  }

  return fetchWithAuth;
}