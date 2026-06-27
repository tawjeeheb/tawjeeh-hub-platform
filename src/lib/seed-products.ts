import "server-only";
import type { Product } from "@/lib/types";

// Curated seed catalog. SERVER ONLY — it contains `file_path` values pointing at
// private bucket objects, so it must never reach the browser. Public category
// labels live in `@/lib/categories` for safe client import.

const now = "2026-06-01T00:00:00.000Z";

export const SEED_PRODUCTS: Product[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "sharia-islamic-studies-guide",
    title: "الدليل المهني لتخصصات الشريعة والدراسات الإسلامية",
    subtitle: "مسارات مهنية موثقة في القطاع الشرعي والقضائي والدعوي",
    description:
      "دليل مهني متخصص يرسم المسارات الوظيفية لخريجي الشريعة والدراسات الإسلامية داخل سوق العمل السعودي. يغطي كل بطاقة مهنية المسمى الوظيفي، التصنيف الوطني للمهن، طبيعة العمل، الشروط والمؤهلات، الشهادات المهنية، وجهات التوظيف وطريقة التقديم — بمعلومات موثقة ومنظمة دون تخمين.",
    contents: [
      "بطاقات مهنية شاملة لكل مسار وظيفي في القطاع الشرعي",
      "التصنيف السعودي الموحد للمهن (SSC) لكل مسمى",
      "الشروط، المؤهلات، والخبرات المطلوبة",
      "الشهادات المهنية الاحترافية وبرامج التأهيل المعتمدة",
      "جهات التوظيف الحكومية والخاصة وطريقة التقديم",
      "المسار الوظيفي والتطور المهني المتوقع",
    ],
    audience: [
      "طلاب وخريجو كليات الشريعة والدراسات الإسلامية",
      "الباحثون عن عمل في القطاع القضائي والدعوي",
      "المرشدون المهنيون والأكاديميون",
    ],
    category: "sharia",
    price_sar: 89,
    status: "available",
    cover_url: null,
    file_path: "products/sharia-islamic-studies-guide.pdf",
    created_at: now,
    updated_at: now,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    slug: "medical-laboratory-sciences-guide",
    title: "الدليل المهني لتخصصات علوم المختبرات الطبية",
    subtitle: "مسارات مهنية في التحاليل والتشخيص المخبري",
    description:
      "دليل مهني دقيق لتخصصات علوم المختبرات الطبية، يوضح للطالب والخريج طبيعة كل مهنة مخبرية، متطلبات التصنيف المهني، الشهادات المطلوبة من الهيئة السعودية للتخصصات الصحية، وجهات التوظيف في القطاعين الحكومي والخاص.",
    contents: [
      "بطاقات مهنية لتخصصات التحاليل والتشخيص المخبري",
      "متطلبات التصنيف والتسجيل المهني الصحي",
      "الشهادات والاعتمادات المهنية المطلوبة",
      "المهارات الفنية والتقنية لكل مسار",
      "جهات التوظيف في المستشفيات والمختبرات",
      "المسار الوظيفي وفرص التطور والترقي",
    ],
    audience: [
      "طلاب وخريجو علوم المختبرات الطبية",
      "الفنيون والأخصائيون الباحثون عن تطوير مسارهم",
      "المتقدمون للتصنيف المهني الصحي",
    ],
    category: "medical",
    price_sar: 99,
    status: "available",
    cover_url: null,
    file_path: "products/medical-laboratory-sciences-guide.pdf",
    created_at: now,
    updated_at: now,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    slug: "geography-gis-guide",
    title: "الدليل المهني لتخصصات الجغرافيا ونظم المعلومات الجغرافية",
    subtitle: "مسارات مهنية في GIS والتخطيط المكاني والاستشعار عن بُعد",
    description:
      "دليل مهني يستعرض المسارات الوظيفية لتخصصات الجغرافيا ونظم المعلومات الجغرافية (GIS) في سوق العمل السعودي، من التخطيط العمراني والاستشعار عن بُعد إلى تحليل البيانات المكانية، مع توثيق الشهادات والمهارات وجهات التوظيف.",
    contents: [
      "بطاقات مهنية لتخصصات GIS والتخطيط المكاني",
      "الشهادات الاحترافية في نظم المعلومات الجغرافية",
      "الأدوات والبرمجيات المطلوبة في سوق العمل",
      "المهارات التحليلية والتقنية لكل مسار",
      "جهات التوظيف في الجهات الحكومية وشركات التطوير",
      "المسار الوظيفي والفرص المستقبلية",
    ],
    audience: [
      "طلاب وخريجو الجغرافيا ونظم المعلومات الجغرافية",
      "المهتمون بتحليل البيانات المكانية والتخطيط العمراني",
      "الباحثون عن فرص في قطاع المدن والبنية التحتية",
    ],
    category: "geo",
    price_sar: 89,
    status: "coming_soon",
    cover_url: null,
    file_path: "products/geography-gis-guide.pdf",
    created_at: now,
    updated_at: now,
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    slug: "arabic-language-ai-guide",
    title: "الدليل المهني لتخصصات اللغة العربية والذكاء الاصطناعي",
    subtitle: "مسارات مهنية حديثة في معالجة اللغة العربية والمحتوى الرقمي",
    description:
      "دليل مهني يجمع بين تخصص اللغة العربية والمجالات الناشئة في الذكاء الاصطناعي ومعالجة اللغات الطبيعية. يوضح الفرص الجديدة لخريجي اللغة العربية في تحرير وهندسة المحتوى، البيانات اللغوية، وتدريب النماذج اللغوية العربية.",
    contents: [
      "بطاقات مهنية تجمع اللغة العربية والمجالات الرقمية",
      "مسارات معالجة اللغة الطبيعية والبيانات اللغوية",
      "المهارات الرقمية المطلوبة لخريج اللغة العربية",
      "الشهادات والدورات الداعمة في الذكاء الاصطناعي",
      "جهات التوظيف في شركات التقنية والمحتوى",
      "المسار الوظيفي في سوق عمل متطور",
    ],
    audience: [
      "طلاب وخريجو اللغة العربية وآدابها",
      "المهتمون بدمج التخصص اللغوي بالتقنية",
      "الباحثون عن مسارات حديثة في صناعة المحتوى الرقمي",
    ],
    category: "language-ai",
    price_sar: 109,
    status: "coming_soon",
    cover_url: null,
    file_path: "products/arabic-language-ai-guide.pdf",
    created_at: now,
    updated_at: now,
  },
  // --- Lifecycle examples (NOT public) ---------------------------------------
  // These demonstrate the owner workflow and prove the public-visibility rule:
  // `draft` and `archived` products must never appear in the catalog, sitemap,
  // or product page. See PUBLIC_PRODUCT_STATUSES + src/lib/data/products.ts.
  {
    id: "55555555-5555-4555-8555-555555555555",
    slug: "draft-civil-engineering-guide",
    title: "الدليل المهني لتخصصات الهندسة المدنية (مسودة)",
    subtitle: "مسودة قيد التحرير — غير منشورة",
    description:
      "مسودة دليل مهني للهندسة المدنية ما تزال قيد الإعداد التحريري ولم تُنشر للعامة بعد. تُستخدم لاختبار سير عمل المالك وقواعد الإخفاء.",
    contents: ["محتوى تجريبي قيد التحرير"],
    audience: ["غير منشور بعد"],
    category: "geo",
    price_sar: 0,
    status: "draft",
    cover_url: null,
    file_path: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    slug: "archived-legacy-accounting-guide",
    title: "دليل مهني قديم للمحاسبة (مؤرشف)",
    subtitle: "نسخة مؤرشفة — لم تعد معروضة",
    description:
      "نسخة قديمة من دليل مهني تم سحبها من العرض العام وأُرشفت. محفوظة للمالك فقط ولا تظهر في المتجر أو خريطة الموقع.",
    contents: ["نسخة مؤرشفة"],
    audience: ["غير معروض"],
    category: "language-ai",
    price_sar: 79,
    status: "archived",
    cover_url: null,
    file_path: "products/archived-legacy-accounting-guide.pdf",
    created_at: now,
    updated_at: now,
  },
];

export function getSeedProductBySlug(slug: string): Product | undefined {
  return SEED_PRODUCTS.find((p) => p.slug === slug);
}
