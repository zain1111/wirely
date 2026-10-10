"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { trackPurchase } from "@/lib/analytics";
import { trackMeta } from "@/lib/meta-client";
import { formatPublicOrderNumber, whatsappUrl } from "@/lib/utils";

export function ThanksClient() {
  const params = useSearchParams();
  const order = formatPublicOrderNumber(params.get("order") || "");
  const advance = params.get("pay") === "advance";
  const orderParam = params.get("order") || "";

  useEffect(() => {
    if (!orderParam) return;
    const raw = sessionStorage.getItem("wirely-pending-purchase");
    if (!raw) return;
    sessionStorage.removeItem("wirely-pending-purchase");
    try {
      const pending = JSON.parse(raw) as {
        orderNumber?: string;
        value?: number;
        content_ids?: string[];
        contents?: { id: string; quantity: number; item_price: number }[];
        phone?: string;
        name?: string;
        city?: string;
      };
      const value = Number(pending.value || params.get("total") || 0);
      trackPurchase({
        transaction_id: pending.orderNumber || order,
        value,
        items: (pending.contents ?? []).map((item) => ({
          item_id: item.id,
          item_name: item.id,
          price: item.item_price,
          quantity: item.quantity,
        })),
      });
      trackMeta(
        "Purchase",
        {
          content_ids: pending.content_ids ?? [],
          content_type: "product",
          contents: pending.contents ?? [],
          value,
          currency: "PKR",
        },
        {
          onceKey: `purchase:${pending.orderNumber || orderParam}`,
          user: {
            phone: pending.phone,
            name: pending.name,
            city: pending.city,
          },
        },
      );
    } catch {
      sessionStorage.removeItem("wirely-pending-purchase");
    }
  }, [order, orderParam, params]);

  return (
    <div className="container-wirely py-16 text-center md:py-24">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
        {advance ? "Order received" : "Order confirmed"}
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold">Thank you!</h1>
      <p className="mx-auto mt-4 max-w-xl text-muted">
        Your order number is{" "}
        <strong className="text-foreground">{order}</strong>.
        {advance
          ? " Your 10% advance discount is included. We will get back to you shortly with payment details before we confirm your order."
          : " Delivery is free. If you need any details about your order, please contact us on WhatsApp."}
      </p>
      {advance && (
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted">
          If you need any details about your order, please contact us on
          WhatsApp.
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a
          href={whatsappUrl(
            `Hi Wirely, I need details about my order ${order}.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          Contact us on WhatsApp
        </a>
        <Link href="/shop" className="btn-secondary">
          Continue shopping
        </Link>
        <Link href="/" className="btn-secondary">
          Back to home
        </Link>
      </div>
    </div>
  );
}