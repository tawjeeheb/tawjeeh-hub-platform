import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { SEED_MAJORS, getSeedMajorBySlug, type Major } from "@/lib/majors";
import { rowToMajor } from "@/lib/jobs/row-mappers";

// Majors access. Reads the Supabase `majors` table when configured; otherwise
// (or on ANY error, or while the table is empty) falls back to the seed catalog.
// Defensive so a backend hiccup can never crash a page.

export async function getMajors(): Promise<Major[]> {
  if (!isSupabaseConfigured) return SEED_MAJORS;
  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) return SEED_MAJORS;
    const { data, error } = await supabase.from("majors").select("*").order("slug");
    if (error || !data || data.length === 0) return SEED_MAJORS;
    return data.map((r) => rowToMajor(r as Record<string, unknown>));
  } catch {
    return SEED_MAJORS;
  }
}

export async function getMajor(slug: string): Promise<Major | null> {
  if (!isSupabaseConfigured) return getSeedMajorBySlug(slug) ?? null;
  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) return getSeedMajorBySlug(slug) ?? null;
    const { data, error } = await supabase
      .from("majors")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return getSeedMajorBySlug(slug) ?? null;
    return rowToMajor(data as Record<string, unknown>);
  } catch {
    return getSeedMajorBySlug(slug) ?? null;
  }
}
