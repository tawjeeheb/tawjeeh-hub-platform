import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

// Application-tracking data access (foundation for Phase 9). Per-user via RLS.
// Defensive: never throws. The UI for this lands in a later phase; the table +
// access exist now so persistence is in place.

export type ApplicationStatus =
  | "saved"
  | "applied"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export interface Application {
  jobRef: string;
  title: string;
  employer: string;
  status: ApplicationStatus;
  notes: string | null;
  appliedAt: string | null;
}

export async function getApplications(): Promise<Application[]> {
  try {
    const user = await getSessionUser();
    if (!user) return [];
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error || !data) return [];
    return data.map((r) => ({
      jobRef: String(r.job_ref ?? ""),
      title: String(r.title ?? ""),
      employer: String(r.employer ?? ""),
      status: (r.status ?? "saved") as ApplicationStatus,
      notes: typeof r.notes === "string" ? r.notes : null,
      appliedAt: typeof r.applied_at === "string" ? r.applied_at : null,
    }));
  } catch {
    return [];
  }
}
