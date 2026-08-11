import { z } from "zod";
import { COD_FEE_PKR } from "@/lib/constants";
import { computeDiscount, normalizeCouponCode } from "@/lib/coupons";
import { sendOrderEmails } from "@/lib/email";
import { SEED_PRODUCTS } from "@/lib/data/seed-products";
import { hasServiceRole } from "@/lib/supabase/env";
import { createServiceClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { resolveUnitPrice } from "@/lib/pricing";

const cartItemSchema = z.object({
  productSlug: z.string().min(1),
  variationId: z.string().nullable().optional(),
  quantity: z.number().int().min(1).max(20),
});

export const placeOrderSchema = z.object({
  customerName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  paymentMethod: z.enum(["advance", "cod"]),
  couponCode: z.string().optional().nullable(),
  items: z.array(cartItemSchema).min(1),
  turnstileToken: z.string().optional().nullable(),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

async function verifyTurnstile(token?: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    },
  );
  const data = (await res.json()) as { success?: boolean };
  return Boolean(data.success);
}

async function loadProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (!hasServiceRole()) {
    return SEED_PRODUCTS.filter((p) => slugs.includes(p.slug));
  }
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_variations(*)")
    .in("slug", slugs)
    .eq("is_active", true);

  if (!data?.length) {
    return SEED_PRODUCTS.filter((p) => slugs.includes(p.slug));
  }

  return data.map((row) => ({
    ...(row as Product),
    variations: (row.product_variations as Product["variations"]) ?? [],
  }));
}

export type PlaceOrderResult =
  | {
      ok: true;
      orderId: string;
      orderNumber: number | string;
      total: number;
      paymentMethod: "advance" | "cod";
      whatsappMessage: string;
    }
  | { ok: false; error: string; status?: number };

export async function placeOrder(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check your order details.", status: 400 };
  }

  const data = parsed.data;
  const captchaOk = await verifyTurnstile(data.turnstileToken);
  if (!captchaOk) {
    return { ok: false, error: "Captcha verification failed.", status: 400 };
  }

  const slugs = [...new Set(data.items.map((i) => i.productSlug))];
  const products = await loadProductsBySlugs(slugs);
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const lines: {
    product_slug: string;
    variation_id: string | null;
    variation_label: string | null;
    product_name: string;
    unit_price: number;
    quantity: number;
    line_total: number;
  }[] = [];

  for (const item of data.items) {
    const product = bySlug.get(item.productSlug);
    if (!product) {
      return {
        ok: false,
        error: `Product unavailable: ${item.productSlug}`,
        status: 400,
      };
    }
    const priced = resolveUnitPrice(product, item.variationId);
    lines.push({
      product_slug: product.slug,
      variation_id: priced.variationId,
      variation_label: priced.label,
      product_name: product.name,
      unit_price: priced.price,
      quantity: item.quantity,
      line_total: priced.price * item.quantity,
    });
  }

  const subtotal = lines.reduce((s, l) => s + l.line_total, 0);
  let discount = 0;
  let couponId: string | null = null;
  let couponCode: string | null = null;

  if (data.couponCode?.trim() && hasServiceRole()) {
    const supabase = createServiceClient();
    const code = normalizeCouponCode(data.couponCode);
    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (coupon) {
      const result = computeDiscount(coupon, subtotal);
      if (!result.ok) {
        return { ok: false, error: result.error, status: 400 };
      }
      discount = result.discount;
      couponId = coupon.id;
      couponCode = coupon.code;
    }
  }

  const codFee = data.paymentMethod === "cod" ? COD_FEE_PKR : 0;
  const total = Math.max(0, subtotal - discount + codFee);

  if (!hasServiceRole()) {
    const orderNumber = `DEMO-${Date.now().toString().slice(-8)}`;
    const whatsappMessage = buildWhatsAppMessage({
      orderNumber,
      name: data.customerName,
      phone: data.phone,
      city: data.city,
      total,
      paymentMethod: data.paymentMethod,
      items: lines,
    });

    await sendOrderEmails({
      orderNumber,
      customerName: data.customerName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      paymentMethod: data.paymentMethod,
      codFee,
      discount,
      subtotal,
      total,
      couponCode,
      items: lines,
    });

    return {
      ok: true,
      orderId: orderNumber,
      orderNumber,
      total,
      paymentMethod: data.paymentMethod,
      whatsappMessage,
    };
  }

  const supabase = createServiceClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: data.customerName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      subtotal_before_discount: subtotal,
      discount_amount: discount,
      coupon_id: couponId,
      coupon_code: couponCode,
      payment_method: data.paymentMethod,
      cod_fee: codFee,
      total_price: total,
      status: "pending",
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return {
      ok: false,
      error: orderError?.message || "Could not create order.",
      status: 500,
    };
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    lines.map((l) => ({
      order_id: order.id,
      ...l,
    })),
  );

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return { ok: false, error: "Could not save order items.", status: 500 };
  }

  if (couponId) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("used_count")
      .eq("id", couponId)
      .single();
    if (coupon) {
      await supabase
        .from("coupons")
        .update({ used_count: (coupon.used_count ?? 0) + 1 })
        .eq("id", couponId);
    }
  }

  for (const line of lines) {
    const { data: product } = await supabase
      .from("products")
      .select("id, stock")
      .eq("slug", line.product_slug)
      .maybeSingle();
    if (product) {
      await supabase
        .from("products")
        .update({ stock: Math.max(0, product.stock - line.quantity) })
        .eq("id", product.id);
    }
  }

  await sendOrderEmails({
    orderNumber: order.order_number,
    customerName: data.customerName,
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city,
    paymentMethod: data.paymentMethod,
    codFee,
    discount,
    subtotal,
    total,
    couponCode,
    items: lines,
  });

  const whatsappMessage = buildWhatsAppMessage({
    orderNumber: order.order_number,
    name: data.customerName,
    phone: data.phone,
    city: data.city,
    total,
    paymentMethod: data.paymentMethod,
    items: lines,
  });

  return {
    ok: true,
    orderId: order.id,
    orderNumber: order.order_number,
    total,
    paymentMethod: data.paymentMethod,
    whatsappMessage,
  };
}

function buildWhatsAppMessage(opts: {
  orderNumber: number | string;
  name: string;
  phone: string;
  city: string;
  total: number;
  paymentMethod: "advance" | "cod";
  items: { product_name: string; quantity: number; line_total: number }[];
}): string {
  const lines = opts.items
    .map((i) => `• ${i.product_name} × ${i.quantity}`)
    .join("\n");
  return [
    `Hi Wirely! I just placed order #${opts.orderNumber}.`,
    `Name: ${opts.name}`,
    `Phone: ${opts.phone}`,
    `City: ${opts.city}`,
    `Payment: ${opts.paymentMethod === "cod" ? "Cash on Delivery" : "Advance"}`,
    `Total: Rs ${opts.total.toLocaleString("en-PK")}`,
    "",
    "Items:",
    lines,
  ].join("\n");
}
