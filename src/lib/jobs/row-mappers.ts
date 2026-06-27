import type { Job, WorkMode, JobVerification } from "@/lib/jobs/types";
import type { Major } from "@/lib/majors";

// Pure mappers from Supabase rows (snake_case) to domain types. No I/O — kept
// separate so they are unit-testable without a database. Defensive against
// nulls/missing columns so a malformed row never throws.

function strArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}
function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

const WORK_MODES: WorkMode[] = ["onsite", "remote", "hybrid", "unknown"];
const VERIFICATIONS: JobVerification[] = ["verified", "unverified", "expired"];

export function rowToJob(row: Record<string, unknown>): Job {
  const workMode = WORK_MODES.includes(row.work_mode as WorkMode)
    ? (row.work_mode as WorkMode)
    : "unknown";
  const verification = VERIFICATIONS.includes(row.verification as JobVerification)
    ? (row.verification as JobVerification)
    : "unverified";
  return {
    id: str(row.id),
    slug: str(row.slug),
    title: str(row.title),
    employer: str(row.employer, "غير محدّد"),
    sector: str(row.sector, "غير محدّد"),
    city: str(row.city, "غير محدّد"),
    workMode,
    applyUrl: str(row.apply_url),
    postedAt: str(row.posted_at) || new Date(0).toISOString(),
    deadline: typeof row.deadline === "string" ? row.deadline : null,
    source: str(row.source, "db"),
    rawText: str(row.raw_text),
    acceptedMajors: strArray(row.accepted_majors),
    acceptsAllMajors: row.accepts_all_majors === true,
    skills: strArray(row.skills),
    suggestedCourses: strArray(row.suggested_courses),
    suggestedCerts: strArray(row.suggested_certs),
    verification,
    lastCheckedAt: typeof row.last_checked_at === "string" ? row.last_checked_at : null,
  };
}

export function rowToMajor(row: Record<string, unknown>): Major {
  return {
    slug: str(row.slug),
    nameAr: str(row.name_ar),
    nameEn: str(row.name_en),
    blurb: str(row.blurb),
    keywords: strArray(row.keywords),
    synonyms: strArray(row.synonyms),
    related: strArray(row.related),
    sectors: strArray(row.sectors),
    productCategory: typeof row.product_category === "string" ? row.product_category : undefined,
  };
}
