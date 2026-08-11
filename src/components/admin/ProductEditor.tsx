"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export function ProductEditor({ product }: { product?: Product }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const isNew = !product;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");

    if (!hasSupabaseEnv()) {
      setError("Supabase is required to save products.");
      setPending(false);
      return;
    }

    const form = new FormData(e.currentTarget);
    const payload = {
      slug: String(form.get("slug") || "").trim(),
      name: String(form.get("name") || "").trim(),
      short_name: String(form.get("short_name") || "").trim(),
      price: Number(form.get("price") || 0),
      compare_at_price: form.get("compare_at_price")
        ? Number(form.get("compare_at_price"))
        : null,
      badge: String(form.get("badge") || "") || null,
      description: String(form.get("description") || ""),
      meta_title: String(form.get("meta_title") || "") || null,
      meta_description: String(form.get("meta_description") || "") || null,
      highlights: String(form.get("highlights") || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      images: String(form.get("images") || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      stock: Number(form.get("stock") || 0),
      sort_order: Number(form.get("sort_order") || 0),
      is_active: form.get("is_active") === "on",
    };

    try {
      const supabase = createClient();
      if (isNew) {
        const { error: insertError } = await supabase
          .from("products")
          .insert(payload);
        if (insertError) throw insertError;
      } else {
        const { error: updateError } = await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id);
        if (updateError) throw updateError;
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-border bg-card p-6">
      <h1 className="font-display text-2xl font-bold">
        {isNew ? "Add product" : `Edit ${product.short_name}`}
      </h1>

      <div className="grid gap-3 md:grid-cols-2">
        <Field name="slug" label="Slug" defaultValue={product?.slug} required />
        <Field name="short_name" label="Short name" defaultValue={product?.short_name} required />
        <Field name="name" label="Full name" defaultValue={product?.name} required className="md:col-span-2" />
        <Field name="price" label="Price (PKR)" type="number" defaultValue={product?.price ?? 0} required />
        <Field
          name="compare_at_price"
          label="Compare-at price"
          type="number"
          defaultValue={product?.compare_at_price ?? ""}
        />
        <Field name="badge" label="Badge" defaultValue={product?.badge ?? ""} />
        <Field name="stock" label="Stock" type="number" defaultValue={product?.stock ?? 0} />
        <Field name="sort_order" label="Sort order" type="number" defaultValue={product?.sort_order ?? 0} />
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input name="is_active" type="checkbox" defaultChecked={product?.is_active ?? true} />
          Active
        </label>
        <label className="block text-sm md:col-span-2">
          Description
          <textarea
            name="description"
            required
            rows={4}
            defaultValue={product?.description}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="block text-sm md:col-span-2">
          Highlights (one per line)
          <textarea
            name="highlights"
            rows={4}
            defaultValue={(product?.highlights ?? []).join("\n")}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="block text-sm md:col-span-2">
          Image URLs / paths (one per line)
          <textarea
            name="images"
            rows={3}
            defaultValue={(product?.images ?? []).join("\n")}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"
          />
        </label>
        <Field name="meta_title" label="Meta title" defaultValue={product?.meta_title ?? ""} className="md:col-span-2" />
        <label className="block text-sm md:col-span-2">
          Meta description
          <textarea
            name="meta_description"
            rows={2}
            defaultValue={product?.meta_description ?? ""}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"
          />
        </label>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Saving…" : "Save product"}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  required,
  className = "",
}: {
  name: string;
  label: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"
      />
    </label>
  );
}
