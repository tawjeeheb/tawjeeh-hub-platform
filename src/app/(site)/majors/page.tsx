import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Briefcase } from "lucide-react";
import { Stamp, ClassDots } from "@/components/brand/studio";
import { getMajors } from "@/lib/data/majors";
import { getMajorJobCounts } from "@/lib/data/jobs";

export const metadata: Metadata = {
  title: "التخصصات — اختر تخصصك",
  description:
    "اختر تخصصك لترى الفرص المهنية المناسبة لك اليوم: وظائف تقبل تخصصك أو تخصصات قريبة أو جميع التخصصات، مع توجيه للمهارات والدورات.",
};

// Pure presentation from seed data — cannot fail to a 500.
export default async function MajorsPage() {
  const majors = await getMajors();
  const counts = await getMajorJobCounts();

  return (
    <>
      <section className="relative overflow-hidden border-b border-navy/10 bg-offwhite">
        <div className="guidance-grid absolute inset-0 opacity-50" />
        <div className="container relative py-14 md:py-16">
          <Stamp label="مركز توجيه" tone="teal" className="bg-white shadow-card" />
          <h1 className="mt-5 max-w-2xl text-balance font-display text-3xl font-extrabold text-navy md:text-[2.6rem]">
            اختر تخصصك، وشاهد فرصك المهنية اليوم
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-8 text-navy/65">
            لا تبحث في عشرات المنصات. اضغط تخصصك لترى الوظائف المناسبة لك فقط —
            مع شرح واضح لسبب ظهور كل وظيفة، والمهارات والدورات التي تقوّي فرصتك.
          </p>
          <ClassDots className="mt-6" />
        </div>
      </section>

      <div className="container py-12">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {majors.map((m) => (
            <Link
              key={m.slug}
              href={`/majors/${m.slug}`}
              className="group flex flex-col rounded-2xl border border-navy/10 bg-white p-6 shadow-card transition-colors hover:border-teal-600/40"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold text-navy">{m.nameAr}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">
                  <Briefcase className="h-3.5 w-3.5" />
                  {counts[m.slug] ?? 0}
                </span>
              </div>
              <p className="mt-2 text-sm leading-7 text-navy/60">{m.blurb}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {m.sectors.slice(0, 3).map((s) => (
                  <span
                    key={s}
                    className="rounded-lg bg-navy-50 px-2 py-0.5 text-[11px] font-medium text-navy/70"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
                عرض الوظائف والتوجيه
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
