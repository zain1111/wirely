import { hasServiceRole, hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { SEED_PRODUCTS } from "@/lib/data/seed-products";
import type { Coupon, Order, Product, ProductReview } from "@/lib/types";

export async function getAdminStats() {
  if (!hasServiceRole()) {
    return {
      products: SEED_PRODUCTS.length,
      orders: 0,
      revenue: 0,
      pendingReviews: 0,
      salesSeries: [] as { day: string; orders: number; revenue: number }[],
      usingSeed: true,
    };
  }

  const supabase = createServiceClient();
  const [{ count: products }, { data: orders }, { count: pendingReviews }] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("total_price, status, created_at")
        .neq("status", "cancelled"),
      supabase
        .from("product_reviews")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

  const revenue = (orders ?? []).reduce(
    (sum, o) => sum + Number(o.total_price || 0),
    0,
  );

  const days = 30;
  const seriesMap = new Map<string, { orders: number; revenue: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    seriesMap.set(key, { orders: 0, revenue: 0 });
  }
  for (const o of orders ?? []) {
    const key = String(o.created_at).slice(0, 10);
    const bucket = seriesMap.get(key);
    if (bucket) {
      bucket.orders += 1;
      bucket.revenue += Number(o.total_price || 0);
    }
  }

  return {
    products: products ?? 0,
    orders: orders?.length ?? 0,
    revenue,
    pendingReviews: pendingReviews ?? 0,
    salesSeries: [...seriesMap.entries()].map(([day, v]) => ({ day, ...v })),
    usingSeed: false,
  };
}

export async function getAdminProducts(): Promise<Product[]> {
  if (!hasSupabaseEnv()) return SEED_PRODUCTS;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*, product_variations(*)")
      .order("sort_order", { ascending: true });
    if (!data?.length) return SEED_PRODUCTS;
    return data.map((row) => ({
      ...(row as Product),
      variations: (row.product_variations as Product["variations"]) ?? [],
    }));
  } catch {
    return SEED_PRODUCTS;
  }
}

export async function getAdminOrders(): Promise<Order[]> {
  if (!hasServiceRole()) return [];
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false })
    .limit(100);
  return (data as Order[]) ?? [];
}

export async function getAdminCoupons(): Promise<Coupon[]> {
  if (!hasServiceRole()) return [];
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Coupon[]) ?? [];
}

export async function getAdminReviews(): Promise<ProductReview[]> {
  if (!hasServiceRole()) return [];
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("product_reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  return (data as ProductReview[]) ?? [];
}
