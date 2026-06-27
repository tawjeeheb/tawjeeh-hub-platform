import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import type { SavedJob } from "@/lib/jobs/use-saved-jobs";

// Server-side saved jobs (persisted per user via RLS). All functions are
// defensive: any failure returns an empty/no-op result, never throws — so the
// saved page can never 500. Anonymous users have no server-saved jobs (they use
// the localStorage store on the client).

function rowToSaved(r: Record<string, unknown>): SavedJob {
  return {
    id: String(r.job_ref ?? ""),
    title: String(r.title ?? ""),
    employer: String(r.employer ?? ""),
    city: String(r.city ?? ""),
    applyUrl: String(r.apply_url ?? ""),
    majorSlug: typeof r.major_slug === "string" ? r.major_slug : undefined,
  };
}

export async function getServerSavedJobs(): Promise<SavedJob[]> {
  try {
    const user = await getSessionUser();
    if (!user) return [];
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("saved_jobs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map((r) => rowToSaved(r as Record<string, unknown>));
  } catch {
    return [];
  }
}
