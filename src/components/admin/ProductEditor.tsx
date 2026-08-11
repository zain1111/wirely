"use client";

import Image from "next/image";
import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Link2, Loader2, Trash2, Upload } from "lucide-react";
import type { Product } from "@/lib/types";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { uploadProductImage } from "@/lib/storage";
import { productImageSrc } from "@/lib/utils";

export function ProductEditor({ product }: { product?: Product }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [urlDraft, setUrlDraft] = useState("");
  const [slugDraft, setSlugDraft] = useState(product?.slug ?? "");
  const isNew = !product;

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    if (!hasSupabaseEnv()) {
      setError("Supabase is required to upload images.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const folder = slugDraft.trim() || product?.id || "products";
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadProductImage(file, folder);
        uploaded.push(url);
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function addUrl() {
    const value = urlDraft.trim();
    if (!value) return;
    setImages((prev) => [...prev, value]);
    setUrlDraft("");
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");

    if (!hasSupabaseEnv()) {
      setError("Supabase is required to save products.");
      setPending(false);
      return;
    }

    if (!images.length) {
      setError("Add at least one product image (upload or URL).");
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
      images,
      stock: Number(form.get("stock") || 0),
      sort_order: Number(form.get("sort_order") || 0),
      is_active: form.get("is_active") === "on",
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          id: isNew ? undefined : product.id,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Save failed");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-3xl border border-border bg-card p-6"
    >
      <h1 className="font-display text-2xl font-bold">
        {isNew ? "Add product" : `Edit ${product.short_name}`}
      </h1>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block text-sm">
          Slug
          <input
            name="slug"
            required
            value={slugDraft}
            onChange={(e) => setSlugDraft(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"
          />
        </label>
        <Field
          name="short_name"
          label="Short name"
          defaultValue={product?.short_name}
          required
        />
        <Field
          name="name"
          label="Full name"
          defaultValue={product?.name}
          required
          className="md:col-span-2"
        />
        <Field
          name="price"
          label="Price (PKR)"
          type="number"
          defaultValue={product?.price ?? 0}
          required
        />
        <Field
          name="compare_at_price"
          label="Compare-at price"
          type="number"
          defaultValue={product?.compare_at_price ?? ""}
        />
        <Field name="badge" label="Badge" defaultValue={product?.badge ?? ""} />
        <Field
          name="stock"
          label="Stock"
          type="number"
          defaultValue={product?.stock ?? 0}
        />
        <Field
          name="sort_order"
          label="Sort order"
          type="number"
          defaultValue={product?.sort_order ?? 0}
        />
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input
            name="is_active"
            type="checkbox"
            defaultChecked={product?.is_active ?? true}
          />
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

        {/* Image manager */}
        <div className="space-y-3 md:col-span-2">
          <p className="text-sm font-medium">Product images</p>
          <p className="text-xs text-muted">
            Upload from your computer (JPG, PNG, WebP, GIF — max 5 MB) or paste
            an image URL. First image is the main shop photo.
          </p>

          {images.length > 0 && (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((src, index) => (
                <li
                  key={`${src}-${index}`}
                  className="overflow-hidden rounded-2xl border border-border bg-background"
                >
                  <div className="product-stage relative aspect-square">
                    <Image
                      src={productImageSrc(src)}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="220px"
                      unoptimized={src.startsWith("http")}
                    />
                    {index === 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-graphite px-2 py-0.5 text-[10px] font-semibold text-white">
                        Main
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-1 p-2">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveImage(index, -1)}
                        disabled={index === 0}
                        className="rounded-lg border border-border px-2 py-1 text-xs disabled:opacity-40"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(index, 1)}
                        disabled={index === images.length - 1}
                        className="rounded-lg border border-border px-2 py-1 text-xs disabled:opacity-40"
                      >
                        →
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-danger hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <div
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-background px-4 py-8 text-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void handleFiles(e.dataTransfer.files);
              }}
            >
              <ImagePlus className="h-8 w-8 text-accent" />
              <p className="text-sm font-medium">Upload images</p>
              <p className="text-xs text-muted">Drag & drop or choose files</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={(e) => void handleFiles(e.target.files)}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary mt-1 px-4 py-2 text-sm"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Choose files
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col justify-center gap-2 rounded-2xl border border-border bg-background p-4">
              <p className="inline-flex items-center gap-1.5 text-sm font-medium">
                <Link2 className="h-4 w-4 text-accent" />
                Or add image URL / path
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlDraft}
                  onChange={(e) => setUrlDraft(e.target.value)}
                  placeholder="/products/photo.webp or https://…"
                  className="min-w-0 flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addUrl();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addUrl}
                  className="btn-secondary px-4 py-2 text-sm"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        <Field
          name="meta_title"
          label="Meta title"
          defaultValue={product?.meta_title ?? ""}
          className="md:col-span-2"
        />
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
      <button type="submit" className="btn-primary" disabled={pending || uploading}>
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
