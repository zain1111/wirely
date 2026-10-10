"use client";

import { useMemo, useState } from "react";
import type { VerifiedModel } from "@/lib/product-pages";

export function CompatibilityList({ models }: { models: VerifiedModel[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return models;
    return models.filter((item) => item.model.toLowerCase().includes(needle));
  }, [models, query]);

  if (!models.length) return null;

  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold">
        Charging speed by phone
      </h2>
      <p className="mt-2 text-sm text-muted">
        Speeds are the maximum each phone can draw. Your cable and phone
        settings also affect the result.
      </p>
      <label className="mt-4 block text-sm">
        Check your phone
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a Galaxy model"
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5"
        />
      </label>
      <div className="mt-4 overflow-hidden rounded-md border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-background text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Model</th>
              <th className="px-4 py-2 font-medium">Max from this adapter</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.model} className="border-t border-border">
                <td className="px-4 py-2">{item.model}</td>
                <td className="px-4 py-2">{item.maxWatts}W</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-muted" colSpan={2}>
                  That model is not in the verified list.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
