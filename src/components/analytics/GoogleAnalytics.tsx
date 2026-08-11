import Script from "next/script";
import { GA_ID, GOOGLE_ADS_ID } from "@/lib/constants";

export function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
          ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ""}
        `}
      </Script>
    </>
  );
}
