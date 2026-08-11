import Link from "next/link";
import type { ReactNode } from "react";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#eef2f5]">
      <div className="border-b border-border bg-card">
        <div className="container-wirely flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="font-display text-xl font-bold">Wirely Admin</p>
            <p className="text-xs text-muted">Manage catalog, orders & content</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:border-accent"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/"
              className="rounded-full bg-graphite px-3 py-1.5 text-xs font-semibold text-white"
            >
              View store
            </Link>
          </div>
        </div>
      </div>
      <div className="container-wirely py-8">{children}</div>
    </div>
  );
}
