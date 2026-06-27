"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useSavedJobs, type SavedJob } from "@/lib/jobs/use-saved-jobs";

// Toggle a job in the local saved list. Works without auth/keys (demo mode).
export function SaveJobButton({ job }: { job: SavedJob }) {
  const { isSaved, toggle, ready } = useSavedJobs();
  const active = ready && isSaved(job.id);

  return (
    <button
      type="button"
      onClick={() => toggle(job)}
      aria-pressed={active}
      className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors ${
        active
          ? "border-teal-600/40 bg-teal-50 text-teal-700"
          : "border-navy/15 text-navy/70 hover:bg-navy-50"
      }`}
    >
      {active ? (
        <>
          <BookmarkCheck className="h-4 w-4" /> محفوظة
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" /> حفظ الوظيفة
        </>
      )}
    </button>
  );
}
