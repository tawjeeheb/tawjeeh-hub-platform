"use client";

import {
  MapPin,
  Building2,
  CalendarClock,
  ExternalLink,
  Sparkles,
  GraduationCap,
  BadgeCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { fitLabel } from "@/lib/jobs/matching";
import { guidanceForJob } from "@/lib/jobs/guidance";
import { SaveJobButton } from "@/components/jobs/save-job-button";
import type { MatchedJob } from "@/lib/jobs/types";
import type { Major } from "@/lib/majors";

const WORK_MODE: Record<string, string> = {
  onsite: "حضوري",
  remote: "عن بُعد",
  hybrid: "هجين",
  unknown: "غير محدّد",
};

function fitVariant(score: number): "available" | "coming" | "neutral" {
  if (score >= 100) return "available";
  if (score >= 60) return "coming";
  return "neutral";
}

export function JobCard({
  match,
  major,
}: {
  match: MatchedJob;
  major?: Major;
}) {
  const { job, score, reasons } = match;
  const g = guidanceForJob(job, major);

  return (
    <article className="rounded-2xl border border-navy/10 bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-navy">{job.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-navy/60">
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-4 w-4" /> {job.employer}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {job.city}
            </span>
            <span>{WORK_MODE[job.workMode]}</span>
            {job.deadline && (
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="h-4 w-4" /> آخر موعد:{" "}
                {formatDate(job.deadline)}
              </span>
            )}
          </div>
        </div>
        <Badge variant={fitVariant(score)}>{fitLabel(score)}</Badge>
      </div>

      {/* Why it surfaced — transparency */}
      <div className="mt-4 rounded-xl bg-teal-50/60 p-4">
        <p className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
          <Sparkles className="h-3.5 w-3.5" /> لماذا ظهرت لك؟
        </p>
        <ul className="mt-2 space-y-1 text-sm text-navy/75">
          {reasons.map((r, i) => (
            <li key={i}>• {r}</li>
          ))}
        </ul>
      </div>

      {/* Required skills */}
      {g.requiredSkills.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-navy/50">المهارات المطلوبة</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {g.requiredSkills.map((s) => (
              <span
                key={s}
                className="rounded-lg bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy/80"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Guidance: courses + certs */}
      {(g.suggestedCourses.length > 0 || g.suggestedCerts.length > 0) && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {g.suggestedCourses.length > 0 && (
            <div className="rounded-xl border border-navy/10 p-3">
              <p className="flex items-center gap-1.5 text-xs font-bold text-navy">
                <GraduationCap className="h-3.5 w-3.5 text-teal-700" /> لتقوية فرصتك — دورات
              </p>
              <ul className="mt-2 space-y-1 text-sm text-navy/70">
                {g.suggestedCourses.map((c) => (
                  <li key={c}>• {c}</li>
                ))}
              </ul>
            </div>
          )}
          {g.suggestedCerts.length > 0 && (
            <div className="rounded-xl border border-navy/10 p-3">
              <p className="flex items-center gap-1.5 text-xs font-bold text-navy">
                <BadgeCheck className="h-3.5 w-3.5 text-teal-700" /> شهادات مقترحة
              </p>
              <ul className="mt-2 space-y-1 text-sm text-navy/70">
                {g.suggestedCerts.map((c) => (
                  <li key={c}>• {c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <p className="mt-4 text-xs leading-6 text-navy/55">{g.tip}</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
        >
          التقديم <ExternalLink className="h-4 w-4" />
        </a>
        <SaveJobButton
          job={{
            id: job.id,
            title: job.title,
            employer: job.employer,
            city: job.city,
            applyUrl: job.applyUrl,
            majorSlug: major?.slug,
          }}
        />
      </div>
    </article>
  );
}
