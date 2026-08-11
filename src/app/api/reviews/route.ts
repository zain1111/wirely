import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Thanks — reviews are currently collected via WhatsApp. Message us after your order.",
    },
    { status: 503 },
  );
}
