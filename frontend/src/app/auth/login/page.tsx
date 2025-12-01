"use client";

import React, { useState } from "react";
import { useAuth } from "../../../context/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl mb-4">Login</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border px-3 py-2 rounded"
          type="email"
        />
        <input
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border px-3 py-2 rounded"
          type="password"
        />
        <button className="bg-black text-white px-4 py-2 rounded">Entrar</button>
        {error && <div className="text-red-600">{error}</div>}
      </form>
    </div>
  );
}
