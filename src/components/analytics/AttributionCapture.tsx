"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";
import { trackMeta } from "@/lib/meta-client";

export function AttributionCapture() {
  const pathname = usePathname();
  const search = useSearchParams();
  const query = search.toString();

  useEffect(() => {
    captureAttribution(query ? `?${query}` : "");
    trackMeta("PageView", {}, { onceKey: `pageview:${pathname}?${query}` });
  }, [pathname, query]);

  return null;
}
