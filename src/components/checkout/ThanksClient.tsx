"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatPublicOrderNumber } from "@/lib/utils";

export function ThanksClient() {
  const params = useSearchParams();
  const order = formatPublicOrderNumber(params.get("order") || "");

  return (
    <div className="container-wirely py-16 text-center md:py-24">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
        Order confirmed
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold">Thank you!</h1>
      <p className="mx-auto mt-4 max-w-xl text-muted">
        Your order number is{" "}
        <strong className="text-foreground">{order}</strong>.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/shop" className="btn-primary">
          Continue shopping
        </Link>
        <Link href="/" className="btn-secondary">
          Back to home
        </Link>
      </div>
    </div>
  );
}