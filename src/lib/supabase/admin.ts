import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env, hasServiceRole, isSupabaseConfigured } from "@/lib/env";

// Service-role client. SERVER ONLY — bypasses RLS. Use exclusively for trusted
// server operations: webhook fulfillment, signing private download URLs, and
// admin actions that have already been authorized in application code.
//
// Importing this into client code would leak the service-role key, so this file
// must never be referenced from a "use client" module.
export function createSupabaseAdminClient() {
  if (!isSupabaseConfigured || !hasServiceRole) {
    throw new Error("Supabase service role is not configured.");
  }
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
