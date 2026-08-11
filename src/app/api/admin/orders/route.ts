import { NextResponse } from "next/server";

export async function PATCH() {
  return NextResponse.json(
    { error: "Static mode — orders are not stored in a database." },
    { status: 503 },
  );
}
