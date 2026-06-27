import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Briefcase, BookOpen } from "lucide-react";
import { JobCard } from "@/components/jobs/job-card";
import { getMatchedJobs } from "@/lib/data/jobs";
import { getMajor } from "@/lib/data/majors";
import { getPublicProducts } from "@/lib/data/products";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const major = await getMajor(params.slug);
  if (!major) return { title: "تخصص غير موجود" };
  return {
    title: `${major.nameAr} — الوظائف والتوجيه`,
    description: `فرص وظيفية مناسبة لتخصص ${major.nameAr}، مع شرح سبب ظهور كل وظيفة والمهارات والدورات التي تقوّي فرصتك.`,
  };
}

export default async function MajorHubPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getMatchedJobs(params.slug);
  if (!data) notFound();
  const { major, matches } = data;

  // Related store guides for this major (best-effort; never blocks the page).
  let relatedProducts: { slug: string; title: string }[] = [];
  try {
    if (major.productCategory) {
      const products = await getPublicProducts();
      relatedProducts = products
        .filter((p) => p.category === major.productCategory)
        .map((p) => ({ slug: p.slug, title: p.title }));
    }
  } catch {
    relatedProducts = [];
  }

  const saveHref = `/auth/login?next=${encodeURIComponent(`/majors/${major.slug}`)}`;

  return (
    <>
      <section className="border-b border-navy/10 bg-offwhite">
        <div className="container py-10 md:py-12">
          <Link
            href="/majors"
            className="inline-flex items-center gap-1 text-sm font-semibold text-navy/55 hover:text-navy"
          >
            <ArrowRight className="h-4 w-4" /> كل التخصصات
          </Link>
          <h1 className="mt-4 font-display text-3xl font-extrabold text-navy md:text-4xl">
            {major.nameAr}
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-8 text-navy/65">
            {major.blurb}
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-teal-700 shadow-card">
            <Briefcase className="h-4 w-4" />
            {matches.length} فرصة مناسبة لك الآن
          </div>
        </div>
      </section>

      <div className="container grid gap-8 py-12 lg:grid-cols-[1fr_300px]">
        {/* Jobs */}
        <div className="min-w-0 space-y-5">
          {matches.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-navy/15 bg-offwhite p-10 text-center text-sm text-navy/60">
              لا توجد وظائف مطابقة حاليًا. تُحدَّث الفرص باستمرار — أنشئ حسابًا
              لتصلك التنبيهات عند نزول وظائف جديدة لتخصصك.
            </p>
          ) : (
            matches.map((m) => (
              <JobCard key={m.job.id} match={m} major={major} saveHref={saveHref} />
            ))
          )}
        </div>

        {/* Sidebar: related guides + alerts CTA */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {relatedProducts.length > 0 && (
            <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-card">
              <p className="flex items-center gap-1.5 text-sm font-bold text-navy">
                <BookOpen className="h-4 w-4 text-teal-700" /> أدلة مهنية لتخصصك
              </p>
              <ul className="mt-3 space-y-2">
                {relatedProducts.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/products/${p.slug}`}
                      className="text-sm font-medium text-teal-700 hover:text-teal-600"
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-2xl border border-navy/10 bg-navy p-6 text-white">
            <p className="font-bold">تنبيهات الوظائف</p>
            <p className="mt-2 text-sm leading-7 text-white/75">
              أنشئ حسابك ليصلك تنبيه عند نزول وظائف جديدة مناسبة لتخصص{" "}
              {major.nameAr}.
            </p>
            <Link
              href={`/auth/signup`}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-white px-5 text-sm font-bold text-navy hover:bg-white/90"
            >
              إنشاء حساب
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
