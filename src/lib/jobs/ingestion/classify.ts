import { SEED_MAJORS } from "../../majors";

// Classifier: reads an ad's raw text and decides which majors it accepts. This
// is what powers "show me only my major's jobs". Pure + deterministic.

const ALL_MAJORS_PHRASES = [
  "جميع التخصصات",
  "كل التخصصات",
  "لجميع الخريجين",
  "أي تخصص",
  "بدون اشتراط تخصص",
  "all majors",
];

export interface Classification {
  acceptedMajors: string[];
  acceptsAllMajors: boolean;
}

export function classifyRawText(rawText: string): Classification {
  const text = rawText.toLowerCase();

  const acceptsAllMajors = ALL_MAJORS_PHRASES.some((p) =>
    text.includes(p.toLowerCase()),
  );

  const acceptedMajors: string[] = [];
  for (const major of SEED_MAJORS) {
    const terms = [major.nameAr, ...major.keywords, ...major.synonyms];
    if (terms.some((t) => t && text.includes(t.toLowerCase()))) {
      acceptedMajors.push(major.slug);
    }
  }

  return { acceptedMajors: [...new Set(acceptedMajors)], acceptsAllMajors };
}
