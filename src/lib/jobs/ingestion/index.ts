import type { Job } from "@/lib/jobs/types";
import type { RawJob, SourceAdapter } from "./types";
import { normalizeJob } from "./normalize";
import { dedupeJobs } from "./dedupe";
import { seedSource } from "./sources/seed-source";

// Ingestion pipeline: fetch -> normalize -> classify (inside normalize) ->
// dedupe -> (save). Adapters that need config but aren't configured are skipped
// with a log line, never crashing the run. This is the single expansion point:
// register real RSS/API adapters in DEFAULT_SOURCES as they come online.

export const DEFAULT_SOURCES: SourceAdapter[] = [seedSource];

export interface IngestionReport {
  bySource: { id: string; label: string; fetched: number; skipped: boolean }[];
  jobs: Job[];
}

export async function runIngestion(
  sources: SourceAdapter[] = DEFAULT_SOURCES,
): Promise<IngestionReport> {
  const bySource: IngestionReport["bySource"] = [];
  const collected: Job[] = [];

  for (const source of sources) {
    if (source.requiresConfig && !source.isConfigured()) {
      bySource.push({ id: source.id, label: source.label, fetched: 0, skipped: true });
      continue;
    }
    let raws: RawJob[];
    try {
      raws = await source.fetch();
    } catch {
      raws = [];
    }
    raws.forEach((raw, i) => collected.push(normalizeJob(raw, i)));
    bySource.push({ id: source.id, label: source.label, fetched: raws.length, skipped: false });
  }

  return { bySource, jobs: dedupeJobs(collected) };
}

// Persist normalized jobs. Wired to Supabase later (service role, server-only).
// Today it is a no-op that reports what WOULD be saved — so the pipeline runs
// end-to-end without keys. See ENVIRONMENT_KEYS_REQUIRED.md.
export async function saveJobs(jobs: Job[]): Promise<{ saved: number; pending: boolean }> {
  // TODO(jobs-persistence): upsert into Supabase `jobs` (requires service role).
  return { saved: 0, pending: jobs.length > 0 };
}
