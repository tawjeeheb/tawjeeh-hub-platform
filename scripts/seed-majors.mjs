#!/usr/bin/env node
// Populate the Supabase `majors` table from the single source of truth
// (src/lib/majors.ts). Idempotent upsert. Requires Supabase keys.
//   node --experimental-strip-types --env-file=.env.local scripts/seed-majors.mjs
import { createClient } from "@supabase/supabase-js";
import { SEED_MAJORS } from "../src/lib/majors.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const rows = SEED_MAJORS.map((m) => ({
  slug: m.slug,
  name_ar: m.nameAr,
  name_en: m.nameEn,
  blurb: m.blurb,
  keywords: m.keywords,
  synonyms: m.synonyms,
  related: m.related,
  sectors: m.sectors,
  product_category: m.productCategory ?? null,
}));

const { error } = await supabase.from("majors").upsert(rows, { onConflict: "slug" });
if (error) {
  console.error("Upsert failed:", error.message);
  process.exit(1);
}
console.log(`Upserted ${rows.length} majors into Supabase.`);
