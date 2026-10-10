import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { phoneDigits } from "@/lib/phones";

const EVENTS = new Set([
  "PageView",
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
  "Purchase",
  "Contact",
]);

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function hashName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim().toLowerCase().replace(/[^a-z\s]/g, "");
  return clean ? sha256(clean) : null;
}

function hashCity(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim().toLowerCase().replace(/[^a-z]/g, "");
  return clean ? sha256(clean) : null;
}

function hashPhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const digits = phoneDigits(value);
  if (!/^92\d{10}$/.test(digits)) return null;
  return sha256(digits);
}

export async function POST(request: Request) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) {
    return NextResponse.json({ skipped: true });
  }

  let body: {
    event?: string;
    eventId?: string;
    custom?: Record<string, unknown>;
    user?: { phone?: string; name?: string; city?: string };
    sourceUrl?: string;
    attribution?: { fbp?: string; fbc?: string };
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (!body.event || !EVENTS.has(body.event) || !body.eventId) {
    return NextResponse.json({ error: "Invalid event." }, { status: 400 });
  }

  const userData: Record<string, string | string[]> = {};
  const phone = hashPhone(body.user?.phone);
  const name = hashName(body.user?.name);
  const city = hashCity(body.user?.city);
  if (phone) userData.ph = [phone];
  if (name) userData.fn = [name];
  if (city) userData.ct = [city];
  if (body.attribution?.fbp) userData.fbp = body.attribution.fbp;
  if (body.attribution?.fbc) userData.fbc = body.attribution.fbc;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ua = request.headers.get("user-agent");
  if (ip) userData.client_ip_address = ip;
  if (ua) userData.client_user_agent = ua;

  const event = {
    event_name: body.event,
    event_time: Math.floor(Date.now() / 1000),
    event_id: body.eventId,
    action_source: "website",
    event_source_url: body.sourceUrl,
    user_data: userData,
    custom_data: {
      currency: "PKR",
      ...body.custom,
    },
  };

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [event] }),
    },
  );

  if (!res.ok) {
    return NextResponse.json({ ok: false }, { status: 202 });
  }
  return NextResponse.json({ ok: true });
}
