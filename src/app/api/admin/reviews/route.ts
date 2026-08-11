import { NextResponse } from "next/server";

export async function PATCH() {
  return NextResponse.json(
    { error: "Static mode — reviews are not stored in a database." },
    { status: 503 },
  );
}
