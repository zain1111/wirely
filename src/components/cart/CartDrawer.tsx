"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPkr, productImageSrc } from "@/lib/utils";

export function CartDrawer() {
  const lines = useCart((s) => s.lines);
  const isOpen = useCart((s) => s.isOpen);
  const closeCart = useCart((s) => s.closeCart);
  const updateQty = useCart((s) => s.updateQty);
  const removeItem = useCart((s) => s.removeItem);
  const total = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-graphite/40 transition ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden={!isOpen}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-card shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-xl font-semibold">Your cart</h2>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full p-2 hover:bg-background"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <p className="text-sm text-muted">
              Your cart is empty. Pick a charger, cable, or AirPods to get started.
            </p>
          ) : (
            <ul className="space-y-4">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-3 border-b border-border pb-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-background">
                    <Image
                      src={productImageSrc(line.image)}
                      alt={line.productName}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{line.productName}</p>
                    {line.variationLabel && (
                      <p className="text-xs text-muted">{line.variationLabel}</p>
                    )}
                    <p className="mt-1 text-sm text-accent">
                      {formatPkr(line.unitPrice)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-full border border-border p-1"
                        onClick={() => updateQty(line.key, line.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-6 text-center text-sm">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        className="rounded-full border border-border p-1"
                        onClick={() => updateQty(line.key, line.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="ml-auto text-xs text-muted underline"
                        onClick={() => removeItem(line.key)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border px-5 py-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="font-semibold">{formatPkr(total)}</span>
          </div>
          <Link
            href="/checkout"
            onClick={closeCart}
            className={`btn-primary w-full ${
              lines.length === 0 ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Checkout
          </Link>
          <p className="mt-2 text-center text-xs text-muted">
            Free delivery on advance payment · COD + Rs 299
          </p>
        </div>
      </aside>
    </>
  );
}
