"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useSavedJobs, type SavedJob } from "@/lib/jobs/use-saved-jobs";
import { toggleSavedJobAction } from "@/app/(site)/jobs-actions";

// Toggle a job's saved state. Updates localStorage instantly (works without
// auth/keys), and ALSO persists to the account in the background when signed in
// (the server action is a no-op for anonymous users). Errors are swallowed.
export function SaveJobButton({ job }: { job: SavedJob }) {
  const { isSaved, toggle, ready } = useSavedJobs();
  const active = ready && isSaved(job.id);

  function onToggle() {
    const willSave = !active;
    toggle(job); // optimistic local update
    void toggleSavedJobAction(job, willSave).catch(() => {});
  }

  return (
    <button
      type="button"
      onClick={onToggle}
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
