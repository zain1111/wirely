import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

const productSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120),
  name: z.string().min(1).max(200),
  short_name: z.string().min(1).max(120),
  price: z.number().int().min(0),
  compare_at_price: z.number().int().min(0).nullable().optional(),
  badge: z.string().max(80).nullable().optional(),
  description: z.string().max(5000),
  meta_title: z.string().max(200).nullable().optional(),
  meta_description: z.string().max(400).nullable().optional(),
  highlights: z.array(z.string()).default([]),
  images: z.array(z.string().min(1)).min(1),
  stock: z.number().int().min(0).default(0),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) {
      return NextResponse.json(
        { error: admin.error },
        { status: admin.status },
      );
    }

    const body = await request.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid product details.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { id, ...payload } = parsed.data;
    // Use session client so writes work even when the new sb_secret key
    // does not fully bypass RLS. Admin policies require is_admin().
    const db = admin.session;

    if (id) {
      const { error } = await db.from("products").update(payload).eq("id", id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true, id });
    }

    const { data, error } = await db
      .from("products")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch {
    return NextResponse.json(
      { error: "Could not save product." },
      { status: 500 },
    );
  }
}
