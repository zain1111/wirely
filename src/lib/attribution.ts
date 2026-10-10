export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  fbp?: string;
  fbc?: string;
};

const STORAGE_KEY = "wirely-attribution";
const AD_KEY = "wirely-ad-landing";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
] as const;

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function readAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}

export function captureAttribution(search = ""): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(search || window.location.search);
  const current = readAttribution();
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) current[key] = value.slice(0, 200);
  }
  const fbp = readCookie("_fbp");
  const fbc = readCookie("_fbc");
  if (fbp) current.fbp = fbp;
  if (fbc) current.fbc = fbc;
  else if (current.fbclid && !current.fbc) {
    current.fbc = `fb.1.${Date.now()}.${current.fbclid}`;
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));

  const source = (params.get("utm_source") || "").toLowerCase();
  if (
    source === "facebook" ||
    source === "instagram" ||
    source === "meta" ||
    params.has("fbclid")
  ) {
    sessionStorage.setItem(AD_KEY, "1");
  }
}

export function isAdLanding(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(AD_KEY) === "1";
}
