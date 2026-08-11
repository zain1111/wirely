"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/#why-us", label: "Why Us" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#faq", label: "FAQ" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const lines = useCart((s) => s.lines);
  const openCart = useCart((s) => s.openCart);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <header className="glass sticky top-0 z-40 border-b border-border/80">
      <div className="container-wirely flex h-16 items-center justify-between gap-4 md:h-18">
        <Link href="/" className="flex items-center gap-2" aria-label="Wirely home">
          <Image
            src="/brand/logo.png"
            alt="Wirely"
            width={140}
            height={40}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
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
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card md:hidden"
            onClick={() => setOpen((v) => !v)}
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
