import type { Major } from "@/lib/majors";
import type { Job, MatchedJob } from "@/lib/jobs/types";

// Rule-based matching engine. Pure functions (no I/O, no secrets) so they run
// anywhere and are trivially testable. Each job gets a 0..100 score for a given
// major plus human-readable reasons explaining WHY it surfaced — never a black
// box. A score of 0 means "not for this major" and the job is hidden.

const WEIGHT = {
  explicit: 100, // ad names this major directly
  related: 72, // ad accepts a nearby major
  all: 60, // ad accepts every major
  keyword: 55, // major's keyword/synonym appears in the ad text
} as const;

function firstTermPresent(text: string, terms: string[]): string | null {
  const haystack = text.toLowerCase();
  for (const term of terms) {
    const t = term.trim().toLowerCase();
    if (t && haystack.includes(t)) return term;
  }
  return null;
}

export interface MatchResult {
  score: number;
  accepted: boolean;
  reasons: string[];
}

export function matchJobToMajor(job: Job, major: Major): MatchResult {
  const reasons: string[] = [];
  let score = 0;

  const explicit = job.acceptedMajors.includes(major.slug);
  if (explicit) {
    score = Math.max(score, WEIGHT.explicit);
    reasons.push(`ظهرت لك لأن الإعلان يقبل تخصص «${major.nameAr}» صراحةً.`);
  }

  if (!explicit) {
    const relatedHit = job.acceptedMajors.find((s) => major.related.includes(s));
    if (relatedHit) {
      score = Math.max(score, WEIGHT.related);
      reasons.push(`ظهرت لك لأنها تقبل تخصصات قريبة من «${major.nameAr}».`);
    }
  }

  if (job.acceptsAllMajors) {
    score = Math.max(score, WEIGHT.all);
    reasons.push("ظهرت لك لأنها تقبل جميع التخصصات.");
  }

  if (!explicit) {
    const kw = firstTermPresent(job.rawText, [...major.keywords, ...major.synonyms]);
    if (kw) {
      score = Math.max(score, WEIGHT.keyword);
      reasons.push(`ظهرت لك لأن نص الإعلان يذكر «${kw}» المرتبط بتخصصك.`);
    }
  }

  return { score, accepted: score > 0, reasons };
}

/** All jobs relevant to a major, best-fit first, each with its reasons. */
export function jobsForMajor(major: Major, jobs: Job[]): MatchedJob[] {
  return jobs
    .map((job) => ({ job, ...matchJobToMajor(job, major) }))
    .filter((m) => m.accepted)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.job.postedAt > a.job.postedAt ? 1 : -1),
    )
    .map(({ job, score, reasons }) => ({ job, score, reasons }));
}

export function fitLabel(score: number): string {
  if (score >= WEIGHT.explicit) return "مناسبة عالية";
  if (score >= WEIGHT.related) return "مناسبة جيدة";
  if (score >= WEIGHT.all) return "مفتوحة للجميع";
  if (score >= WEIGHT.keyword) return "مناسبة محتملة";
  return "—";
}
