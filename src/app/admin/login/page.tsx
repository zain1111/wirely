"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");

    if (!hasSupabaseEnv()) {
      setError("Configure Supabase env vars before using admin login.");
      setPending(false);
      return;
    }

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError(authError.message);
        setPending(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Login failed.");
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-8">
      <h1 className="font-display text-2xl font-bold">Admin login</h1>
      <p className="mt-2 text-sm text-muted">
        Sign in with your Supabase admin user (set role = admin in profiles).
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
