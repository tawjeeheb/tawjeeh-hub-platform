import type { Job } from "@/lib/jobs/types";
import type { Major } from "@/lib/majors";

// Smart-guidance layer (rule-based, expandable). Turns a job's required skills
// into concrete upskilling suggestions (courses + certificates). Internal rules
// only — no external AI/keys. The UI/architecture is ready to swap in an AI
// provider later (see ENVIRONMENT_KEYS_REQUIRED.md) without changing callers.

interface SkillRule {
  match: string[]; // skill/keywords that trigger this suggestion
  course?: string;
  cert?: string;
}

const SKILL_RULES: SkillRule[] = [
  { match: ["محاسب", "القيود", "التقارير المالية", "الزكاة", "ضريبة"], course: "أساسيات المحاسبة والتقارير المالية", cert: "SOCPA (الهيئة السعودية للمحاسبين)" },
  { match: ["المراجعة", "التدقيق", "الامتثال"], course: "أساسيات المراجعة الداخلية", cert: "CIA / SOCPA" },
  { match: ["Excel", "إكسل"], course: "إتقان Excel للأعمال" },
  { match: ["التسويق الرقمي", "الحملات", "السوشيال ميديا", "إعلان"], course: "دبلوم التسويق الرقمي", cert: "Google Digital Marketing" },
  { match: ["JavaScript", "React", "HTML", "تطوير", "برمجة"], course: "معسكر تطوير الويب", cert: "Meta Front-End Developer" },
  { match: ["الدعم الفني", "الشبكات", "أنظمة التشغيل"], course: "أساسيات الشبكات والدعم الفني", cert: "CompTIA A+ / Network+" },
  { match: ["تحليل البيانات", "البيانات", "تحليل الأداء"], course: "تحليل البيانات للمبتدئين", cert: "Google Data Analytics" },
  { match: ["ArcGIS", "تحليل مكاني", "الخرائط", "المكانية"], course: "أساسيات نظم المعلومات الجغرافية GIS", cert: "Esri Technical Certification" },
  { match: ["التحاليل المخبرية", "الأحياء الدقيقة", "ضبط الجودة", "SCFHS", "تصنيف"], course: "إدارة جودة المختبرات", cert: "تصنيف الهيئة السعودية للتخصصات الصحية" },
  { match: ["سلامة الأغذية", "السلامة"], course: "السلامة الغذائية HACCP", cert: "HACCP" },
  { match: ["تدريس", "إدارة الصف", "النحو"], course: "مهارات التدريس الحديثة", cert: "الرخصة المهنية للمعلمين" },
  { match: ["التوظيف", "تقييم الأداء", "أنظمة العمل", "موارد بشرية"], course: "أساسيات الموارد البشرية", cert: "aPHRi / SHRM-CP" },
  { match: ["البحث", "التوثيق العلمي", "الفقه"], course: "منهجية البحث العلمي" },
  { match: ["التواصل", "حل المشكلات", "خدمة العملاء", "التنظيم"], course: "مهارات التواصل والمهارات الشخصية" },
];

export interface JobGuidance {
  /** Skills the ad asks for (from the job). */
  requiredSkills: string[];
  /** Courses worth taking to strengthen the application. */
  suggestedCourses: string[];
  /** Professional certificates relevant to this role. */
  suggestedCerts: string[];
  /** Short, honest application tip. */
  tip: string;
}

function uniq(list: string[]): string[] {
  return [...new Set(list.filter(Boolean))];
}

export function guidanceForJob(job: Job, _major?: Major): JobGuidance {
  const courses: string[] = [...job.suggestedCourses];
  const certs: string[] = [...job.suggestedCerts];

  for (const skill of job.skills) {
    for (const rule of SKILL_RULES) {
      if (rule.match.some((m) => skill.includes(m) || m.includes(skill))) {
        if (rule.course) courses.push(rule.course);
        if (rule.cert) certs.push(rule.cert);
      }
    }
  }

  const tip = job.deadline
    ? "قدّم مبكرًا قبل آخر موعد، وخصّص سيرتك الذاتية لمتطلبات الإعلان."
    : "جهّز سيرتك الذاتية وفق المهارات المطلوبة قبل التقديم.";

  return {
    requiredSkills: uniq(job.skills),
    suggestedCourses: uniq(courses),
    suggestedCerts: uniq(certs),
    tip,
  };
}
