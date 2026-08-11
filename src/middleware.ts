import { NextResponse, type NextRequest } from "next/server";

/** Static mode — no database auth. Admin pages are open. */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
