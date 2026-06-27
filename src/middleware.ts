import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

// Global middleware:
//  1. Coarse rate limiting on sensitive endpoints (defense-in-depth; route
//     handlers apply their own stricter limits too).
//  2. Supabase session refresh so Server Components see a valid session.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limit auth + payment + download surfaces.
  const isSensitive =
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/api/download") ||
    pathname.startsWith("/api/checkout") ||
    pathname.startsWith("/auth");

  if (isSensitive) {
    const ip = getClientIp(request.headers);
    const { success } = rateLimit(`mw:${pathname}:${ip}`, 60, 60_000);
    if (!success) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }

  const { response, hasUser } = await updateSession(request);

  // Defense-in-depth: redirect unauthenticated users away from protected
  // sections at the edge (a real 307), before any page renders. Page-level
  // requireUser/requireAdmin remain the authoritative gates (and enforce role).
  const isProtected =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  if (isProtected && !hasUser) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // Run on everything except static assets and image optimization.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
