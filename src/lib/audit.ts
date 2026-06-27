import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasServiceRole, isSupabaseConfigured } from "@/lib/env";
import type { AuditAction } from "@/lib/types";

interface AuditEntry {
  actorId: string | null;
  action: AuditAction;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
}

// Records a security-relevant event in the audit_logs table. Best-effort: a
// logging failure must never break the user-facing operation, and we never
// throw secrets up the stack.
export async function recordAudit(entry: AuditEntry): Promise<void> {
  if (!isSupabaseConfigured || !hasServiceRole) {
    // No backend wired yet — surface in server logs without leaking details.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[audit] ${entry.action}`, {
        entityId: entry.entityId ?? null,
      });
    }
    return;
  }

  try {
    const admin = createSupabaseAdminClient();
    await admin.from("audit_logs").insert({
      actor_id: entry.actorId,
      action: entry.action,
      entity_type: entry.entityType ?? null,
      entity_id: entry.entityId ?? null,
      metadata: entry.metadata ?? null,
    });
  } catch {
    // Swallow — auditing is non-blocking and must not expose internals.
    console.error("[audit] failed to record event:", entry.action);
  }
}
