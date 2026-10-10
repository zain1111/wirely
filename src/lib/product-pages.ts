import {
  DELIVERY_WINDOW,
  RETURN_TERMS,
  deliveryFeePkr,
  deliverySummary,
} from "@/lib/constants";
import type { Product } from "@/lib/types";

export type VerifiedModel = {
  model: string;
  /** Maximum watts Samsung documents for this phone from a USB-C PD source. */
  maxWatts: number;
};

export type ProductPageConfig = {
  slug: string;
  metaTitle: string;
  /** `{colors}` is replaced with variation labels when they exist. */
  metaDescription: string;
  subhead: string;
  omitPhrases: string[];
  /**
   * TODO: [FILL IN] model list + speeds, verified against Samsung specs.
   * Leave empty until each wattage is checked. Empty data is not shown on the live page.
   */
  compatibility: VerifiedModel[];
  box: string[];
  /** Only facts already stated on the listing. Do not add electrical specs here. */
  specs: { label: string; value: string }[];
  returns: string;
  bundle: {
    title: string;
    /**
     * TODO: [FILL IN] bundle price in PKR.
     * Null hides the upgrade on the live page.
     */
    pricePkr: number | null;
    cableSlug: string;
  } | null;
  /** Hidden from "Complete your setup" until the price is confirmed. */
  hideRelatedSlugs: string[];
  /**
   * TODO: [FILL IN] public MP4 path, for example /products/samsung-45w.mp4
   * Null hides the video slide.
   */
  videoSrc: string | null;
  mediaTodos: string[];
  adapterOnly: boolean;
};

export const PRODUCT_PAGES: ProductPageConfig[] = [
  {
    slug: "samsung-usb-c-charger",
    metaTitle: "45W Samsung USB-C Charger Pakistan COD",
    metaDescription:
      "45W Samsung USB-C charger in Pakistan. Adapter only{colors}. {delivery}",
    subhead: `Delivered in ${DELIVERY_WINDOW}. Cash on delivery available.`,
    omitPhrases: [
      "compatible with all samsung devices, especially flagship phones",
      "our charger is compatible with all samsung devices, especially flagship phones",
      "ask us to confirm support for your exact model",
      "ask us to confirm availability and compatibility with your galaxy model before ordering",
      "confirm your phone model before ordering",
    ],
    compatibility: [],
    box: ["USB-C charging adapter"],
    specs: [
      { label: "Connection", value: "USB-C" },
      { label: "Plug", value: "Two-pin round" },
      { label: "Cable", value: "Not included" },
    ],
    returns: RETURN_TERMS,
    bundle: {
      title: "45W Charger + 1m USB-C Cable",
      pricePkr: null,
      cableSlug: "usb-c-cable",
    },
    hideRelatedSlugs: ["charger-cable-combo"],
    videoSrc: null,
    mediaTodos: [
      "TODO: [FILL IN] Confirm the Samsung gallery files are photographs. Replace any AI-generated file in the product image list: /products/samsung-packaging-catalog-v2.png, /products/samsung-adapters-gallery.png.",
      "TODO: [FILL IN] Add a 1:1 or 1.91:1 crop of a real product photo if the current first image is the wrong shape for ads.",
      "TODO: [FILL IN] PD/PPS output, dimensions, weight, and protection features.",
      "TODO: [FILL IN] Upload an MP4 and set videoSrc.",
      "TODO: [FILL IN] Bundle price for 45W Charger + 1m USB-C Cable.",
    ],
    adapterOnly: true,
  },
];

export function getProductPage(slug: string): ProductPageConfig | null {
  return PRODUCT_PAGES.find((page) => page.slug === slug) ?? null;
}

export function stripListedPhrases(text: string, phrases: string[]): string {
  let next = text;
  for (const phrase of phrases) {
    const pattern = new RegExp(
      phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "ig",
    );
    next = next.replace(pattern, "");
  }
  return next
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,])/g, "$1")
    .replace(/\.\s*\./g, ".")
    .trim();
}

export function pageMeta(
  product: Product,
): { title: string; description: string } | null {
  const page = getProductPage(product.slug);
  if (!page) return null;
  const colors = (product.variations ?? [])
    .filter((item) => item.is_active !== false && item.label)
    .map((item) => item.label);
  const colorBit = colors.length ? `, ${colors.join(" or ")}` : "";
  const description = page.metaDescription
    .replace("{colors}", colorBit)
    .replace("{delivery}", deliverySummary())
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 155);
  return { title: page.metaTitle, description };
}

export function productFaqs(config: ProductPageConfig | null): {
  q: string;
  a: string;
}[] {
  const cod = deliveryFeePkr("cod");
  const advance = deliveryFeePkr("advance");
  const faqs: { q: string; a: string }[] = [];

  if (config && config.compatibility.length > 0) {
    const full = config.compatibility.filter((item) => item.maxWatts >= 45);
    const limited = config.compatibility.filter((item) => item.maxWatts < 45);
    const fullText = full.length
      ? `${full.map((item) => item.model).join(", ")} can draw up to 45W.`
      : "None of the verified models are listed at 45W.";
    const limitedText = limited
      .map((item) => `${item.model} charges at up to ${item.maxWatts}W.`)
      .join(" ");
    faqs.push({
      q: "Which phones get 45W?",
      a: `${fullText} ${limitedText}`.trim(),
    });
  }

  if (config?.adapterOnly) {
    faqs.push({
      q: "Is a cable included?",
      a: "No. This listing is the adapter only. A USB-C cable is sold separately.",
    });
  }

  faqs.push({
    q: "How does cash on delivery work?",
    a:
      cod === 0
        ? "Choose cash on delivery at checkout and pay the courier when the parcel arrives. No extra delivery fee is added."
        : `Choose cash on delivery at checkout and pay the courier when the parcel arrives. A Rs ${cod.toLocaleString("en-PK")} handling fee is added before you confirm.`,
  });

  faqs.push({
    q: "How do returns work?",
    a: config?.returns || RETURN_TERMS,
  });

  faqs.push({
    q: "Is delivery free?",
    a:
      advance === 0 && cod === 0
        ? "Yes. Delivery is free on advance payment and on cash on delivery."
        : advance === 0
          ? `Advance payment includes free delivery. Cash on delivery adds Rs ${cod.toLocaleString("en-PK")}. Orders usually arrive in ${DELIVERY_WINDOW}.`
          : `Advance payment delivery is Rs ${advance.toLocaleString("en-PK")}. Cash on delivery is Rs ${cod.toLocaleString("en-PK")}.`,
  });

  return faqs;
}
