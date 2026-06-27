// Academic majors model — the spine of "مركز توجيه". Client-safe (no secrets),
// imported by both server data layer and client UI. Seed data here is the
// expandable source of truth until a Supabase `majors` table is wired up.

export interface Major {
  slug: string;
  nameAr: string;
  nameEn: string;
  /** One-line description shown on cards. */
  blurb: string;
  /** Terms that, when present in a job ad, signal this major is accepted. */
  keywords: string[];
  /** Alternate spellings/phrasings used in real Arabic job ads. */
  synonyms: string[];
  /** Slugs of nearby majors a job may also accept. */
  related: string[];
  /** Sectors where graduates of this major typically work. */
  sectors: string[];
  /** Store category key this major maps to (if a guide exists). */
  productCategory?: string;
}

export const SEED_MAJORS: Major[] = [
  {
    slug: "sharia",
    nameAr: "الشريعة والدراسات الإسلامية",
    nameEn: "Sharia & Islamic Studies",
    blurb: "المسارات الشرعية والقضائية والدعوية والتعليمية.",
    keywords: ["شريعة", "دراسات إسلامية", "فقه", "أصول", "قضاء", "دعوة", "علوم شرعية"],
    synonyms: ["الشريعة", "الدراسات الإسلامية", "العلوم الشرعية"],
    related: ["arabic", "history"],
    sectors: ["التعليم", "القضاء", "الأوقاف", "الإفتاء", "القطاع الخيري"],
    productCategory: "sharia",
  },
  {
    slug: "arabic",
    nameAr: "اللغة العربية",
    nameEn: "Arabic Language",
    blurb: "التدريس، التحرير، التدقيق اللغوي، والمحتوى.",
    keywords: ["لغة عربية", "نحو", "بلاغة", "تحرير", "تدقيق لغوي", "محتوى", "صحافة"],
    synonyms: ["اللغة العربية", "أدب عربي", "لغويات"],
    related: ["history", "sharia"],
    sectors: ["التعليم", "الإعلام", "النشر", "صناعة المحتوى"],
    productCategory: "language-ai",
  },
  {
    slug: "history",
    nameAr: "التاريخ والآثار",
    nameEn: "History & Archaeology",
    blurb: "المتاحف، التراث، البحث، والتعليم.",
    keywords: ["تاريخ", "آثار", "تراث", "متاحف", "حضارة", "وثائق"],
    synonyms: ["التاريخ", "الآثار", "علم الآثار"],
    related: ["arabic", "sociology"],
    sectors: ["السياحة والتراث", "المتاحف", "التعليم", "البحث"],
  },
  {
    slug: "psychology",
    nameAr: "علم النفس",
    nameEn: "Psychology",
    blurb: "الإرشاد، الموارد البشرية، التقييم النفسي.",
    keywords: ["علم نفس", "إرشاد", "صحة نفسية", "سلوك", "تقييم نفسي", "موارد بشرية"],
    synonyms: ["علم النفس", "الإرشاد النفسي"],
    related: ["sociology", "management"],
    sectors: ["الصحة", "التعليم", "الموارد البشرية", "القطاع الاجتماعي"],
  },
  {
    slug: "sociology",
    nameAr: "علم الاجتماع",
    nameEn: "Sociology",
    blurb: "البحث الاجتماعي، التنمية، الخدمة المجتمعية.",
    keywords: ["علم اجتماع", "خدمة اجتماعية", "تنمية", "بحث اجتماعي", "مجتمع"],
    synonyms: ["علم الاجتماع", "الخدمة الاجتماعية"],
    related: ["psychology", "history"],
    sectors: ["القطاع الاجتماعي", "التنمية", "البحث", "المنظمات غير الربحية"],
  },
  {
    slug: "biology",
    nameAr: "الأحياء",
    nameEn: "Biology",
    blurb: "المختبرات، البحث، الجودة، والتعليم.",
    keywords: ["أحياء", "علوم حياتية", "مايكروبيولوجي", "خلية", "بيئة", "تقنية حيوية"],
    synonyms: ["الأحياء", "علم الأحياء", "العلوم الحياتية"],
    related: ["medical-lab", "chemistry"],
    sectors: ["المختبرات", "الصحة", "الجودة", "البحث", "التعليم"],
  },
  {
    slug: "chemistry",
    nameAr: "الكيمياء",
    nameEn: "Chemistry",
    blurb: "مختبرات التحليل، الجودة، السلامة، والصناعة.",
    keywords: ["كيمياء", "تحليل كيميائي", "جودة", "مختبر", "بتروكيماويات", "سلامة"],
    synonyms: ["الكيمياء", "كيميائي"],
    related: ["biology", "physics", "medical-lab"],
    sectors: ["الصناعة", "المختبرات", "الجودة", "البترول والطاقة"],
  },
  {
    slug: "physics",
    nameAr: "الفيزياء",
    nameEn: "Physics",
    blurb: "القياس، الطاقة، التحكم، والتعليم.",
    keywords: ["فيزياء", "طاقة", "قياس", "أجهزة", "إشعاع", "تحكم"],
    synonyms: ["الفيزياء", "فيزيائي"],
    related: ["chemistry", "computer"],
    sectors: ["الطاقة", "الصناعة", "التعليم", "البحث"],
  },
  {
    slug: "medical-lab",
    nameAr: "علوم المختبرات الطبية",
    nameEn: "Medical Laboratory Sciences",
    blurb: "التحاليل، التشخيص، بنوك الدم، والجودة.",
    keywords: ["مختبرات طبية", "تحاليل", "تشخيص", "بنك دم", "أحياء دقيقة", "مختبر طبي"],
    synonyms: ["المختبرات الطبية", "علوم المختبرات", "التحاليل الطبية"],
    related: ["biology", "chemistry"],
    sectors: ["الصحة", "المستشفيات", "المختبرات الخاصة"],
    productCategory: "medical",
  },
  {
    slug: "accounting",
    nameAr: "المحاسبة",
    nameEn: "Accounting",
    blurb: "المحاسبة، المراجعة، الزكاة والضريبة، المالية.",
    keywords: ["محاسبة", "مراجعة", "مالية", "زكاة", "ضريبة", "تدقيق", "قيود"],
    synonyms: ["المحاسبة", "محاسب", "مالية"],
    related: ["management", "marketing"],
    sectors: ["المالية", "المراجعة", "البنوك", "الشركات"],
  },
  {
    slug: "management",
    nameAr: "الإدارة",
    nameEn: "Business Administration",
    blurb: "الموارد البشرية، العمليات، إدارة المشاريع.",
    keywords: ["إدارة", "موارد بشرية", "عمليات", "مشاريع", "أعمال", "تخطيط"],
    synonyms: ["إدارة أعمال", "الإدارة", "إداري"],
    related: ["marketing", "accounting", "psychology"],
    sectors: ["الشركات", "الموارد البشرية", "القطاع الحكومي"],
  },
  {
    slug: "marketing",
    nameAr: "التسويق",
    nameEn: "Marketing",
    blurb: "التسويق الرقمي، المبيعات، إدارة العلامة.",
    keywords: ["تسويق", "تسويق رقمي", "مبيعات", "علامة تجارية", "سوشيال ميديا", "إعلان"],
    synonyms: ["التسويق", "تسويق رقمي", "ماركتنق"],
    related: ["management", "computer"],
    sectors: ["التسويق", "التجزئة", "الإعلام", "التجارة الإلكترونية"],
  },
  {
    slug: "computer",
    nameAr: "الحاسب الآلي",
    nameEn: "Computer Science",
    blurb: "البرمجة، البيانات، الدعم الفني، والأمن.",
    keywords: ["حاسب", "برمجة", "تطوير", "بيانات", "شبكات", "أمن سيبراني", "دعم فني", "تقنية معلومات"],
    synonyms: ["الحاسب الآلي", "علوم الحاسب", "تقنية المعلومات", "IT"],
    related: ["physics", "marketing"],
    sectors: ["التقنية", "البنوك", "الاتصالات", "كل القطاعات"],
  },
  {
    slug: "geography-gis",
    nameAr: "الجغرافيا ونظم المعلومات الجغرافية",
    nameEn: "Geography & GIS",
    blurb: "الخرائط، التخطيط العمراني، الاستشعار، والبيئة.",
    keywords: ["جغرافيا", "نظم معلومات جغرافية", "GIS", "خرائط", "استشعار", "تخطيط عمراني", "مساحة"],
    synonyms: ["الجغرافيا", "نظم المعلومات الجغرافية", "GIS"],
    related: ["computer", "physics"],
    sectors: ["التخطيط العمراني", "البلديات", "البيئة", "البنية التحتية"],
    productCategory: "geo",
  },
];

export function getSeedMajorBySlug(slug: string): Major | undefined {
  return SEED_MAJORS.find((m) => m.slug === slug);
}
