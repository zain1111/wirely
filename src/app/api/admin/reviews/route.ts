import { NextResponse } from "next/server";
import { hasServiceRole } from "@/lib/supabase/env";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  try {
    if (!hasServiceRole()) {
      return NextResponse.json(
        { error: "Supabase service role not configured." },
        { status: 503 },
      );
    }

    const supabaseAuth = await createClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = createServiceClient();
    const { data: profile } = await service
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as {
      id?: string;
      status?: "approved" | "rejected";
    };
    if (!body.id || !body.status) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { error } = await service
      .from("product_reviews")
      .update({ status: body.status })
      .eq("id", body.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
