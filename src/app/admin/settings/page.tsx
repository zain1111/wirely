"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default function AdminSettingsPage() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage("");
    if (!hasSupabaseEnv()) {
      setMessage("Supabase required to save settings.");
      setPending(false);
      return;
    }

    const form = new FormData(e.currentTarget);
    const rows = [
      { key: "site_logo", value: String(form.get("site_logo") || "") },
      {
        key: "whatsapp_number",
        value: String(form.get("whatsapp_number") || ""),
      },
    ];

    try {
      const supabase = createClient();
      const { error } = await supabase.from("settings").upsert(rows);
      if (error) throw error;
      setMessage("Settings saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  async function signOut() {
    if (!hasSupabaseEnv()) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Settings</h1>
      <form
        onSubmit={onSubmit}
        className="max-w-xl space-y-3 rounded-3xl border border-border bg-card p-6"
      >
        <label className="block text-sm">
          Logo path / URL
          <input
            name="site_logo"
            defaultValue="/brand/logo.png"
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          WhatsApp number (digits only)
          <input
            name="whatsapp_number"
            defaultValue="923431143434"
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"
          />
        </label>
        {message && <p className="text-sm text-muted">{message}</p>}
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </button>
      </form>

      <button type="button" onClick={signOut} className="btn-secondary">
        Sign out
      </button>
    </div>
  );
}
