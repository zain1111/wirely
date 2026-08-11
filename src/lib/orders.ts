import { z } from "zod";
import { COD_FEE_PKR } from "@/lib/constants";
import { sendOrderEmails } from "@/lib/email";
import { SEED_PRODUCTS } from "@/lib/data/seed-products";
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

function loadProductsBySlugs(slugs: string[]): Product[] {
  return SEED_PRODUCTS.filter((p) => slugs.includes(p.slug) && p.is_active);
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
  const products = loadProductsBySlugs(slugs);
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
  const discount = 0;
  const couponCode: string | null = null;
  const codFee = data.paymentMethod === "cod" ? COD_FEE_PKR : 0;
  const total = Math.max(0, subtotal - discount + codFee);

  const orderNumber = `WL-${Date.now().toString().slice(-8)}`;

  const emailResult = await sendOrderEmails({
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
    email: data.email,
    emailSent: emailResult.sent,
  };
}
