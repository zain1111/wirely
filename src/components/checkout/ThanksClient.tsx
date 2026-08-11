"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { COD_FEE_PKR } from "@/lib/constants";
import { formatPkr, whatsappUrl } from "@/lib/utils";

export function ThanksClient() {
  const params = useSearchParams();
  const order = params.get("order") || "—";
  const total = Number(params.get("total") || 0);
  const pay = params.get("pay") || "advance";
  const wa = params.get("wa") || `Hi Wirely! I placed order #${order}.`;

  return (
    <div className="container-wirely py-16 text-center md:py-24">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
        Order confirmed
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold">Thank you!</h1>
      <p className="mx-auto mt-4 max-w-xl text-muted">
        Order <strong className="text-foreground">#{order}</strong> for{" "}
        <strong className="text-foreground">{formatPkr(total)}</strong> is in.
        {pay === "cod"
          ? ` Prepare ${formatPkr(total)} for the courier (includes ${formatPkr(COD_FEE_PKR)} COD fee).`
          : " We’ll share advance payment details on WhatsApp shortly."}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a
          href={whatsappUrl(wa)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          Confirm on WhatsApp
        </a>
        <Link href="/#shop" className="btn-secondary">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
