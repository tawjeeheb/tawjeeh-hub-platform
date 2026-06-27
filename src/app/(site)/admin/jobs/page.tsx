import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { getJobs } from "@/lib/data/jobs";
import { runIngestion } from "@/lib/jobs/ingestion";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "الوظائف — الإدارة" };

const VERIFICATION: Record<string, { label: string; variant: "available" | "coming" | "neutral" }> = {
  verified: { label: "موثّقة", variant: "available" },
  unverified: { label: "غير موثّقة", variant: "coming" },
  expired: { label: "منتهية", variant: "neutral" },
};

// Initial jobs admin panel (read-only). Lists the current job catalog with its
// classification, and a summary of the ingestion sources. Persisting real
// ingested jobs requires Supabase (see ENVIRONMENT_KEYS_REQUIRED.md).
export default async function AdminJobsPage() {
  const jobs = await getJobs();
  let sources: { id: string; label: string; fetched: number; skipped: boolean }[] = [];
  try {
    sources = (await runIngestion()).bySource;
  } catch {
    sources = [];
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy">الوظائف</h1>

      <div className="mt-4 flex flex-wrap gap-3">
        <div className="rounded-2xl border border-navy/10 bg-white px-5 py-4">
          <div className="text-2xl font-extrabold text-navy">{jobs.length}</div>
          <div className="text-xs text-navy/55">وظيفة في الكتالوج</div>
        </div>
        <div className="rounded-2xl border border-navy/10 bg-white px-5 py-4">
          <div className="text-2xl font-extrabold text-navy">
            {jobs.filter((j) => j.acceptsAllMajors).length}
          </div>
          <div className="text-xs text-navy/55">تقبل كل التخصصات</div>
        </div>
        <div className="rounded-2xl border border-navy/10 bg-white px-5 py-4">
          <div className="text-2xl font-extrabold text-navy">{sources.length}</div>
          <div className="text-xs text-navy/55">مصادر السحب</div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-navy/10 bg-offwhite p-4 text-sm leading-7 text-navy/70">
        السحب الحقيقي للوظائف يتطلب مصادر خارجية + تخزين Supabase (مؤجَّل، انظر{" "}
        <code className="rounded bg-white px-1.5 py-0.5">ENVIRONMENT_KEYS_REQUIRED.md</code>).
        الكتالوج الحالي بيانات seed. تشغيل تجريبي: <code className="rounded bg-white px-1.5 py-0.5">npm run jobs:ingest</code>.
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-navy/10 bg-white">
        <table className="w-full min-w-[760px] text-right text-sm">
          <thead className="bg-offwhite text-navy/60">
            <tr>
              <th className="px-5 py-3 font-semibold">المسمى / الجهة</th>
              <th className="px-5 py-3 font-semibold">المدينة</th>
              <th className="px-5 py-3 font-semibold">التخصصات المقبولة</th>
              <th className="px-5 py-3 font-semibold">المصدر</th>
              <th className="px-5 py-3 font-semibold">الحالة</th>
              <th className="px-5 py-3 font-semibold">النشر</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/10">
            {jobs.map((job) => {
              const v = VERIFICATION[job.verification] ?? VERIFICATION.unverified!;
              return (
                <tr key={job.id}>
                  <td className="px-5 py-4">
                    <div className="font-medium text-navy">{job.title}</div>
                    <div className="text-xs text-navy/50">{job.employer}</div>
                  </td>
                  <td className="px-5 py-4 text-navy/70">{job.city}</td>
                  <td className="px-5 py-4 text-navy/70">
                    {job.acceptsAllMajors
                      ? "كل التخصصات"
                      : job.acceptedMajors.join("، ") || "—"}
                  </td>
                  <td className="px-5 py-4 text-navy/60">{job.source}</td>
                  <td className="px-5 py-4">
                    <Badge variant={v.variant}>{v.label}</Badge>
                  </td>
                  <td className="px-5 py-4 text-navy/55">{formatDate(job.postedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
