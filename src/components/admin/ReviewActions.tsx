"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReviewActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function update(status: "approved" | "rejected") {
    setPending(true);
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => update("approved")}
        className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white"
      >
        Approve
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => update("rejected")}
        className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
      >
        Reject
      </button>
    </div>
  );
}
