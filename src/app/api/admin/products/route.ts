import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Static mode — product edits are disabled. Update src/lib/data/seed-products.ts instead.",
    },
    { status: 503 },
  );
}
