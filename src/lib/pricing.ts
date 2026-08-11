import type { Product } from "@/lib/types";

export function displayPrice(product: Product): number {
  const vars = (product.variations ?? []).filter((v) => v.is_active);
  if (!vars.length) return product.price;
  return Math.min(...vars.map((v) => v.price));
}

export function resolveUnitPrice(
  product: Product,
  variationId?: string | null,
): { price: number; label: string | null; variationId: string | null } {
  if (variationId) {
    const v = (product.variations ?? []).find((x) => x.id === variationId);
    if (v) {
      return { price: v.price, label: v.label, variationId: v.id };
    }
  }
  return { price: product.price, label: null, variationId: null };
}
