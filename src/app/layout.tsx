import type { Metadata } from "next";
import { Suspense } from "react";
import { AttributionCapture } from "@/components/analytics/AttributionCapture";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { StoreShell } from "@/components/layout/StoreShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";
import "./globals.css";



export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Chargers, USB-C Cables & Everyday Accessories | ${SITE_NAME} Pakistan`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Shop chargers, USB-C cables, and audio accessories in Pakistan. Free nationwide delivery on advance orders. Order from Wirely.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      "Everyday accessories with free nationwide delivery on advance orders and WhatsApp support.",
    images: [{ url: absoluteUrl("/products/40w-cable.jpeg") }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} Pakistan`,
    description: SITE_TAGLINE,
    images: [absoluteUrl("/products/40w-cable.jpeg")],
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/brand/logo.png"),
    sameAs: [],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        availableLanguage: ["English", "Urdu"],
      },
    ],
  };

  return (
    <html lang="en">
      <body className="antialiased">
        <GoogleAnalytics />
        <Suspense fallback={null}>
          <AttributionCapture />
        </Suspense>
        <JsonLd data={orgLd} />
        <StoreShell>{children}</StoreShell>
      </body>
    </html>
  );
}
