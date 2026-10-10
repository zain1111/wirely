import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isPakistaniMobile } from "@/lib/phones";
import { hasServiceRole } from "@/lib/supabase/env";
import { createServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  productSlug: z.string().min(1),
  reviewerName: z.string().min(2).max(100),
  reviewerEmail: z.string().email(),
  rating: z.number().int().min(1).max(5),
  body: z.string().min(10).max(2000),
  phone: z.string().optional(),
  orderNumber: z.string().max(40).optional(),
  honeypot: z.string().optional(),
}).refine(
  (value) =>
    Boolean(value.orderNumber?.trim()) ||
    Boolean(value.phone && isPakistaniMobile(value.phone)),
  { message: "Add a phone number or an order number." },
);

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
      body: [
        parsed.data.orderNumber?.trim()
          ? `Order: ${parsed.data.orderNumber.trim()}`
          : "",
        parsed.data.phone?.trim() ? `Phone: ${parsed.data.phone.trim()}` : "",
        parsed.data.body,
      ]
        .filter(Boolean)
        .join("\n"),
      status: "pending",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/admin/reviews");
    revalidatePath(`/${parsed.data.productSlug}`);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not submit review." }, { status: 500 });
  }
}
