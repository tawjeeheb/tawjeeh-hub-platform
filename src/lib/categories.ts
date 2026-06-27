// Public category catalog — safe to import from client components. Kept in its
// own module (separate from seed-products.ts) so the seed catalog, which
// contains internal `file_path` values, is never pulled into the client bundle.

export const SEED_CATEGORIES = [
  { key: "sharia", label: "الشريعة والدراسات الإسلامية" },
  { key: "medical", label: "العلوم الطبية والمختبرات" },
  { key: "geo", label: "الجغرافيا ونظم المعلومات" },
  { key: "language-ai", label: "اللغة العربية والذكاء الاصطناعي" },
] as const;

export function categoryLabel(key: string): string {
  return SEED_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}
