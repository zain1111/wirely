"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default function AdminLoginPage() {
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
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    try {
      const supabase = createClient();

      // Don't hang forever if the network/API stalls
      const loginPromise = supabase.auth.signInWithPassword({ email, password });
      const timeoutPromise = new Promise<never>((_, reject) => {
        window.setTimeout(
          () => reject(new Error("Sign-in timed out. Check your Supabase keys and network.")),
          15000,
        );
      });

      const { data, error: authError } = await Promise.race([
        loginPromise,
        timeoutPromise,
      ]);

      if (authError) {
        setError(authError.message);
        setPending(false);
        return;
      }

      if (!data.session) {
        setError(
          "Signed in but no session was created. In Supabase → Authentication → Providers, ensure Email is enabled. If email confirmation is required, confirm the user first.",
        );
        setPending(false);
        return;
      }

      // Hard navigation so middleware sees fresh auth cookies
      window.location.assign("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-8">
      <h1 className="font-display text-2xl font-bold">Admin login</h1>
      <p className="mt-2 text-sm text-muted">
        Sign in with the <strong>email address</strong> of a user you created in
        Supabase → Authentication → Users (not the word &quot;admin&quot;). That
        user must have{" "}
        <code className="rounded bg-background px-1">profiles.role</code> ={" "}
        <code className="rounded bg-background px-1">admin</code> in the database
        to save products.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <label className="block text-sm">
          Email address
          <input
          name="email"
          type="email"
          required
          autoComplete="username"
          placeholder="you@example.com"
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5"
        />
        </label>
        <label className="block text-sm">
          Password
          <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Password from Supabase"
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5"
        />
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
