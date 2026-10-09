import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) {
      return NextResponse.json(
        { error: admin.error },
        { status: admin.status },
      );
    }

    const form = await request.formData();
    const file = form.get("file");
    const folderRaw = String(form.get("folder") || "products");
    const folder =
      folderRaw
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60) || "products";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WebP, or GIF images are allowed." },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image must be 5 MB or smaller." },
        { status: 400 },
      );
    }

    const safeName = sanitizeFilename(file.name) || "image";
    const path = `${folder}/${Date.now()}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const options = {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    };

    // 1) Prefer service client when it actually bypasses RLS
    // 2) Fall back to the signed-in admin session (needs storage policies)
    let uploadError: { message: string } | null = null;

    if (admin.service) {
      const attempt = await admin.service.storage
        .from(BUCKET)
        .upload(path, buffer, options);
      uploadError = attempt.error;
    }

    if (uploadError || !admin.service) {
      const attempt = await admin.session.storage
        .from(BUCKET)
        .upload(path, buffer, options);
      if (attempt.error) {
        const msg = attempt.error.message;
        const hint = /row-level security|rls/i.test(msg)
          ? " Run supabase/migrations/007_fix_storage_rls.sql in the Supabase SQL Editor, and confirm profiles.role = 'admin'."
          : "";
        return NextResponse.json(
          { error: `${msg}.${hint}` },
          { status: 500 },
        );
      }
      uploadError = null;
    }

    const urlClient = admin.service ?? admin.session;
    const { data } = urlClient.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Upload failed",
      },
      { status: 500 },
    );
  }
}
