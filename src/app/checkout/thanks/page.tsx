import type { Metadata } from "next";
import { Suspense } from "react";
import { ThanksClient } from "@/components/checkout/ThanksClient";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

export default function ThanksPage() {
  return (
    <Suspense fallback={<div className="container-wirely py-20">Loading…</div>}>
      <ThanksClient />
    </Suspense>
  );
}
