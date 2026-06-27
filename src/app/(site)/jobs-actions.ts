"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import type { SavedJob } from "@/lib/jobs/use-saved-jobs";

// Server actions for saved jobs. They persist to Supabase ONLY when a user is
// signed in and the backend is configured; otherwise they are graceful no-ops
// (anonymous users keep using the client localStorage store). Everything is
// wrapped — an action can never throw a 500 to the client.

export interface SyncResult {
  synced: boolean;
  jobs: SavedJob[];
}

function toRow(userId: string, job: SavedJob) {
  return {
    user_id: userId,
    job_ref: job.id,
    title: job.title,
    employer: job.employer ?? "",
    city: job.city ?? "",
    apply_url: job.applyUrl ?? "",
    major_slug: job.majorSlug ?? null,
  };
}

function fromRow(r: Record<string, unknown>): SavedJob {
  return {
    id: String(r.job_ref ?? ""),
    title: String(r.title ?? ""),
    employer: String(r.employer ?? ""),
    city: String(r.city ?? ""),
    applyUrl: String(r.apply_url ?? ""),
    majorSlug: typeof r.major_slug === "string" ? r.major_slug : undefined,
  };
}

// Merge the visitor's localStorage saved jobs into their account on sign-in,
// then return the authoritative server list. Returns {synced:false} for
// anonymous/unconfigured so the client keeps its local list.
export async function syncSavedJobsAction(local: SavedJob[]): Promise<SyncResult> {
  try {
    const user = await getSessionUser();
    const supabase = createSupabaseServerClient();
    if (!user || !supabase) return { synced: false, jobs: local };

    if (Array.isArray(local) && local.length > 0) {
      const rows = local
        .filter((j) => j && typeof j.id === "string" && j.id)
        .map((j) => toRow(user.id, j));
      if (rows.length > 0) {
        await supabase.from("saved_jobs").upsert(rows, { onConflict: "user_id,job_ref" });
      }
    }

    const { data, error } = await supabase
      .from("saved_jobs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return { synced: true, jobs: [] };
    return { synced: true, jobs: data.map((r) => fromRow(r as Record<string, unknown>)) };
  } catch {
    return { synced: false, jobs: local };
  }
}

// Save or unsave one job for the signed-in user. No-op when anonymous.
export async function toggleSavedJobAction(
  job: SavedJob,
  shouldSave: boolean,
): Promise<void> {
  try {
    const user = await getSessionUser();
    const supabase = createSupabaseServerClient();
    if (!user || !supabase || !job?.id) return;

    if (shouldSave) {
      await supabase.from("saved_jobs").upsert(toRow(user.id, job), {
        onConflict: "user_id,job_ref",
      });
    } else {
      await supabase.from("saved_jobs").delete().eq("job_ref", job.id);
    }
  } catch {
    /* best-effort: localStorage remains the source of truth on the client */
  }
}
