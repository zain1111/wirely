import { SEED_PRODUCTS } from "@/lib/data/seed-products";
import type { Product, ProductVariation } from "@/lib/types";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export { displayPrice, resolveUnitPrice } from "@/lib/pricing";

function mapProduct(
  row: Record<string, unknown>,
  variations: ProductVariation[] = [],
): Product {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    short_name: String(row.short_name),
    price: Number(row.price),
    compare_at_price:
      row.compare_at_price == null ? null : Number(row.compare_at_price),
    badge: row.badge == null ? null : String(row.badge),
    description: String(row.description),
    meta_title: row.meta_title == null ? null : String(row.meta_title),
    meta_description:
      row.meta_description == null ? null : String(row.meta_description),
    video_url: row.video_url == null ? null : String(row.video_url),
    video_thumbnail:
      row.video_thumbnail == null ? null : String(row.video_thumbnail),
    highlights: Array.isArray(row.highlights)
      ? (row.highlights as string[])
      : [],
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    device_compatibility: Array.isArray(row.device_compatibility)
      ? (row.device_compatibility as Product["device_compatibility"])
      : [],
    stock: Number(row.stock ?? 0),
    sort_order: Number(row.sort_order ?? 0),
    is_active: Boolean(row.is_active),
    variations,
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!hasSupabaseEnv()) {
    return SEED_PRODUCTS.filter((p) => p.is_active).sort(
      (a, b) => a.sort_order - b.sort_order,
    );
  }

  try {
    const supabase = await createClient();
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !products?.length) {
      return SEED_PRODUCTS.filter((p) => p.is_active);
    }

    const { data: variations } = await supabase
      .from("product_variations")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    const byProduct = new Map<string, ProductVariation[]>();
    for (const v of variations ?? []) {
      const list = byProduct.get(v.product_id) ?? [];
      list.push(v as ProductVariation);
      byProduct.set(v.product_id, list);
    }

    return products.map((p) =>
      mapProduct(p as Record<string, unknown>, byProduct.get(p.id) ?? []),
    );
  } catch {
    return SEED_PRODUCTS.filter((p) => p.is_active);
  }
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | null> {
  if (!hasSupabaseEnv()) {
    return SEED_PRODUCTS.find((p) => p.slug === slug && p.is_active) ?? null;
  }

  try {
    const supabase = await createClient();
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !product) {
      return SEED_PRODUCTS.find((p) => p.slug === slug && p.is_active) ?? null;
    }

    const { data: variations } = await supabase
      .from("product_variations")
      .select("*")
      .eq("product_id", product.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    return mapProduct(
      product as Record<string, unknown>,
      (variations as ProductVariation[]) ?? [],
    );
  } catch {
    return SEED_PRODUCTS.find((p) => p.slug === slug && p.is_active) ?? null;
  }
}
