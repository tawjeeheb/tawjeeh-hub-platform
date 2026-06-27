import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { recordAudit } from "@/lib/audit";
import { safeRelativePath } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// OAuth / email-confirmation callback. Supabase redirects here with a `?code=`
// (PKCE) which we exchange for a session cookie. This is the ONLY place a hosted
// sign-in becomes a session. `next` is sanitized to a same-origin path, so the
// callback can never be turned into an open redirect, regardless of what the
// provider echoes back.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeRelativePath(url.searchParams.get("next")); // same-origin only
  const providerError = url.searchParams.get("error"); // e.g. user cancelled

  const fail = (reason: string) =>
    NextResponse.redirect(
      new URL(`/auth/login?error=${reason}&next=${encodeURIComponent(next)}`, url.origin),
    );

  if (providerError) return fail("oauth_cancelled");
  if (!isSupabaseConfigured) return fail("auth_disabled");
  if (!code) return fail("oauth");

  const supabase = createSupabaseServerClient()!;
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.session) return fail("oauth");

  await recordAudit({ actorId: data.session.user.id, action: "login" });

  // Land on the sanitized same-origin destination with the session cookie set.
  return NextResponse.redirect(new URL(next, url.origin));
}
