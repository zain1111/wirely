import { STATIC_MODE } from "@/lib/config";

/** Always false in static mode so no code path opens a DB connection. */
export function hasSupabaseEnv(): boolean {
  if (STATIC_MODE) return false;
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function hasServiceRole(): boolean {
  if (STATIC_MODE) return false;
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
