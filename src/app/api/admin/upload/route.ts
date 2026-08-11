import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Static mode — image uploads are disabled. Add files under public/products/ and reference them in seed-products.ts.",
    },
    { status: 503 },
  );
}
