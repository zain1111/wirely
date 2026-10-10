import { revalidatePath } from "next/cache";
import { z } from "zod";
import { advanceDiscountPkr, deliveryFeePkr } from "@/lib/constants";
import { isPakistaniMobile } from "@/lib/phones";
import { computeDiscount, normalizeCouponCode } from "@/lib/coupons";
import { sendOrderEmails } from "@/lib/email";
import { mapProductRow } from "@/lib/products";
import { resolveUnitPrice } from "@/lib/pricing";
import { formatPublicOrderNumber } from "@/lib/utils";
import { hasServiceRole } from "@/lib/supabase/env";
import { createServiceClient } from "@/lib/supabase/server";
import type { Coupon, Product } from "@/lib/types";

const cartItemSchema = z.object({
  productSlug: z.string().min(1),
  variationId: z.string().nullable().optional(),
  quantity: z.number().int().min(1).max(20),
});

export const placeOrderSchema = z.object({
  customerName: z.string().min(2).max(100),
  email: z.union([z.string().email(), z.literal("")]),
  phone: z.string().refine(isPakistaniMobile, "Enter a Pakistani mobile number."),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  paymentMethod: z.enum(["advance", "cod"]),
  couponCode: z.string().optional().nullable(),
  attribution: z
    .object({
      utm_source: z.string().max(200).optional(),
      utm_medium: z.string().max(200).optional(),
      utm_campaign: z.string().max(200).optional(),
      utm_content: z.string().max(200).optional(),
      utm_term: z.string().max(200).optional(),
      fbclid: z.string().max(200).optional(),
      fbp: z.string().max(200).optional(),
      fbc: z.string().max(200).optional(),
    })
    .optional(),
  items: z.array(cartItemSchema).min(1),
  turnstileToken: z.string().optional().nullable(),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

export type PlaceOrderResult =
  | {
      ok: true;
      orderId: string;
      orderNumber: number | string;
      total: number;
      paymentMethod: "advance" | "cod";
      email: string;
      emailSent: boolean;
    }
  | { ok: false; error: string; status?: number };

type Line = {
  product_slug: string;
  variation_id: string | null;
  variation_label: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  variationStock: number | null;
};

export async function placeOrder(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check your order details.", status: 400 };
  }

  if (!hasServiceRole()) {
    return {
      ok: false,
      error:
        "Orders cannot be saved. Set SUPABASE_SERVICE_ROLE_KEY on the server.",
      status: 503,
    };
  }

  const data = parsed.data;
  const captchaOk = await verifyTurnstile(data.turnstileToken);
  if (!captchaOk) {
    return { ok: false, error: "Captcha verification failed.", status: 400 };
  }

  const supabase = createServiceClient();
  const slugs = [...new Set(data.items.map((i) => i.productSlug))];
  const { data: rows, error: productError } = await supabase
    .from("products")
    .select("*, product_variations(*)")
    .in("slug", slugs)
    .eq("is_active", true);

  if (productError) {
    return { ok: false, error: productError.message, status: 500 };
  }

  const products = (rows ?? []).map((row) => {
    const raw = row as Record<string, unknown>;
    const variations = Array.isArray(raw.product_variations)
      ? (raw.product_variations as Product["variations"])
      : [];
    return mapProductRow(raw, variations ?? []);
  });
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const requested = new Map<string, number>();
  for (const item of data.items) {
    requested.set(
      item.productSlug,
      (requested.get(item.productSlug) || 0) + item.quantity,
    );
  }

  const lines: Line[] = [];
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
    const variation = priced.variationId
      ? product.variations?.find((v) => v.id === priced.variationId)
      : undefined;
    const available = variation ? variation.stock : product.stock;
    const wanted = requested.get(item.productSlug) || item.quantity;
    if (available < wanted) {
      return {
        ok: false,
        error: `${product.short_name} only has ${available} in stock.`,
        status: 400,
      };
    }
    lines.push({
      product_slug: product.slug,
      variation_id:
        priced.variationId && UUID_RE.test(priced.variationId)
          ? priced.variationId
          : null,
      variation_label: priced.label,
      product_name: product.name,
      unit_price: priced.price,
      quantity: item.quantity,
      line_total: priced.price * item.quantity,
      variationStock: variation ? variation.stock : null,
    });
  }

  const subtotal = lines.reduce((s, l) => s + l.line_total, 0);
  let discount = 0;
  let couponCode: string | null = null;
  let couponId: string | null = null;

  const requestedCode = normalizeCouponCode(data.couponCode || "");
  if (requestedCode) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", requestedCode)
      .maybeSingle();
    if (!coupon) {
      return { ok: false, error: "Invalid coupon code.", status: 400 };
    }
    const applied = computeDiscount(coupon as Coupon, subtotal);
    if (!applied.ok) {
      return { ok: false, error: applied.error, status: 400 };
    }
    discount = applied.discount;
    couponCode = (coupon as Coupon).code;
    couponId = (coupon as Coupon).id;
  }

  const advanceDiscount =
    data.paymentMethod === "advance" ? advanceDiscountPkr(subtotal) : 0;
  const codFee = deliveryFeePkr(data.paymentMethod);
  const total = Math.max(0, subtotal - discount - advanceDiscount + codFee);

  const orderRow = {
    customer_name: data.customerName,
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city,
    subtotal_before_discount: subtotal,
    discount_amount: discount + advanceDiscount,
    coupon_id: couponId,
    coupon_code: couponCode,
    payment_method: data.paymentMethod,
    cod_fee: codFee,
    total_price: total,
    status: "pending" as const,
  };
  let { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ ...orderRow, attribution: data.attribution ?? null })
    .select("id, order_number")
    .single();

  if (orderError && /attribution/i.test(orderError.message)) {
    ({ data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderRow)
      .select("id, order_number")
      .single());
  }

  if (orderError || !order) {
    return {
      ok: false,
      error: orderError?.message || "Could not save the order.",
      status: 500,
    };
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    lines.map((line) => ({
      order_id: order.id,
      product_slug: line.product_slug,
      variation_id: line.variation_id,
      variation_label: line.variation_label,
      product_name: line.product_name,
      unit_price: line.unit_price,
      quantity: line.quantity,
      line_total: line.line_total,
    })),
  );

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return { ok: false, error: itemsError.message, status: 500 };
  }

  const soldByProduct = new Map<string, number>();
  const soldByVariation = new Map<string, { stock: number; qty: number }>();
  for (const line of lines) {
    soldByProduct.set(
      line.product_slug,
      (soldByProduct.get(line.product_slug) || 0) + line.quantity,
    );
    if (line.variation_id && line.variationStock != null) {
      const current = soldByVariation.get(line.variation_id);
      soldByVariation.set(line.variation_id, {
        stock: line.variationStock,
        qty: (current?.qty || 0) + line.quantity,
      });
    }
  }

  for (const [slug, qty] of soldByProduct) {
    const product = bySlug.get(slug);
    if (!product) continue;
    await supabase
      .from("products")
      .update({ stock: Math.max(0, product.stock - qty) })
      .eq("id", product.id);
  }
  for (const [variationId, sold] of soldByVariation) {
    await supabase
      .from("product_variations")
      .update({ stock: Math.max(0, sold.stock - sold.qty) })
      .eq("id", variationId);
  }

  if (couponId) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("used_count")
      .eq("id", couponId)
      .maybeSingle();
    if (coupon) {
      await supabase
        .from("coupons")
        .update({ used_count: Number(coupon.used_count || 0) + 1 })
        .eq("id", couponId);
    }
  }

  const publicNumber = formatPublicOrderNumber(order.order_number);

  const emailResult = await sendOrderEmails({
    orderId: order.id,
    orderNumber: publicNumber,
    customerName: data.customerName,
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city,
    paymentMethod: data.paymentMethod,
    codFee,
    discount,
    advancePaymentDiscountAmount: advanceDiscount,
    subtotal,
    total,
    couponCode,
    items: lines,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  for (const slug of slugs) revalidatePath(`/${slug}`);

  return {
    ok: true,
    orderId: order.id,
    orderNumber: publicNumber,
    total,
    paymentMethod: data.paymentMethod,
    email: data.email,
    emailSent: emailResult.sent,
  };
}
