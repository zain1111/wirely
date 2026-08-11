import type { Coupon } from "@/lib/types";

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

export function computeDiscount(
  coupon: Coupon,
  subtotal: number,
): { ok: true; discount: number } | { ok: false; error: string } {
  if (!coupon.is_active) {
    return { ok: false, error: "This coupon is no longer active." };
  }

  const now = Date.now();
  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) {
    return { ok: false, error: "This coupon is not active yet." };
  }
  if (coupon.ends_at && new Date(coupon.ends_at).getTime() < now) {
    return { ok: false, error: "This coupon has expired." };
  }
  if (
    coupon.usage_limit != null &&
    coupon.used_count >= coupon.usage_limit
  ) {
    return { ok: false, error: "This coupon has reached its usage limit." };
  }
  if (
    coupon.min_order_amount != null &&
    subtotal < coupon.min_order_amount
  ) {
    return {
      ok: false,
      error: `Minimum order for this coupon is Rs ${coupon.min_order_amount.toLocaleString("en-PK")}.`,
    };
  }

  let discount =
    coupon.type === "percent"
      ? Math.floor((subtotal * coupon.value) / 100)
      : coupon.value;

  if (coupon.max_discount_amount != null) {
    discount = Math.min(discount, coupon.max_discount_amount);
  }

  discount = Math.max(0, Math.min(discount, subtotal));
  if (discount <= 0) {
    return { ok: false, error: "Coupon does not apply to this order." };
  }

  return { ok: true, discount };
}
