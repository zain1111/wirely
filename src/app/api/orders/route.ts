import { NextResponse } from "next/server";
import { placeOrder } from "@/lib/orders";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await placeOrder(body);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status ?? 400 },
      );
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Unexpected error placing order." },
      { status: 500 },
    );
  }
}
