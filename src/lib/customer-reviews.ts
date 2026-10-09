export type CustomerReview = {
  id: string;
  name: string;
  quote: string;
  image: string;
  rating: number;
  /** Product slugs this review belongs on. Empty = homepage only. */
  slugs: string[];
};

export const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: "husnain-40w",
    name: "Husnain",
    quote:
      "Amazing charger. 10/10 experience, 100% recommended for iPhone users.",
    image: "/reviews/husnain-40w.jpg",
    rating: 5,
    slugs: ["40w-charger", "charger-cable-combo"],
  },
  {
    id: "charger-floral",
    name: "Husnain",
    quote:
      "The 40W adapter arrived exactly as shown. Fast charging, and I’d recommend it for iPhone.",
    image: "/reviews/charger-floral.jpg",
    rating: 5,
    slugs: ["40w-charger"],
  },
  {
    id: "saqib-45w",
    name: "Saqib",
    quote:
      "The Super Fast Charger 2.0 works perfectly with my Samsung S26 Ultra. Charging is very fast, and the quality feels excellent. 10/10 — I highly recommend Wirely.",
    image: "/reviews/saqib-45w.jpg",
    rating: 5,
    slugs: ["samsung-usb-c-charger"],
  },
  {
    id: "saqib-fast",
    name: "Saqib",
    quote: "Super fast. I checked it — it fits, and there was no problem.",
    image: "/reviews/saqib-fast.jpg",
    rating: 5,
    slugs: ["samsung-usb-c-charger"],
  },
  {
    id: "samsung-black",
    name: "Customer",
    quote:
      "The quality of the wire and connector is good. I like the black colour — it needs less cleaning than white.",
    image: "/reviews/samsung-black.jpg",
    rating: 5,
    slugs: ["samsung-usb-c-charger", "usb-c-cable"],
  },
  {
    id: "cable-tabby",
    name: "Tabby",
    quote:
      "Bought this cable yesterday. It is genuinely so good — my phone went to 80% in about 40 minutes. Thank you for the fast delivery.",
    image: "/reviews/cable-tabby.jpg",
    rating: 5,
    slugs: ["usb-c-cable", "charger-cable-combo"],
  },
  {
    id: "combo-grass",
    name: "Customer",
    quote:
      "40W adapter and USB-C cable, ready to use. Customers keep sending photos after their orders arrive.",
    image: "/reviews/combo-grass.jpg",
    rating: 5,
    slugs: ["charger-cable-combo", "40w-charger", "usb-c-cable"],
  },
];

export function reviewsForSlug(slug: string): CustomerReview[] {
  return CUSTOMER_REVIEWS.filter((review) => review.slugs.includes(slug));
}
