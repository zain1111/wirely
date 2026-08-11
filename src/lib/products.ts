import { SEED_PRODUCTS } from "@/lib/data/seed-products";
import type { Product } from "@/lib/types";

export { displayPrice, resolveUnitPrice } from "@/lib/pricing";

export async function getProducts(): Promise<Product[]> {
  return SEED_PRODUCTS.filter((p) => p.is_active).sort(
    (a, b) => a.sort_order - b.sort_order,
  );
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | null> {
  return SEED_PRODUCTS.find((p) => p.slug === slug && p.is_active) ?? null;
}
