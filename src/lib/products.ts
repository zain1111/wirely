import { SEED_PRODUCTS } from "@/lib/data/seed-products";
import type { Product, ProductVariation } from "@/lib/types";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";

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

function activeVariations(raw: unknown): ProductVariation[] {
  if (!Array.isArray(raw)) return [];
  return (raw as ProductVariation[])
    .filter((v) => v.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export async function getProducts(): Promise<Product[]> {
  if (!hasSupabaseEnv()) {
    return SEED_PRODUCTS.filter((p) => p.is_active).sort(
      (a, b) => a.sort_order - b.sort_order,
    );
  }

  try {
    const supabase = createPublicClient();
    const { data: products, error } = await supabase
      .from("products")
      .select("*, product_variations(*)")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !products?.length) {
      return SEED_PRODUCTS.filter((p) => p.is_active);
    }

    return products.map((p) =>
      mapProduct(
        p as Record<string, unknown>,
        activeVariations((p as Record<string, unknown>).product_variations),
      ),
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
    const supabase = createPublicClient();
    const { data: product, error } = await supabase
      .from("products")
      .select("*, product_variations(*)")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !product) {
      return SEED_PRODUCTS.find((p) => p.slug === slug && p.is_active) ?? null;
    }

    return mapProduct(
      product as Record<string, unknown>,
      activeVariations((product as Record<string, unknown>).product_variations),
    );
  } catch {
    return SEED_PRODUCTS.find((p) => p.slug === slug && p.is_active) ?? null;
  }
}
