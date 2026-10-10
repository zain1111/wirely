import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, WHATSAPP_NUMBER, deliveryFeePkr } from "@/lib/constants";
import { formatPkr } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description:
    "Terms for ordering from Wirely: payments, delivery, stock, returns, and how we confirm an order.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <article className="container-wirely py-16 md:py-20">
      <h1 className="font-display text-4xl font-bold">Terms and conditions</h1>
      <p className="mt-3 text-sm text-muted">Last updated: 9 October 2026</p>
      <div className="mt-6 max-w-2xl space-y-4 text-muted">
        <p>
          These terms apply when you place an order on wire-ly.shop. By
          submitting checkout, you agree to them.
        </p>
        <h2 className="pt-2 font-display text-2xl font-semibold text-foreground">
          Orders
        </h2>
        <p>
          An order is a request to buy the products in your cart. We may
          contact you to confirm your phone number, address, and the items
          before we dispatch. If a product is unavailable, we will tell you and
          we will not charge you for that item.
        </p>
        <p>
          <strong className="text-foreground">Advance payment:</strong> we will
          contact you with payment details. The order is confirmed only after
          we receive payment.
        </p>
        <p>
          <strong className="text-foreground">Cash on delivery:</strong> you pay
          the courier when the parcel arrives.{" "}
          {deliveryFeePkr("cod") === 0
            ? "Delivery stays free."
            : `A ${formatPkr(deliveryFeePkr("cod"))} handling fee is added at checkout.`}{" "}
          Please keep the exact order total ready.
        </p>
        <h2 className="pt-2 font-display text-2xl font-semibold text-foreground">
          Prices and stock
        </h2>
        <p>
          Prices are in Pakistani rupees and are shown on the product page at
          the time you order. Stock counts on the site can change. If we cannot
          fulfil an item, we will contact you before shipping.
        </p>
        <h2 className="pt-2 font-display text-2xl font-semibold text-foreground">
          Delivery
        </h2>
        <p>
          We deliver across Pakistan. Most orders arrive in 2–4 working days
          after confirmation. Delivery times can vary with courier coverage and
          your city. See the{" "}
          <Link href="/shipping" className="text-accent underline">
            shipping page
          </Link>{" "}
          for the current rules.
        </p>
        <h2 className="pt-2 font-display text-2xl font-semibold text-foreground">
          Returns
        </h2>
        <p>
          Unused products in their original packaging can be returned within 7
          days of delivery. Message us on WhatsApp with your order number. The{" "}
          <Link href="/returns" className="text-accent underline">
            returns page
          </Link>{" "}
          explains the process.
        </p>
        <h2 className="pt-2 font-display text-2xl font-semibold text-foreground">
          Product fit
        </h2>
        <p>
          Charging speed and compatibility depend on your phone, adapter, and
          cable. Check the product page before you order. If you are unsure,
          ask us on WhatsApp with your phone model before paying.
        </p>
        <h2 className="pt-2 font-display text-2xl font-semibold text-foreground">
          Your details
        </h2>
        <p>
          You agree that the name, phone, email, and address you enter are
          accurate so we can deliver the order. How we handle that information
          is described in the{" "}
          <Link href="/privacy" className="text-accent underline">
            privacy policy
          </Link>
          .
        </p>
        <h2 className="pt-2 font-display text-2xl font-semibold text-foreground">
          Contact
        </h2>
        <p>
          {SITE_NAME} — WhatsApp +{WHATSAPP_NUMBER}. Website: wire-ly.shop.
        </p>
      </div>
    </article>
  );
}
