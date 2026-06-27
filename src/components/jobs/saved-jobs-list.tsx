"use client";

import Link from "next/link";
import { Building2, MapPin, ExternalLink, Trash2, Bookmark } from "lucide-react";
import { useSavedJobs } from "@/lib/jobs/use-saved-jobs";

export function SavedJobsList() {
  const { saved, remove, ready } = useSavedJobs();

  if (!ready) {
    return <p className="text-sm text-navy/50">جارٍ تحميل وظائفك المحفوظة…</p>;
  }

  if (saved.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-navy/15 bg-offwhite p-10 text-center">
        <Bookmark className="mx-auto h-8 w-8 text-navy/30" />
        <p className="mt-3 text-sm text-navy/60">
          لم تحفظ أي وظيفة بعد. تصفّح وظائف تخصصك واضغط «حفظ الوظيفة».
        </p>
        <Link
          href="/majors"
          className="mt-5 inline-flex h-10 items-center rounded-xl bg-navy px-5 text-sm font-bold text-white hover:bg-navy-700"
        >
          تصفّح التخصصات
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-navy/55">{saved.length} وظيفة محفوظة</p>
      {saved.map((job) => (
        <article
          key={job.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-navy/10 bg-white p-5 shadow-card"
        >
          <div className="min-w-0">
            <h3 className="font-bold text-navy">{job.title}</h3>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-navy/55">
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" /> {job.employer}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {job.city}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-teal px-4 text-sm font-semibold text-white hover:bg-teal-700"
            >
              التقديم <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={() => remove(job.id)}
              aria-label="إزالة من المحفوظات"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-navy/15 text-navy/50 hover:bg-plum-50 hover:text-plum-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
