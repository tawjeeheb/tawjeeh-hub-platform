import type { Job, WorkMode } from "@/lib/jobs/types";
import type { RawJob } from "./types";
import { classifyRawText } from "./classify";

// Turn a RawJob into a normalized, classified Job. Deterministic; no I/O.

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "job";
}

function detectWorkMode(text: string): WorkMode {
  const t = text.toLowerCase();
  if (t.includes("عن بعد") || t.includes("عن بُعد") || t.includes("remote")) return "remote";
  if (t.includes("هجين") || t.includes("hybrid")) return "hybrid";
  if (t.includes("حضوري") || t.includes("بالمقر")) return "onsite";
  return "unknown";
}

export function normalizeJob(raw: RawJob, index = 0): Job {
  const { acceptedMajors, acceptsAllMajors } = classifyRawText(raw.rawText);
  const slug = `${slugify(raw.title)}-${slugify(raw.city ?? "")}` || `job-${index}`;

  return {
    id: `${raw.source}-${slugify(raw.title)}-${index}`,
    slug,
    title: raw.title.trim(),
    employer: (raw.employer ?? "غير محدّد").trim(),
    sector: (raw.sector ?? "غير محدّد").trim(),
    city: (raw.city ?? "غير محدّد").trim(),
    workMode: detectWorkMode(raw.rawText),
    applyUrl: raw.applyUrl,
    postedAt: raw.postedAt ?? new Date(0).toISOString(),
    deadline: raw.deadline ?? null,
    source: raw.source,
    rawText: raw.rawText,
    acceptedMajors,
    acceptsAllMajors,
    skills: raw.skills ?? [],
    suggestedCourses: [],
    suggestedCerts: [],
    verification: "unverified",
    lastCheckedAt: null,
  };
}
