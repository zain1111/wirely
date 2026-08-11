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

export function productImageSrc(src: string): string {
  if (!src) return "/brand/logo.png";
  if (src.startsWith("http") || src.startsWith("/")) return src;
  return `/products/${src}`;
}

export function cartLineKey(slug: string, variationId?: string | null): string {
  return variationId ? `${slug}#${variationId}` : slug;
}
