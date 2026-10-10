export type ReviewSubject = "adapter" | "cable" | "bundle" | "general";

export type CustomerReview = {
  id: string;
  name: string;
  /** TODO: [FILL IN] city when the customer message includes one. */
  city: string | null;
  quote: string;
  image: string;
  /**
   * Set only when the customer stated a score.
   * Saqib wrote "10/10", stored here as 5 stars.
   */
  rating: number | null;
  /** True only for an order we can match. Screenshot messages stay false. */
  verifiedPurchase: boolean;
  slugs: string[];
  subject: ReviewSubject;
};

export const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: "husnain-40w",
    name: "Husnain",
    city: null,
    quote:
      "Amazing charger. 10/10 experience, 100% recommended for iPhone users.",
    image: "/reviews/husnain-40w.jpg",
    rating: 5,
    verifiedPurchase: false,
    slugs: ["40w-charger", "charger-cable-combo"],
    subject: "adapter",
  },
  {
    id: "charger-floral",
    name: "Husnain",
    city: null,
    quote:
      "The 40W adapter arrived exactly as shown. Fast charging, and I’d recommend it for iPhone.",
    image: "/reviews/charger-floral.jpg",
    rating: null,
    verifiedPurchase: false,
    slugs: ["40w-charger"],
    subject: "adapter",
  },
  {
    id: "saqib-45w",
    name: "Saqib",
    city: null,
    quote:
      "The Super Fast Charger 2.0 works perfectly with my Samsung S26 Ultra. Charging is very fast, and the quality feels excellent. 10/10 — I highly recommend Wirely.",
    image: "/reviews/saqib-45w.jpg",
    rating: 5,
    verifiedPurchase: false,
    slugs: ["samsung-usb-c-charger"],
    subject: "adapter",
  },
  {
    id: "saqib-fast",
    name: "Saqib",
    city: null,
    quote: "Super fast. I checked it — it fits, and there was no problem.",
    image: "/reviews/saqib-fast.jpg",
    rating: null,
    verifiedPurchase: false,
    slugs: ["samsung-usb-c-charger"],
    subject: "adapter",
  },
  {
    id: "samsung-black",
    name: "Customer",
    city: null,
    quote:
      "The quality of the wire and connector is good. I like the black colour — it needs less cleaning than white.",
    image: "/reviews/samsung-black.jpg",
    rating: null,
    verifiedPurchase: false,
    slugs: ["samsung-usb-c-charger", "usb-c-cable"],
    subject: "cable",
  },
  {
    id: "cable-tabby",
    name: "Tabby",
    city: null,
    quote:
      "Bought this cable yesterday. It is genuinely so good — my phone went to 80% in about 40 minutes. Thank you for the fast delivery.",
    image: "/reviews/cable-tabby.jpg",
    rating: null,
    verifiedPurchase: false,
    slugs: ["usb-c-cable", "charger-cable-combo"],
    subject: "cable",
  },
  {
    id: "combo-grass",
    name: "Customer",
    city: null,
    quote:
      "40W adapter and USB-C cable, ready to use. Customers keep sending photos after their orders arrive.",
    image: "/reviews/combo-grass.jpg",
    rating: null,
    verifiedPurchase: false,
    slugs: ["charger-cable-combo", "40w-charger", "usb-c-cable"],
    subject: "bundle",
  },
];

const CABLE_MENTION = /\b(cable|wire|connector)\b/i;

export type DisplayReview = {
  id: string;
  name: string;
  city: string | null;
  quote: string;
  image: string | null;
  rating: number | null;
  verifiedPurchase: boolean;
};

function rank(review: DisplayReview): number {
  return (review.rating != null ? 1000 : 0) + review.quote.length;
}

function dedupe(reviews: DisplayReview[]): DisplayReview[] {
  const byName = new Map<string, DisplayReview>();
  for (const review of reviews) {
    const key = review.name.trim().toLowerCase();
    const prev = byName.get(key);
    if (!prev || rank(review) > rank(prev)) byName.set(key, review);
  }
  return [...byName.values()];
}

export function reviewsForSlug(
  slug: string,
  opts?: { adapterOnly?: boolean },
): CustomerReview[] {
  return CUSTOMER_REVIEWS.filter((review) => {
    if (!review.slugs.includes(slug)) return false;
    if (opts?.adapterOnly && review.subject === "cable") return false;
    if (opts?.adapterOnly && CABLE_MENTION.test(review.quote) && review.subject !== "adapter") {
      return false;
    }
    return true;
  });
}

export function displayReviewsForProduct(
  slug: string,
  adapterOnly: boolean,
  approved: {
    id: string;
    reviewer_name: string;
    rating: number;
    body: string;
    images_json?: string[] | null;
  }[] = [],
): DisplayReview[] {
  const screenshots: DisplayReview[] = reviewsForSlug(slug, {
    adapterOnly,
  })
    .filter((review) => !(adapterOnly && CABLE_MENTION.test(review.quote) && review.subject === "cable"))
    .map((review) => ({
      id: review.id,
      name: review.name,
      city: review.city,
      quote: review.quote,
      image: review.image,
      rating: review.rating,
      verifiedPurchase: review.verifiedPurchase,
    }));

  const fromDb: DisplayReview[] = approved
    .filter((review) => !(adapterOnly && CABLE_MENTION.test(review.body)))
    .map((review) => ({
      id: review.id,
      name: review.reviewer_name,
      city: null,
      quote: review.body,
      image: review.images_json?.[0] ?? null,
      rating: review.rating,
      verifiedPurchase: false,
    }));

  return dedupe([...screenshots, ...fromDb]);
}

export function reviewSummary(reviews: DisplayReview[]): {
  average: number;
  count: number;
} | null {
  const rated = reviews.filter(
    (review) =>
      review.rating != null && review.rating >= 1 && review.rating <= 5,
  );
  if (!rated.length) return null;
  const average =
    rated.reduce((sum, review) => sum + (review.rating ?? 0), 0) / rated.length;
  return { average, count: rated.length };
}
