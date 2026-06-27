import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string | null;
}

// Returns the signed-in user with their profile/role, or null. All access
// control is derived from this server-side check — never from the client.
//
// RESILIENCE: this runs on EVERY page (the header reads it). A Supabase outage,
// a misconfigured/unreachable project, or a transient network error must NEVER
// take the whole site down. Any failure is caught and treated as "anonymous"
// (logged out) so pages keep rendering instead of returning a 500 / blank page.
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", user.id)
      .single<Pick<Profile, "id" | "email" | "full_name" | "role">>();

    return {
      id: user.id,
      email: profile?.email ?? user.email ?? "",
      role: profile?.role ?? "customer",
      fullName: profile?.full_name ?? null,
    };
  } catch (err) {
    // Fail safe to logged-out — degraded, but the site stays up. The error is
    // logged (server-side only) for the owner to diagnose in Render logs.
    console.error(
      "getSessionUser: Supabase auth check failed, treating as anonymous:",
      err instanceof Error ? err.message : String(err),
    );
    return null;
  }
}

/** Require an authenticated user or redirect to login. */
export async function requireUser(returnTo = "/dashboard"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(returnTo)}`);
  }
  return user;
}

/** Require an admin user or redirect. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login?next=/admin");
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}
