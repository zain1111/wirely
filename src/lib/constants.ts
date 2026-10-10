export const SITE_NAME = "Wirely";
export const SITE_TAGLINE = "Apple accessories, delivered across Pakistan";

/**
 * Tolerates malformed NEXT_PUBLIC_SITE_URL values (missing protocol,
 * whitespace, trailing slashes) — an invalid URL here would otherwise
 * crash `next build` via `new URL(SITE_URL)` in the root layout metadata.
 */
function normalizeSiteUrl(raw: string | undefined): string {
  const fallback = "https://wire-ly.shop";
  if (!raw?.trim()) return fallback;
  let candidate = raw.trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }
  try {
    const url = new URL(candidate);
    // Preview deploys must not become the canonical or Open Graph host.
    if (
      url.hostname.endsWith(".netlify.app") ||
      url.hostname.endsWith(".netlify.live")
    ) {
      return fallback;
    }
    return url.origin;
  } catch {
    return fallback;
  }
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923431143434";

export const COD_FEE_PKR = 0;

/** Pay-in-advance orders take this percent off the product subtotal. */
export const ADVANCE_DISCOUNT_PERCENT = 10;

export function deliveryFeePkr(_method: "advance" | "cod"): number {
  return 0;
}

export function advanceDiscountPkr(subtotal: number): number {
  const base = Math.max(0, Math.round(subtotal));
  return Math.round((base * ADVANCE_DISCOUNT_PERCENT) / 100);
}

function rs(amount: number): string {
  return `Rs ${Math.round(amount).toLocaleString("en-PK")}`;
}

export function deliverySummary(): string {
  return `Delivery is free. Pay in advance and get ${ADVANCE_DISCOUNT_PERCENT}% off.`;
}

/** Matches the published returns page. This is not a warranty term. */
export const RETURN_TERMS =
  "You can request a return within 7 days of delivery for unused products in their original packaging. Defective items are replaced or refunded after we verify them.";

export const DELIVERY_WINDOW = "2–4 working days";

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

export const PUBLIC_REVIEW_FORM =
  process.env.NEXT_PUBLIC_PUBLIC_REVIEW_FORM === "true";

export const ORDER_FROM_EMAIL =
  process.env.ORDER_FROM_EMAIL || "no-reply@wire-ly.shop";

export const ORDER_ADMIN_EMAIL =
  process.env.ORDER_ADMIN_EMAIL || "zainazeem2010@gmail.com";

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "";

export const TRUST_POINTS = [
  {
    title: "100% Authentic",
    body: "Genuine Apple-grade chargers, cables, and AirPods — no compromises.",
  },
  {
    title: "Free Nationwide Delivery",
    body: `Delivery is free. Pay in advance and get ${ADVANCE_DISCOUNT_PERCENT}% off. Orders arrive in 2–4 days.`,
  },
  {
    title: "7-Day Easy Returns",
    body: "Changed your mind? Hassle-free returns within seven days.",
  },
  {
    title: "WhatsApp Support 24/7",
    body: "Real humans on WhatsApp whenever you need help placing an order.",
  },
] as const;

export const MARKETING_REVIEWS = [
  {
    name: "Ahmed R.",
    text: "Got my AirPods Pro 2 delivered in 2 days. 100% original. Great service!",
    rating: 5,
  },
  {
    name: "Sara K.",
    text: "The 40W iPhone charger is a game-changer. My iPhone charges to 50% in about 30 minutes!",
    rating: 5,
  },
  {
    name: "Bilal M.",
    text: "Best place I found for a reliable iPhone charger and genuine AirPods. Highly recommend Wirely!",
    rating: 5,
  },
  {
    name: "Fatima A.",
    text: "USB-C cable quality is superb. Fast data transfer and durable build.",
    rating: 4,
  },
] as const;

export const FAQ_ITEMS = [
  {
    q: "How long does delivery take?",
    a: "Most orders arrive in 2–4 working days anywhere in Pakistan. You’ll get tracking updates on WhatsApp.",
  },
  {
    q: "Is delivery really free?",
    a: deliverySummary(),
  },
  {
    q: "Are products original?",
    a: "We sell high-quality, authentic Apple-compatible accessories. Every listing is checked before it ships.",
  },
  {
    q: "Can I pay cash on delivery?",
    a:
      deliveryFeePkr("cod") === 0
        ? "Yes. Choose cash on delivery at checkout. Delivery stays free."
        : `Yes. Choose cash on delivery at checkout. A ${rs(deliveryFeePkr("cod"))} fee applies to cover courier cash handling.`,
  },
  {
    q: "What if I need help after ordering?",
    a: "Message us on WhatsApp anytime. We confirm orders, share payment details, and help with returns.",
  },
] as const;
