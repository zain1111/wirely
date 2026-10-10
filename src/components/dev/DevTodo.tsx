import type { ReactNode } from "react";

export function DevTodo({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <p className="mt-3 rounded-md border border-dashed border-amber-700/40 bg-amber-50 px-3 py-2 text-xs text-amber-950">
      {children}
    </p>
  );
}
