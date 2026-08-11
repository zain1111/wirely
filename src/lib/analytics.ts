"use client";

import { GA_ID, GOOGLE_ADS_ID } from "./constants";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(
  name: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params ?? {});
}

export function trackAddToCart(item: {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
}): void {
  trackEvent("add_to_cart", {
    currency: "PKR",
    value: item.price * item.quantity,
    items: [item],
  });
}

export function trackBeginCheckout(value: number, items: unknown[]): void {
  trackEvent("begin_checkout", { currency: "PKR", value, items });
}

export function trackPurchase(order: {
  transaction_id: string;
  value: number;
  items: unknown[];
}): void {
  trackEvent("purchase", {
    transaction_id: order.transaction_id,
    currency: "PKR",
    value: order.value,
    items: order.items,
  });
  if (GOOGLE_ADS_ID) {
    trackEvent("conversion", {
      send_to: `${GOOGLE_ADS_ID}/purchase`,
      value: order.value,
      currency: "PKR",
      transaction_id: order.transaction_id,
    });
  }
}

export function trackWhatsAppContact(): void {
  trackEvent("whatsapp_contact");
  if (GOOGLE_ADS_ID) {
    trackEvent("conversion", { send_to: `${GOOGLE_ADS_ID}/whatsapp` });
  }
}

export function analyticsEnabled(): boolean {
  return Boolean(GA_ID);
}
