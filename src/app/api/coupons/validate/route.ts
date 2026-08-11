import { NextResponse } from "next/server";
import { computeDiscount, normalizeCouponCode } from "@/lib/coupons";
import { hasServiceRole } from "@/lib/supabase/env";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      code?: string;
      subtotal?: number;
    };
    const code = normalizeCouponCode(body.code || "");
    const subtotal = Number(body.subtotal || 0);

    if (!code) {
      return NextResponse.json({ error: "Enter a coupon code." }, { status: 400 });
    }
    if (!hasServiceRole()) {
      return NextResponse.json(
        { error: "Coupons require Supabase configuration." },
        { status: 503 },
      );
    }

    const supabase = createServiceClient();
    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code." }, { status: 404 });
    }

    const result = computeDiscount(coupon, subtotal);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      code: coupon.code,
      discount: result.discount,
    });
  } catch {
    return NextResponse.json({ error: "Could not validate coupon." }, { status: 500 });
  }
}
