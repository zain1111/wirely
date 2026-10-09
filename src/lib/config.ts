/**
 * When true, catalog and admin are read-only from seed files (no Supabase).
 * Set WIRELY_STATIC_MODE=true to force static mode even with Supabase env vars.
 */
export const STATIC_MODE =
  process.env.WIRELY_STATIC_MODE === "true" ||
  process.env.NEXT_PUBLIC_WIRELY_STATIC_MODE === "true";
