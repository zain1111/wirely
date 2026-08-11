import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Coupons are unavailable in static mode." },
    { status: 503 },
  );
}
