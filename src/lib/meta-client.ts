"use client";

import { META_PIXEL_ID } from "@/lib/constants";
import { readAttribution } from "@/lib/attribution";

type MetaEvent =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase"
  | "Contact";

type Fbq = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded?: boolean;
  version?: string;
  push?: Fbq;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

const pageViews = new Set<string>();

function ensurePixel(): void {
  if (!META_PIXEL_ID || typeof window === "undefined") return;
  if (window.fbq) return;

  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as Fbq;
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.push = fbq;
  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);
  window.fbq("init", META_PIXEL_ID);
}

export function trackMeta(
  event: MetaEvent,
  custom: Record<string, unknown> = {},
  opts?: {
    onceKey?: string;
    user?: { phone?: string; name?: string; city?: string };
  },
): void {
  if (typeof window === "undefined") return;
  if (event === "PageView") {
    if (opts?.onceKey && pageViews.has(opts.onceKey)) return;
    if (opts?.onceKey) pageViews.add(opts.onceKey);
  } else if (opts?.onceKey && sessionStorage.getItem(opts.onceKey)) {
    return;
  }

  const eventId = crypto.randomUUID();
  if (event !== "PageView" && opts?.onceKey) {
    sessionStorage.setItem(opts.onceKey, eventId);
  }

  if (!META_PIXEL_ID) return;
  ensurePixel();
  window.fbq?.("track", event, custom, { eventID: eventId });

  void fetch("/api/meta/capi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      eventId,
      custom,
      user: opts?.user,
      sourceUrl: window.location.href,
      attribution: readAttribution(),
    }),
    keepalive: true,
  }).catch(() => undefined);
}
