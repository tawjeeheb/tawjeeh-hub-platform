import type { RawJob, SourceAdapter } from "@/lib/jobs/ingestion/types";

// Seed/demo source — proves the whole pipeline runs WITHOUT any external config.
// Returns raw, unclassified ads (as a real RSS/API adapter would); the pipeline
// then normalizes + classifies them. Replace/augment with real adapters later.
const RAW: RawJob[] = [
  {
    title: "فني مختبر",
    employer: "مختبر تشخيصي",
    city: "الرياض",
    sector: "الصحة",
    applyUrl: "https://example.com/apply/seed-lab",
    rawText:
      "مطلوب فني مختبر، تخصص علوم مختبرات طبية أو أحياء، إجراء التحاليل وضبط الجودة.",
    source: "seed-source",
    skills: ["التحاليل المخبرية", "ضبط الجودة"],
  },
  {
    title: "منسق مشاريع",
    employer: "شركة استشارات",
    city: "جدة",
    sector: "الإدارة",
    applyUrl: "https://example.com/apply/seed-pm",
    rawText:
      "منسق مشاريع، يقبل جميع التخصصات، مهارات تنظيم ومتابعة وتواصل وإجادة الحاسب.",
    source: "seed-source",
    skills: ["إدارة المشاريع", "التنظيم", "التواصل"],
  },
];

export const seedSource: SourceAdapter = {
  id: "seed-source",
  label: "مصدر تجريبي (Seed)",
  requiresConfig: false,
  isConfigured: () => true,
  async fetch() {
    return RAW;
  },
};
