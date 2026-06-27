#!/usr/bin/env node
// Dry-run the job-ingestion pipeline with the seed source — no keys needed.
// Proves: fetch -> normalize -> classify -> dedupe runs end-to-end and tags each
// ad with the majors it accepts. Real sources are added in DEFAULT_SOURCES.
// Requires Node 22+ (native TS type-stripping).
//   node scripts/ingest-jobs.mjs
import { runIngestion, saveJobs } from "../src/lib/jobs/ingestion/index.ts";

const report = await runIngestion();

console.log("=== Sources ===");
for (const s of report.bySource) {
  console.log(`  ${s.id}: ${s.skipped ? "skipped (needs config)" : `${s.fetched} fetched`}`);
}

console.log(`\n=== Normalized + classified jobs (${report.jobs.length}) ===`);
for (const j of report.jobs) {
  const tags = j.acceptsAllMajors ? "ALL MAJORS" : j.acceptedMajors.join(", ") || "(none)";
  console.log(`  • ${j.title} [${j.city}] -> ${tags}`);
}

const saved = await saveJobs(report.jobs);
console.log(
  `\n=== Save ===\n  ${saved.pending ? `${report.jobs.length} pending (Supabase persistence not configured)` : `${saved.saved} saved`}`,
);
console.log("\nPIPELINE_OK");
