import "server-only";
import { SEED_MAJORS, getSeedMajorBySlug, type Major } from "@/lib/majors";

// Majors access. Today it serves the seed catalog; when a Supabase `majors`
// table exists this is the single place to read it. Wrapped defensively so a
// backend hiccup can never crash a page (degrades to seed).

export async function getMajors(): Promise<Major[]> {
  try {
    return SEED_MAJORS;
  } catch {
    return SEED_MAJORS;
  }
}

export async function getMajor(slug: string): Promise<Major | null> {
  try {
    return getSeedMajorBySlug(slug) ?? null;
  } catch {
    return null;
  }
}
