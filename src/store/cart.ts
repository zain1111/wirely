"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/lib/types";
import { cartLineKey } from "@/lib/utils";

type CartState = {
  lines: CartLine[];
  isOpen: boolean;
  couponCode: string | null;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (line: Omit<CartLine, "key" | "quantity"> & { quantity?: number }) => void;
  updateQty: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  setCouponCode: (code: string | null) => void;
  subtotal: () => number;
  itemCount: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      couponCode: null,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      addItem: (item) => {
        const key = cartLineKey(item.productSlug, item.variationId);
        const qty = item.quantity ?? 1;
        set((state) => {
          const existing = state.lines.find((l) => l.key === key);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.key === key
                  ? { ...l, quantity: l.quantity + qty }
                  : l,
              ),
              isOpen: true,
            };
          }
          return {
            lines: [
              ...state.lines,
              {
                key,
                productSlug: item.productSlug,
                productName: item.productName,
                variationId: item.variationId,
                variationLabel: item.variationLabel,
                unitPrice: item.unitPrice,
                quantity: qty,
                image: item.image,
              },
            ],
            isOpen: true,
          };
        });
      },
      updateQty: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key);
          return;
        }
        set((state) => ({
          lines: state.lines.map((l) =>
            l.key === key ? { ...l, quantity } : l,
          ),
        }));
      },
      removeItem: (key) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.key !== key),
        })),
      clearCart: () => set({ lines: [], couponCode: null }),
      setCouponCode: (code) => set({ couponCode: code }),
      subtotal: () =>
        get().lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0),
      itemCount: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
    }),
    {
      name: "wirely-cart-v1",
      partialize: (state) => ({
        lines: state.lines,
        couponCode: state.couponCode,
      }),
    },
  ),
);
