import { NextResponse } from "next/server";
import { z } from "zod";
import { hasServiceRole } from "@/lib/supabase/env";
import { createServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  productSlug: z.string().min(1),
  reviewerName: z.string().min(2).max(100),
  reviewerEmail: z.string().email(),
  rating: z.number().int().min(1).max(5),
  body: z.string().min(10).max(2000),
  honeypot: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid review." }, { status: 400 });
    }
    if (parsed.data.honeypot) {
      return NextResponse.json({ ok: true });
    }
    if (!hasServiceRole()) {
      return NextResponse.json(
        { error: "Reviews require Supabase configuration." },
        { status: 503 },
      );
    }

    const supabase = createServiceClient();
    const { error } = await supabase.from("product_reviews").insert({
      product_slug: parsed.data.productSlug,
      reviewer_name: parsed.data.reviewerName,
      reviewer_email: parsed.data.reviewerEmail,
      rating: parsed.data.rating,
      body: parsed.data.body,
      status: "pending",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not submit review." }, { status: 500 });
  }
}
