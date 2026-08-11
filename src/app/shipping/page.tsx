import type { Metadata } from "next";
import { COD_FEE_PKR } from "@/lib/constants";
import { formatPkr } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shipping",
  description:
    "Wirely ships Apple accessories across Pakistan in 2–4 days. Free delivery on advance payment.",
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  return (
    <article className="container-wirely prose-wirely py-16 md:py-20">
      <h1 className="font-display text-4xl font-bold">Shipping</h1>
      <div className="mt-6 max-w-2xl space-y-4 text-muted">
        <p>
          We deliver nationwide across Pakistan. Most orders arrive within 2–4
          working days after confirmation.
        </p>
        <p>
          <strong className="text-foreground">Advance payment:</strong> delivery
          is free.
        </p>
        <p>
          <strong className="text-foreground">Cash on delivery:</strong> a{" "}
          {formatPkr(COD_FEE_PKR)} courier handling fee applies.
        </p>
        <p>
          After you place an order, our team confirms details and tracking on
          WhatsApp.
        </p>
      </div>
    </article>
  );
}
