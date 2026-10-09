import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, WHATSAPP_NUMBER } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Wirely collects, uses, and protects your name, phone, email, and delivery address when you place an order.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="container-wirely py-16 md:py-20">
      <h1 className="font-display text-4xl font-bold">Privacy policy</h1>
      <p className="mt-3 text-sm text-muted">Last updated: 9 October 2026</p>
      <div className="mt-6 max-w-2xl space-y-4 text-muted">
        <p>
          {SITE_NAME} (“we”) sells charging accessories in Pakistan through
          wire-ly.shop. This page explains what we collect when you browse or
          place an order, and how we use it.
        </p>
        <h2 className="pt-2 font-display text-2xl font-semibold text-foreground">
          What we collect
        </h2>
        <p>When you check out, we store:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Your name, phone number, and email address</li>
          <li>Delivery address and city</li>
          <li>The products, quantities, and payment method you chose</li>
          <li>Messages you send us on WhatsApp about an order</li>
        </ul>
        <p>
          If you write a product review, we store the name, email, rating, and
          text you submit. Reviews stay hidden until we approve them.
        </p>
        <h2 className="pt-2 font-display text-2xl font-semibold text-foreground">
          How we use it
        </h2>
        <p>
          We use this information to confirm your order, share payment details
          when you choose advance payment, arrange delivery, handle returns, and
          reply if you contact us. We do not sell your details to other
          companies.
        </p>
        <h2 className="pt-2 font-display text-2xl font-semibold text-foreground">
          Payments
        </h2>
        <p>
          Advance orders are confirmed after we share payment instructions and
          receive payment. We do not store your card, JazzCash, or EasyPaisa
          PIN on this website. Cash on delivery is collected by the courier.
        </p>
        <h2 className="pt-2 font-display text-2xl font-semibold text-foreground">
          Analytics
        </h2>
        <p>
          The site may use Google Analytics to understand which pages are
          visited. That can include a browser identifier and pages viewed. You
          can limit cookies in your browser settings.
        </p>
        <h2 className="pt-2 font-display text-2xl font-semibold text-foreground">
          How long we keep orders
        </h2>
        <p>
          We keep order records so we can deliver, support returns, and answer
          questions about a purchase. You can ask us to update or delete your
          contact details when they are no longer needed for an open order.
        </p>
        <h2 className="pt-2 font-display text-2xl font-semibold text-foreground">
          Contact
        </h2>
        <p>
          For a privacy request, message us on WhatsApp at +{WHATSAPP_NUMBER}{" "}
          and include your order number. You can also read our{" "}
          <Link href="/terms" className="text-accent underline">
            terms and conditions
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
