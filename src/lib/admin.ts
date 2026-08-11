import { SEED_PRODUCTS } from "@/lib/data/seed-products";
import type { Coupon, Order, Product, ProductReview } from "@/lib/types";

export async function getAdminStats() {
  return {
    products: SEED_PRODUCTS.length,
    orders: 0,
    revenue: 0,
    pendingReviews: 0,
    salesSeries: [] as { day: string; orders: number; revenue: number }[],
    usingSeed: true,
  };
}

export async function getAdminProducts(): Promise<Product[]> {
  return [...SEED_PRODUCTS].sort((a, b) => a.sort_order - b.sort_order);
}

export async function getAdminOrders(): Promise<Order[]> {
  return [];
}

export async function getAdminCoupons(): Promise<Coupon[]> {
  return [];
}

export async function getAdminReviews(): Promise<ProductReview[]> {
  return [];
}
