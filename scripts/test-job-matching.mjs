#!/usr/bin/env node
// Unit guard for the major↔job matching engine. Requires Node 22+ (TS strip).
//   node scripts/test-job-matching.mjs
import { matchJobToMajor, jobsForMajor, fitLabel } from "../src/lib/jobs/matching.ts";

let fail = 0;
const check = (name, cond) => {
  if (!cond) fail += 1;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
};

const biology = {
  slug: "biology",
  nameAr: "الأحياء",
  nameEn: "Biology",
  blurb: "",
  keywords: ["أحياء", "مايكروبيولوجي"],
  synonyms: ["علم الأحياء"],
  related: ["medical-lab", "chemistry"],
  sectors: [],
};

const mk = (over) => ({
  id: "x",
  slug: "x",
  title: "t",
  employer: "e",
  sector: "s",
  city: "c",
  workMode: "onsite",
  applyUrl: "https://e/x",
  postedAt: "2026-06-20T00:00:00.000Z",
  deadline: null,
  source: "test",
  rawText: "",
  acceptedMajors: [],
  acceptsAllMajors: false,
  skills: [],
  suggestedCourses: [],
  suggestedCerts: [],
  verification: "unverified",
  lastCheckedAt: null,
  ...over,
});

// explicit
const explicit = matchJobToMajor(mk({ acceptedMajors: ["biology"] }), biology);
check("explicit major -> score 100", explicit.score === 100);
check("explicit -> has reason", explicit.reasons.some((r) => r.includes("صراحةً")));

// related (medical-lab is in biology.related)
const related = matchJobToMajor(mk({ acceptedMajors: ["medical-lab"] }), biology);
check("related major -> score 72", related.score === 72);

// accepts all
const all = matchJobToMajor(mk({ acceptsAllMajors: true }), biology);
check("accepts all -> score 60", all.score === 60);
check("accepts all -> reason mentions جميع التخصصات", all.reasons.some((r) => r.includes("جميع التخصصات")));

// keyword in text only
const kw = matchJobToMajor(mk({ rawText: "مطلوب خريج أحياء" }), biology);
check("keyword in text -> score 55", kw.score === 55);

// unrelated -> excluded
const none = matchJobToMajor(mk({ acceptedMajors: ["accounting"], rawText: "محاسبة وقيود" }), biology);
check("unrelated -> score 0 (excluded)", none.score === 0 && none.accepted === false);

// jobsForMajor filters + sorts (explicit before accepts-all)
const list = jobsForMajor(biology, [
  mk({ id: "a", acceptsAllMajors: true }),
  mk({ id: "b", acceptedMajors: ["biology"] }),
  mk({ id: "c", acceptedMajors: ["accounting"], rawText: "محاسبة" }),
]);
check("jobsForMajor excludes unrelated", !list.some((m) => m.job.id === "c"));
check("jobsForMajor sorts explicit first", list[0]?.job.id === "b");

// fit labels
check("fitLabel 100 -> عالية", fitLabel(100) === "مناسبة عالية");
check("fitLabel 60 -> مفتوحة للجميع", fitLabel(60) === "مفتوحة للجميع");
check("fitLabel 55 -> محتملة", fitLabel(55) === "مناسبة محتملة");

console.log(fail === 0 ? "\nALL PASS — matching engine correct" : `\n${fail} FAILURE(S)`);
process.exit(fail === 0 ? 0 : 1);
