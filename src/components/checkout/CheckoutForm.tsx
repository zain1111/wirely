"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { COD_FEE_PKR } from "@/lib/constants";
import { trackBeginCheckout, trackPurchase } from "@/lib/analytics";
import { formatPkr, productImageSrc } from "@/lib/utils";
import { useCart } from "@/store/cart";

export function CheckoutForm() {
  const router = useRouter();
  const { lines, couponCode, setCouponCode, clearCart, subtotal } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"advance" | "cod">("advance");
  const [discount, setDiscount] = useState(0);
  const [couponInput, setCouponInput] = useState(couponCode || "");
  const [couponError, setCouponError] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const cartSubtotal = subtotal();

  useEffect(() => {
    if (lines.length) {
      trackBeginCheckout(
        cartSubtotal,
        lines.map((l) => ({
          item_id: l.productSlug,
          item_name: l.productName,
          price: l.unitPrice,
          quantity: l.quantity,
        })),
      );
    }
  }, [lines, cartSubtotal]);

  const codFee = paymentMethod === "cod" ? COD_FEE_PKR : 0;
  const total = Math.max(0, cartSubtotal - discount + codFee);

  const steps = useMemo(
    () => ["Cart", "Details", "Confirm"],
    [],
  );

  async function applyCoupon() {
    setCouponError("");
    if (!couponInput.trim()) {
      setDiscount(0);
      setCouponCode(null);
      return;
    }
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput, subtotal: cartSubtotal }),
    });
    const data = await res.json();
    if (!res.ok) {
      setDiscount(0);
      setCouponCode(null);
      setCouponError(data.error || "Invalid coupon");
      return;
    }
    setDiscount(data.discount);
    setCouponCode(data.code);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!lines.length) return;
    setPending(true);
    setError("");
    const form = new FormData(e.currentTarget);

    const payload = {
      customerName: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      address: String(form.get("address") || ""),
      city: String(form.get("city") || ""),
      paymentMethod,
      couponCode: couponCode || couponInput || null,
      items: lines.map((l) => ({
        productSlug: l.productSlug,
        variationId: l.variationId,
        quantity: l.quantity,
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not place order.");
        setPending(false);
        return;
      }

      trackPurchase({
        transaction_id: String(data.orderNumber),
        value: data.total,
        items: lines.map((l) => ({
          item_id: l.productSlug,
          item_name: l.productName,
          price: l.unitPrice,
          quantity: l.quantity,
        })),
      });

      clearCart();
      const params = new URLSearchParams({
        order: String(data.orderNumber),
        total: String(data.total),
        pay: data.paymentMethod,
        wa: data.whatsappMessage,
      });
      router.push(`/checkout/thanks?${params.toString()}`);
    } catch {
      setError("Could not place order.");
      setPending(false);
    }
  }

  if (!lines.length) {
    return (
      <div className="container-wirely py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-3 text-muted">Add a product before checking out.</p>
        <Link href="/shop" className="btn-primary mt-6 inline-flex">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-wirely py-8 md:py-12">
      <div className="mb-8 flex items-center justify-center gap-2 text-sm">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 ${
                i < 2 ? "bg-accent text-white" : "bg-accent-soft text-accent-dark"
              }`}
            >
              {step}
            </span>
            {i < steps.length - 1 && <span className="text-muted">→</span>}
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={onSubmit} className="space-y-4 rounded-[2rem] border border-border bg-card p-6 md:p-8">
          <h1 className="font-display text-3xl font-bold">Checkout</h1>
          <p className="text-sm text-muted">
            One short form. We’ll confirm on WhatsApp after you place the order.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm md:col-span-2">
              Full name
              <input
                name="name"
                required
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5"
              />
            </label>
            <label className="block text-sm">
              Email
              <input
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5"
              />
            </label>
            <label className="block text-sm">
              Phone / WhatsApp
              <input
                name="phone"
                required
                placeholder="03xxxxxxxxx"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5"
              />
            </label>
            <label className="block text-sm md:col-span-2">
              Address
              <textarea
                name="address"
                required
                rows={3}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5"
              />
            </label>
            <label className="block text-sm md:col-span-2">
              City
              <input
                name="city"
                required
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5"
              />
            </label>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold">Payment method</legend>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border p-4">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "advance"}
                onChange={() => setPaymentMethod("advance")}
              />
              <span>
                <span className="font-semibold">Advance payment</span>
                <span className="mt-1 block text-sm text-muted">
                  Free nationwide delivery. We share JazzCash / EasyPaisa / bank details on WhatsApp.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border p-4">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              <span>
                <span className="font-semibold">
                  Cash on delivery (+ {formatPkr(COD_FEE_PKR)})
                </span>
                <span className="mt-1 block text-sm text-muted">
                  Pay the courier when your order arrives.
                </span>
              </span>
            </label>
          </fieldset>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={pending}>
            {pending ? "Placing order…" : `Place order · ${formatPkr(total)}`}
          </button>
        </form>

        <aside className="h-fit rounded-[2rem] border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold">Order summary</h2>
          <ul className="mt-4 space-y-4">
            {lines.map((line) => (
              <li key={line.key} className="flex gap-3">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-background">
                  <Image
                    src={productImageSrc(line.image)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-semibold">{line.productName}</p>
                  <p className="text-muted">Qty {line.quantity}</p>
                  <p className="text-accent">
                    {formatPkr(line.unitPrice * line.quantity)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex gap-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Coupon code"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <button type="button" onClick={applyCoupon} className="btn-secondary px-4 py-2 text-sm">
              Apply
            </button>
          </div>
          {couponError && <p className="mt-2 text-xs text-danger">{couponError}</p>}

          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatPkr(cartSubtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-accent">
                <dt>Discount</dt>
                <dd>−{formatPkr(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted">COD fee</dt>
              <dd>{codFee ? formatPkr(codFee) : "—"}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatPkr(total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
