#!/usr/bin/env node
// Unit guard for the Supabase row mappers (Phase 3). These convert DB rows
// (snake_case) to domain types and must be defensive — a malformed row must
// never throw. Requires Node 22+ (TS strip). No DB needed.
//   node --experimental-strip-types scripts/test-persistence.mjs
import { rowToJob, rowToMajor } from "../src/lib/jobs/row-mappers.ts";

let fail = 0;
const check = (name, cond) => {
  if (!cond) fail += 1;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
};

// --- rowToJob ---
const jobRow = {
  id: "j1",
  slug: "frontend-dev",
  title: "مطور واجهات",
  employer: "شركة",
  city: "الرياض",
  work_mode: "remote",
  apply_url: "https://e/x",
  posted_at: "2026-06-20T00:00:00.000Z",
  deadline: "2026-07-31T00:00:00.000Z",
  source: "rss-x",
  raw_text: "نص",
  accepted_majors: ["computer"],
  accepts_all_majors: false,
  skills: ["React"],
  suggested_courses: [],
  suggested_certs: ["Meta"],
  verification: "verified",
  last_checked_at: null,
};
const j = rowToJob(jobRow);
check("rowToJob maps snake->camel", j.applyUrl === "https://e/x" && j.workMode === "remote");
check("rowToJob arrays preserved", j.acceptedMajors[0] === "computer" && j.skills[0] === "React");
check("rowToJob verification mapped", j.verification === "verified");

// defensive: missing/invalid fields
const j2 = rowToJob({ slug: "x", title: "t", apply_url: "u", work_mode: "weird", skills: "notarray" });
check("rowToJob invalid work_mode -> unknown", j2.workMode === "unknown");
check("rowToJob missing arrays -> []", Array.isArray(j2.acceptedMajors) && j2.skills.length === 0);
check("rowToJob missing employer -> default", j2.employer === "غير محدّد");
check("rowToJob does not throw on {}", (() => { try { rowToJob({}); return true; } catch { return false; } })());

// --- rowToMajor ---
const m = rowToMajor({
  slug: "biology",
  name_ar: "الأحياء",
  name_en: "Biology",
  blurb: "b",
  keywords: ["أحياء"],
  synonyms: ["علم الأحياء"],
  related: ["chemistry"],
  sectors: ["الصحة"],
  product_category: "medical",
});
check("rowToMajor maps fields", m.nameAr === "الأحياء" && m.productCategory === "medical");
check("rowToMajor arrays preserved", m.keywords[0] === "أحياء" && m.related[0] === "chemistry");
check("rowToMajor missing product_category -> undefined", rowToMajor({ slug: "x", name_ar: "ا" }).productCategory === undefined);
check("rowToMajor does not throw on {}", (() => { try { rowToMajor({}); return true; } catch { return false; } })());

console.log(fail === 0 ? "\nALL PASS — DB row mappers are correct and defensive" : `\n${fail} FAILURE(S)`);
process.exit(fail === 0 ? 0 : 1);
