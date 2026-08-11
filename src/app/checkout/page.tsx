import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure Wirely checkout — advance payment or cash on delivery across Pakistan.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/checkout" },
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}
