"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { COD_FEE_PKR } from "@/lib/constants";
import { formatPkr } from "@/lib/utils";

export function ThanksClient() {
  const params = useSearchParams();
  const order = params.get("order") || "—";
  const total = Number(params.get("total") || 0);
  const pay = params.get("pay") || "advance";
  const email = params.get("email") || "";
  const emailSent = params.get("sent") !== "0";

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
          : " A representative will contact you shortly with advance payment details."}
      </p>

      <div className="mx-auto mt-8 max-w-md rounded-2xl border border-border bg-card p-6 text-left">
        <p className="text-sm font-semibold text-foreground">
          {emailSent ? "Confirmation email sent" : "Check your inbox"}
        </p>
        {email ? (
          <p className="mt-2 text-sm text-muted">
            {emailSent ? (
              <>
                We sent order details to{" "}
                <strong className="text-foreground">{email}</strong>. Check your
                inbox (and spam folder) for next steps.
              </>
            ) : (
              <>
                We couldn&apos;t send email to{" "}
                <strong className="text-foreground">{email}</strong> right now.
                Our team will still follow up using your phone number.
              </>
            )}
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted">
            You&apos;ll receive an order confirmation email shortly with full
            details and what happens next.
          </p>
        )}
      </div>

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
