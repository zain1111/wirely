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
    return new URL(candidate).origin;
  } catch {
    return fallback;
  }
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923431143434";

export const COD_FEE_PKR = Number(process.env.NEXT_PUBLIC_COD_FEE_PKR || 299);

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "";

export const TRUST_POINTS = [
  {
    title: "100% Authentic",
    body: "Genuine Apple-grade chargers, cables, and AirPods — no compromises.",
  },
  {
    title: "Free Nationwide Delivery",
    body: "Advance payment orders ship free across Pakistan in 2–4 days.",
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
    a: "Yes — advance payment orders include free nationwide delivery. Cash on delivery adds a small Rs 299 handling fee.",
  },
  {
    q: "Are products original?",
    a: "We sell high-quality, authentic Apple-compatible accessories. Every listing is checked before it ships.",
  },
  {
    q: "Can I pay cash on delivery?",
    a: "Absolutely. Choose COD at checkout. A Rs 299 fee applies to cover courier cash handling.",
  },
  {
    q: "What if I need help after ordering?",
    a: "Message us on WhatsApp anytime. We confirm orders, share payment details, and help with returns.",
  },
] as const;
