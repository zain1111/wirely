import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns",
  description:
    "Wirely offers a 7-day easy return window on Apple accessories. Contact us on WhatsApp to start a return.",
  alternates: { canonical: "/returns" },
};

export default function ReturnsPage() {
  return (
    <article className="container-wirely py-16 md:py-20">
      <h1 className="font-display text-4xl font-bold">Returns</h1>
      <div className="mt-6 max-w-2xl space-y-4 text-muted">
        <p>
          Changed your mind? You have 7 days from delivery to request a return
          for unused products in original packaging.
        </p>
        <p>
          Message us on WhatsApp with your order number and we’ll guide you
          through the process.
        </p>
        <p>
          Defective items are replaced or refunded after a quick verification —
          your satisfaction matters.
        </p>
      </div>
    </article>
  );
}
