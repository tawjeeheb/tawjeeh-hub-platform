import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

export interface SessionResult {
  response: NextResponse;
  /** True when a signed-in user is present on this request. */
  hasUser: boolean;
}

// Refreshes the Supabase auth session on every request and keeps cookies in
// sync. Must run in middleware so Server Components always see a fresh session.
// Also reports whether a user is signed in so the caller can gate routes.
export async function updateSession(
  request: NextRequest,
): Promise<SessionResult> {
  // Plain passthrough when no backend: forwarding `{ request }` here makes
  // notFound() return a soft-404 (200), so use a bare next() on this path.
  if (!isSupabaseConfigured) {
    return { response: NextResponse.next(), hasUser: false };
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do not run code between createServerClient and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, hasUser: Boolean(user) };
}
