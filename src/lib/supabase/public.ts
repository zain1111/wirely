import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cookie-less anon client for public catalog reads.
 * Unlike the cookie-bound server client, this does not opt the route into
 * dynamic rendering, so pages using it can be statically generated and cached.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
