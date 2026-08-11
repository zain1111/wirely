"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "completed",
  "cancelled",
];

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [pending, setPending] = useState(false);

  async function onChange(next: OrderStatus) {
    setValue(next);
    setPending(true);
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status: next }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => onChange(e.target.value as OrderStatus)}
      className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
