"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";

export function StoreShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsAppFab />
    </>
  );
}
