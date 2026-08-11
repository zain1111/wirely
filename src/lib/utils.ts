import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SITE_URL, WHATSAPP_NUMBER } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPkr(amount: number): string {
  return `Rs ${Math.round(amount).toLocaleString("en-PK")}`;
}

export function whatsappUrl(message: string): string {
  const text = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Maps legacy JPEG catalog paths to the regenerated WebP assets. */
const PRODUCT_IMAGE_ALIASES: Record<string, string> = {
  "/products/40w-charger.jpeg": "/products/40w-charger.webp",
  "/products/40w-charger-alt.jpeg": "/products/40w-charger.webp",
  "/products/cable.jpeg": "/products/cable.webp",
  "/products/airpods-pro-2.jpeg": "/products/airpods-pro-2.webp",
  "/products/airpods-pro-2-alt.jpeg": "/products/airpods-pro-2.webp",
  "/products/airpods-4.jpeg": "/products/airpods-4.webp",
  "/products/airpods-4-alt.jpeg": "/products/airpods-4.webp",
  "/products/combo-charger-cable.jpeg": "/products/combo-charger-cable.webp",
  "/products/40w-cable.jpeg": "/products/combo-charger-cable.webp",
};

export function productImageSrc(src: string): string {
  if (!src) return "/brand/logo.png";
  const normalized =
    src.startsWith("http") || src.startsWith("/") ? src : `/products/${src}`;
  return PRODUCT_IMAGE_ALIASES[normalized] ?? normalized;
}

export function cartLineKey(slug: string, variationId?: string | null): string {
  return variationId ? `${slug}#${variationId}` : slug;
}
