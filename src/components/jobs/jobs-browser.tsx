"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { JobCard } from "@/components/jobs/job-card";
import type { MatchedJob } from "@/lib/jobs/types";
import type { Major } from "@/lib/majors";

const WORK_MODES = [
  { value: "all", label: "كل الأنماط" },
  { value: "onsite", label: "حضوري" },
  { value: "remote", label: "عن بُعد" },
  { value: "hybrid", label: "هجين" },
];

const FITS = [
  { value: "all", label: "كل المناسبة" },
  { value: "high", label: "مناسبة عالية" },
  { value: "open", label: "تقبل كل التخصصات" },
];

// Client-side search + filter over the (already matched) jobs for a major.
export function JobsBrowser({
  matches,
  major,
}: {
  matches: MatchedJob[];
  major: Major;
}) {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("all");
  const [mode, setMode] = useState("all");
  const [fit, setFit] = useState("all");

  const cities = useMemo(
    () => [...new Set(matches.map((m) => m.job.city))].sort(),
    [matches],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return matches.filter(({ job, score }) => {
      if (city !== "all" && job.city !== city) return false;
      if (mode !== "all" && job.workMode !== mode) return false;
      if (fit === "high" && score < 100) return false;
      if (fit === "open" && !job.acceptsAllMajors) return false;
      if (term) {
        const hay = `${job.title} ${job.employer} ${job.city} ${job.skills.join(" ")}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [matches, q, city, mode, fit]);

  const selectCls =
    "h-10 rounded-xl border border-navy/15 bg-white px-3 text-sm text-navy focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20";

  return (
    <div>
      {/* Controls */}
      <div className="rounded-2xl border border-navy/10 bg-white p-4 shadow-card">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/35" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث بالمسمى أو الجهة أو المهارة أو المدينة…"
            className="h-11 w-full rounded-xl border border-navy/15 bg-white pr-10 pl-4 text-sm text-navy placeholder:text-navy/40 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-navy/45">
            <SlidersHorizontal className="h-3.5 w-3.5" /> فلترة
          </span>
          <select value={city} onChange={(e) => setCity(e.target.value)} className={selectCls}>
            <option value="all">كل المدن</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select value={mode} onChange={(e) => setMode(e.target.value)} className={selectCls}>
            {WORK_MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <select value={fit} onChange={(e) => setFit(e.target.value)} className={selectCls}>
            {FITS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-4 text-sm text-navy/55">
        {filtered.length} من {matches.length} وظيفة
      </p>

      <div className="mt-4 space-y-5">
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-navy/15 bg-offwhite p-10 text-center text-sm text-navy/60">
            لا توجد وظائف تطابق بحثك. جرّب تعديل الفلاتر.
          </p>
        ) : (
          filtered.map((m) => <JobCard key={m.job.id} match={m} major={major} />)
        )}
      </div>
    </div>
  );
}
