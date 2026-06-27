import { z } from "zod";

// Centralized, validated access to environment variables. Secrets are only ever
// read on the server. `isSupabaseConfigured` lets the app degrade gracefully to
// seed content when no backend is wired up yet.

// Treat empty-string env vars (e.g. a blank `KEY=` line in .env.local) as unset,
// so a template file with blank secrets is safe and does not fail validation.
function cleanEnv(source: NodeJS.ProcessEnv): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(source)) {
    out[k] = v === "" ? undefined : v;
  }
  return out;
}

const serverSchema = z
  .object({
    NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
    SUPABASE_PRIVATE_BUCKET: z.string().min(1).default("product-files"),
    DOWNLOAD_URL_EXPIRY_SECONDS: z.coerce.number().int().positive().default(120),
    PAYMENT_PROVIDER: z
      .enum(["mock", "moyasar", "hyperpay", "paytabs"])
      .default("mock"),
    PAYMENT_WEBHOOK_SECRET: z.string().optional(),
  })
  // Supabase is all-or-nothing. A PARTIAL configuration is always a mistake and
  // must fail loudly rather than silently half-working. Full absence is allowed
  // (the app degrades to public seed content); full presence enables the backend.
  .superRefine((val, ctx) => {
    const hasUrl = Boolean(val.NEXT_PUBLIC_SUPABASE_URL);
    const hasAnon = Boolean(val.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const hasService = Boolean(val.SUPABASE_SERVICE_ROLE_KEY);

    if (hasUrl !== hasAnon) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set together.",
        path: ["NEXT_PUBLIC_SUPABASE_URL"],
      });
    }
    if (hasService && (!hasUrl || !hasAnon)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "SUPABASE_SERVICE_ROLE_KEY requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        path: ["SUPABASE_SERVICE_ROLE_KEY"],
      });
    }
    // In production, a configured Supabase MUST include the service role, or
    // checkout/downloads/admin fulfillment would silently fail at runtime.
    if (process.env.NODE_ENV === "production" && hasUrl && !hasService) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Production with Supabase requires SUPABASE_SERVICE_ROLE_KEY.",
        path: ["SUPABASE_SERVICE_ROLE_KEY"],
      });
    }
  });

function readServerEnv() {
  const parsed = serverSchema.safeParse(cleanEnv(process.env));
  if (parsed.success) return parsed.data;

  // RESILIENCE: an env mistake (e.g. a URL pasted without "https://", or a
  // partial Supabase config) must NEVER crash the whole app into a blank/500
  // page. Surface variable NAMES + messages only (never secret values) for the
  // owner to see in the host logs, then fall back to a SAFE seed-only config so
  // the public site keeps rendering. Supabase/payment features stay disabled
  // until the configuration is corrected and the app is redeployed.
  const flat = parsed.error.flatten();
  const fieldMsgs = Object.entries(flat.fieldErrors)
    .map(([k, msgs]) => `${k}: ${(msgs ?? []).join("; ")}`)
    .join(" | ");
  const detail = [fieldMsgs, flat.formErrors.join("; ")]
    .filter(Boolean)
    .join(" | ");
  console.error(
    `Invalid environment configuration — running in SAFE SEED MODE until fixed. ${detail}`,
  );

  // Salvage a valid site URL if present; drop everything else to defaults — a
  // configuration that always parses (no Supabase, mock payment).
  const siteUrl = z.string().url().safeParse(process.env.NEXT_PUBLIC_SITE_URL);
  return serverSchema.parse(
    siteUrl.success ? { NEXT_PUBLIC_SITE_URL: siteUrl.data } : {},
  );
}

export const env = readServerEnv();

export const isSupabaseConfigured =
  Boolean(env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const hasServiceRole = Boolean(env.SUPABASE_SERVICE_ROLE_KEY);
