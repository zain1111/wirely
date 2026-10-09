import { createClient, createServiceClient } from "@/lib/supabase/server";
import { hasServiceRole } from "@/lib/supabase/env";

export async function requireAdmin() {
  const session = await createClient();
  const {
    data: { user },
  } = await session.auth.getUser();

  if (!user) {
    return { ok: false as const, status: 401, error: "Unauthorized — please sign in again." };
  }

  // Prefer reading own profile via the signed-in session (RLS allows that).
  let role: string | null = null;
  const { data: ownProfile } = await session
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  role = ownProfile?.role ?? null;

  // Fallback for odd RLS setups
  if (role !== "admin" && hasServiceRole()) {
    const service = createServiceClient();
    const { data: profile } = await service
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = profile?.role ?? null;
  }

  if (role !== "admin") {
    return {
      ok: false as const,
      status: 403,
      error:
        "Forbidden — set profiles.role = 'admin' for your user in Supabase Table Editor.",
    };
  }

  return {
    ok: true as const,
    user,
    /** Authenticated user client — subject to RLS, but auth.uid() is set */
    session,
    /** Elevated client when a valid service role key is configured */
    service: hasServiceRole() ? createServiceClient() : null,
  };
}
