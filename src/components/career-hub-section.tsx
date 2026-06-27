import Link from "next/link";
import {
  Compass,
  Briefcase,
  GraduationCap,
  BadgeCheck,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { getMajors } from "@/lib/data/majors";
import { getLatestJobs } from "@/lib/data/jobs";

// The "مركز توجيه" core band: pick your major → see today's matching jobs →
// guidance (job → skill → course → certificate). Seed-driven; never fails.
const FLOW = [
  { icon: Briefcase, label: "الوظيفة المناسبة" },
  { icon: Compass, label: "المهارات المطلوبة" },
  { icon: GraduationCap, label: "الدورات المقترحة" },
  { icon: BadgeCheck, label: "الشهادات المهنية" },
];

export async function CareerHubSection() {
  const majors = await getMajors();
  const latest = await getLatestJobs(3);

  return (
    <Section bordered>
      <SectionHeading
        index="٠١"
        eyebrow="ابحث عن فرص تخصصك اليوم"
        title="اختر تخصصك، ودع مركز توجيه يجمع لك الفرص"
        subtitle="وظائف مناسبة لتخصصك، مع توجيه ذكي للمهارات والدورات والشهادات — في مكان واحد."
      />

      {/* Major picker */}
      <div className="mt-10 flex flex-wrap gap-2.5">
        {majors.map((m) => (
          <Link
            key={m.slug}
            href={`/majors/${m.slug}`}
            className="rounded-full border border-navy/15 bg-white px-4 py-2 text-sm font-semibold text-navy/80 transition-colors hover:border-teal-600/50 hover:text-teal-700"
          >
            {m.nameAr}
          </Link>
        ))}
        <Link
          href="/majors"
          className="inline-flex items-center gap-1 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700"
        >
          كل التخصصات <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Latest jobs teaser */}
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold text-navy">
              <Briefcase className="h-4 w-4 text-teal-700" /> أحدث الوظائف المناسبة
            </h3>
            <Link href="/majors" className="text-sm font-semibold text-teal-700 hover:text-teal-600">
              عرض الكل
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-navy/10">
            {latest.map((job) => (
              <li key={job.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-navy">{job.title}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-navy/55">
                    <MapPin className="h-3 w-3" /> {job.employer} · {job.city}
                  </p>
                </div>
                <Link
                  href="/majors"
                  className="shrink-0 rounded-lg bg-navy-50 px-3 py-1.5 text-xs font-semibold text-navy/80 hover:bg-navy-100"
                >
                  استعراض
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Smart-guidance explainer */}
        <div className="rounded-2xl border border-navy/10 bg-navy p-6 text-white">
          <h3 className="font-bold">توجيه ذكي لكل وظيفة</h3>
          <p className="mt-2 text-sm leading-7 text-white/70">
            لا نعرض الوظيفة فقط — نوضّح لك لماذا تناسبك، وما المهارات الناقصة، وما
            الدورات والشهادات التي تقوّي فرصتك.
          </p>
          <ul className="mt-5 space-y-3">
            {FLOW.map((f) => (
              <li key={f.label} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-teal-100">
                  <f.icon className="h-4 w-4" />
                </span>
                {f.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
