// ---------------------------------------------------------------------------
// proxy.ts — Next.js 16 route protection (replaces middleware.ts)
// ---------------------------------------------------------------------------

import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Protect /account/* routes ──────────────────────────────────────────
  if (pathname.startsWith("/account")) {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.redirect(new URL("/ingresar", request.url));
    }
  }

  // ── Redirect authenticated users away from login ───────────────────────
  if (pathname === "/ingresar") {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session) {
      return NextResponse.redirect(new URL("/account", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/ingresar"],
};
