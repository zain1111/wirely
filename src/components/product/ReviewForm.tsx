"use client";

import { FormEvent, useState } from "react";

export function ReviewForm({ productSlug }: { productSlug: string }) {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setStatus("idle");
    const form = new FormData(e.currentTarget);
    const payload = {
      productSlug,
      reviewerName: String(form.get("name") || ""),
      reviewerEmail: String(form.get("email") || ""),
      rating: Number(form.get("rating") || 5),
      body: String(form.get("body") || ""),
      honeypot: String(form.get("company") || ""),
    };

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Could not submit review.");
      } else {
        setStatus("ok");
        setMessage("Thanks! Your review is pending approval.");
        e.currentTarget.reset();
      }
    } catch {
      setStatus("error");
      setMessage("Could not submit review.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3 rounded-3xl border border-border bg-card p-5">
      <h3 className="font-display text-lg font-semibold">Write a review</h3>
      <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />
      <input
        name="name"
        required
        placeholder="Your name"
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
      />
      <select
        name="rating"
        defaultValue="5"
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
      >
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {n} stars
          </option>
        ))}
      </select>
      <textarea
        name="body"
        required
        minLength={10}
        rows={4}
        placeholder="How was your experience?"
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
      />
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Sending…" : "Submit review"}
      </button>
      {status !== "idle" && (
        <p className={`text-sm ${status === "ok" ? "text-accent" : "text-danger"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
