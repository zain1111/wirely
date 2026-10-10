"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { deliveryFeePkr } from "@/lib/constants";
import { captureAttribution, isAdLanding } from "@/lib/attribution";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";

const links = [
  { href: "/shop?category=charging", label: "Chargers" },
  { href: "/shop?category=cables", label: "Cables" },
  { href: "/#find-your-fit", label: "Shop by device" },
  { href: "/#faq", label: "Help & delivery" },
];

const RESERVED = new Set([
  "shop",
  "checkout",
  "shipping",
  "returns",
  "privacy",
  "terms",
  "admin",
]);

export function Header() {
  const [open, setOpen] = useState(false);
  const [adLanding, setAdLanding] = useState(false);
  const pathname = usePathname();
  const search = useSearchParams();
  const lines = useCart((s) => s.lines);
  const openCart = useCart((s) => s.openCart);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const segment = pathname.split("/").filter(Boolean)[0] || "";
  const isProduct = Boolean(segment) && !RESERVED.has(segment) && !pathname.startsWith("/admin");
  const minimal = adLanding && isProduct;
  const freeForAll =
    deliveryFeePkr("advance") === 0 && deliveryFeePkr("cod") === 0;

  useEffect(() => {
    const query = search.toString();
    captureAttribution(query ? `?${query}` : "");
    setAdLanding(isAdLanding());
  }, [pathname, search]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white">{!minimal && <div className="bg-graphite px-4 py-2 text-center text-[10px] tracking-wide text-white sm:text-xs">{freeForAll ? "Free delivery on every order" : "Free delivery on advance orders"} <span className="mx-3 text-white/40">|</span> Cash on delivery available across Pakistan</div>}
      <div className="container-wirely flex h-16 items-center justify-between gap-4 md:h-18">
        <Link href="/" className="flex items-center gap-2" aria-label="Wirely home">
          <Image
            src="/brand/logo.png"
            alt="Wirely"
            width={140}
            height={40}
            className="h-12 w-12 object-contain md:h-14 md:w-14"
            priority />

        </Link>

        <nav className={cn("hidden items-center gap-7 md:flex", minimal && "md:hidden")} aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative text-sm font-medium text-muted transition hover:text-foreground"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 rounded-full bg-accent transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className={cn("inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card md:hidden", minimal && "hidden")}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "border-t border-border bg-card md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="container-wirely flex flex-col gap-1 py-3" aria-label="Mobile">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-accent-soft"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
