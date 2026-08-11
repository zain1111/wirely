"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export function CouponForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    if (!hasSupabaseEnv()) {
      setError("Supabase required.");
      setPending(false);
      return;
    }

    const form = new FormData(e.currentTarget);
    const payload = {
      code: String(form.get("code") || "")
        .trim()
        .toUpperCase(),
      type: String(form.get("type") || "fixed"),
      value: Number(form.get("value") || 0),
      min_order_amount: form.get("min_order_amount")
        ? Number(form.get("min_order_amount"))
        : null,
      max_discount_amount: form.get("max_discount_amount")
        ? Number(form.get("max_discount_amount"))
        : null,
      usage_limit: form.get("usage_limit")
        ? Number(form.get("usage_limit"))
        : null,
      is_active: true,
    };

    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("coupons").insert(payload);
      if (insertError) throw insertError;
      e.currentTarget.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create coupon");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-3xl border border-border bg-card p-5 md:grid-cols-3">
      <h2 className="font-display text-lg font-semibold md:col-span-3">
        Create coupon
      </h2>
      <input name="code" required placeholder="Code" className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
      <select name="type" className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
        <option value="fixed">Fixed (Rs)</option>
        <option value="percent">Percent</option>
      </select>
      <input name="value" type="number" required placeholder="Value" className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
      <input name="min_order_amount" type="number" placeholder="Min order" className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
      <input name="max_discount_amount" type="number" placeholder="Max discount" className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
      <input name="usage_limit" type="number" placeholder="Usage limit" className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
      {error && <p className="text-sm text-danger md:col-span-3">{error}</p>}
      <button type="submit" className="btn-primary md:col-span-3" disabled={pending}>
        {pending ? "Saving…" : "Add coupon"}
      </button>
    </form>
  );
}
