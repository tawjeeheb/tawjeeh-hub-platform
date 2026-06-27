// Job opportunity model. Mirrors a future Supabase `jobs` table. No secrets —
// everything here is public ad data, safe to render.

export type WorkMode = "onsite" | "remote" | "hybrid" | "unknown";
export type JobVerification = "verified" | "unverified" | "expired";

export interface Job {
  id: string;
  /** Stable slug for the job detail/anchor. */
  slug: string;
  title: string;
  employer: string;
  sector: string;
  city: string;
  workMode: WorkMode;
  /** External apply link (we never receive applications ourselves). */
  applyUrl: string;
  postedAt: string; // ISO
  deadline: string | null; // ISO or null
  /** Where the listing came from (adapter id / label). */
  source: string;
  /** Raw ad text used by the classifier — kept for transparency. */
  rawText: string;
  /** Major slugs the ad explicitly accepts. */
  acceptedMajors: string[];
  /** True when the ad accepts graduates of any major. */
  acceptsAllMajors: boolean;
  /** Skills the ad asks for. */
  skills: string[];
  /** Suggested upskilling (filled by guidance layer / classifier). */
  suggestedCourses: string[];
  suggestedCerts: string[];
  verification: JobVerification;
  lastCheckedAt: string | null;
}

/** A job paired with why it matched a given major (for the UI). */
export interface MatchedJob {
  job: Job;
  score: number; // 0..100
  reasons: string[];
}
