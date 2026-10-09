import { revalidatePath } from "next/cache";
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
  purchase_mode: z.enum(["checkout", "enquiry"]).default("checkout"),
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

    const { id, purchase_mode: _purchaseMode, ...payloadBase } = parsed.data;
    // Omit purchase_mode until migration 012 is applied — otherwise PostgREST
    // rejects the entire update ("column not in schema cache") and stock is not saved.
    let payload: Record<string, unknown> = { ...payloadBase };
    // Prefer service role for writes (reliable). Fall back to signed-in admin session + RLS.
    const db = admin.service ?? admin.session;

    async function updateProductRow(productId: string) {
      let result = await db
        .from("products")
        .update(payload)
        .eq("id", productId)
        .select("id, slug, stock")
        .maybeSingle();

      if (
        result.error &&
        /purchase_mode|column/i.test(result.error.message) &&
        "purchase_mode" in payload
      ) {
        const { purchase_mode: _removed, ...withoutMode } = payload;
        payload = withoutMode;
        result = await db
          .from("products")
          .update(payload)
          .eq("id", productId)
          .select("id, slug, stock")
          .maybeSingle();
      }

      return result;
    }

    if (id && !z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        {
          error:
            "This product is from the local seed file, not the database. Set SUPABASE_SERVICE_ROLE_KEY on the server and use products loaded from Supabase.",
        },
        { status: 400 },
      );
    }

    function refreshStorefront(slug: string) {
      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath("/admin");
      revalidatePath("/admin/products");
      revalidatePath(`/${slug}`);
    }

    if (id) {
      const { data: existing } = await db
        .from("products")
        .select("slug")
        .eq("id", id)
        .maybeSingle();

      const { data: updated, error } = await updateProductRow(id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!updated) {
        return NextResponse.json(
          {
            error:
              "No product row was updated. Confirm this product id is from Supabase (UUID), not the seed file, and that your user has profiles.role = 'admin'.",
          },
          { status: 404 },
        );
      }

      if (existing?.slug) refreshStorefront(String(existing.slug));
      if (existing?.slug !== payload.slug) refreshStorefront(payload.slug);
      return NextResponse.json({ ok: true, id, stock: updated.stock });
    }

    let insertResult = await db.from("products").insert(payload).select("id").single();

    if (
      insertResult.error &&
      /purchase_mode|column/i.test(insertResult.error.message) &&
      "purchase_mode" in payload
    ) {
      const { purchase_mode: _removed, ...withoutMode } = payload;
      payload = withoutMode;
      insertResult = await db
        .from("products")
        .insert(payload)
        .select("id")
        .single();
    }

    const { data, error } = insertResult;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    refreshStorefront(payload.slug);
    return NextResponse.json({ ok: true, id: data.id });
  } catch {
    return NextResponse.json(
      { error: "Could not save product." },
      { status: 500 },
    );
  }
}
