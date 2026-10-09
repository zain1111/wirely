"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatPublicOrderNumber, whatsappUrl } from "@/lib/utils";

export function ThanksClient() {
  const params = useSearchParams();
  const order = formatPublicOrderNumber(params.get("order") || "");
  const advance = params.get("pay") === "advance";

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
          ? " We will get back to you shortly with payment details before we confirm your order."
          : " If you need any details about your order, please contact us on WhatsApp."}
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