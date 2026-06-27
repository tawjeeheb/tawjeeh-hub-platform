import type { Job } from "@/lib/jobs/types";

// Drop duplicates that the same or different sources produce. Key on the apply
// URL first (most reliable), then on title+employer.
export function dedupeJobs(jobs: Job[]): Job[] {
  const seen = new Set<string>();
  const out: Job[] = [];
  for (const job of jobs) {
    const key = (job.applyUrl || `${job.title}|${job.employer}`)
      .trim()
      .toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(job);
  }
  return out;
}
