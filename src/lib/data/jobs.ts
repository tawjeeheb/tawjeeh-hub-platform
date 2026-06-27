import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { SEED_JOBS } from "@/lib/jobs/seed-jobs";
import { jobsForMajor } from "@/lib/jobs/matching";
import { rowToJob } from "@/lib/jobs/row-mappers";
import { getMajor } from "@/lib/data/majors";
import type { Job, MatchedJob } from "@/lib/jobs/types";
import type { Major } from "@/lib/majors";

// Jobs access. Reads the Supabase `jobs` table when configured; otherwise (or on
// ANY error, or while the table is still empty) it falls back to the seed
// catalog. Every function is defensive — a backend failure degrades to seed,
// never a 500 / black screen.

export async function getJobs(): Promise<Job[]> {
  if (!isSupabaseConfigured) return SEED_JOBS;
  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) return SEED_JOBS;
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("posted_at", { ascending: false });
    // Empty table → keep showing seed until real jobs are ingested.
    if (error || !data || data.length === 0) return SEED_JOBS;
    return data.map((r) => rowToJob(r as Record<string, unknown>));
  } catch {
    return SEED_JOBS;
  }
}

/** Latest N jobs across all majors (for the home teaser). */
export async function getLatestJobs(limit = 6): Promise<Job[]> {
  const jobs = await getJobs();
  return [...jobs]
    .sort((a, b) => (b.postedAt > a.postedAt ? 1 : -1))
    .slice(0, limit);
}

/** Jobs matched + explained for a major slug. Returns [] on any problem. */
export async function getMatchedJobs(
  slug: string,
): Promise<{ major: Major; matches: MatchedJob[] } | null> {
  try {
    const major = await getMajor(slug);
    if (!major) return null;
    const jobs = await getJobs();
    return { major, matches: jobsForMajor(major, jobs) };
  } catch {
    return null;
  }
}

/** Count of matched jobs per major slug (for the majors grid). */
export async function getMajorJobCounts(): Promise<Record<string, number>> {
  try {
    const { SEED_MAJORS } = await import("@/lib/majors");
    const jobs = await getJobs();
    const out: Record<string, number> = {};
    for (const m of SEED_MAJORS) out[m.slug] = jobsForMajor(m, jobs).length;
    return out;
  } catch {
    return {};
  }
}
