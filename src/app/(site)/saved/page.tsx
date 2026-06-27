import type { Metadata } from "next";
import { Bookmark } from "lucide-react";
import { SavedJobsList } from "@/components/jobs/saved-jobs-list";

export const metadata: Metadata = {
  title: "وظائفي المحفوظة",
  description: "الوظائف التي حفظتها للرجوع إليها والتقديم لاحقًا.",
};

// Public page — saved jobs live in the browser (demo). When Supabase is enabled
// they sync to the signed-in account (see ENVIRONMENT_KEYS_REQUIRED.md).
export default function SavedPage() {
  return (
    <div className="container py-12">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <Bookmark className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-navy">وظائفي المحفوظة</h1>
          <p className="text-sm text-navy/55">
            محفوظة في متصفّحك الآن — وتُربط بحسابك عند تفعيل الحسابات.
          </p>
        </div>
      </div>
      <SavedJobsList />
    </div>
  );
}
