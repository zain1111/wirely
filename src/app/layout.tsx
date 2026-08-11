import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { StoreShell } from "@/components/layout/StoreShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `iPhone Charger, AirPods Pro 2 & Apple Accessories | ${SITE_NAME} Pakistan`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Buy authentic iPhone chargers, USB-C cables, and AirPods in Pakistan. Free nationwide delivery on advance orders. Order from Wirely.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      "Authentic Apple accessories with free nationwide delivery and WhatsApp support.",
    images: [{ url: absoluteUrl("/products/airpods-pro-2.jpeg") }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} Pakistan`,
    description: SITE_TAGLINE,
    images: [absoluteUrl("/products/airpods-pro-2.jpeg")],
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
      <body className={`${dmSans.variable} ${syne.variable} antialiased`}>
        <GoogleAnalytics />
        <JsonLd data={orgLd} />
        <StoreShell>{children}</StoreShell>
      </body>
    </html>
  );
}
