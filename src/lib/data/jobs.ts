import "server-only";
import { SEED_JOBS } from "@/lib/jobs/seed-jobs";
import { jobsForMajor } from "@/lib/jobs/matching";
import { getMajor } from "@/lib/data/majors";
import type { Job, MatchedJob } from "@/lib/jobs/types";
import type { Major } from "@/lib/majors";

// Jobs access. Serves the seed catalog now; the ingestion pipeline
// (src/lib/jobs/ingestion) will write real listings to a Supabase `jobs` table,
// and this becomes the single read point. Every function is defensive — a
// failure degrades to seed / empty, never a 500.

export async function getJobs(): Promise<Job[]> {
  try {
    return SEED_JOBS;
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
