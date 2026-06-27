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
  if (!parsed.success) {
    // Surface variable NAMES and validation messages only — these never contain
    // secret values (zod messages are generic; custom messages name vars only).
    const flat = parsed.error.flatten();
    const fieldMsgs = Object.entries(flat.fieldErrors)
      .map(([k, msgs]) => `${k}: ${(msgs ?? []).join("; ")}`)
      .join(" | ");
    const formMsgs = flat.formErrors.join("; ");
    const detail = [fieldMsgs, formMsgs].filter(Boolean).join(" | ");
    throw new Error(`Invalid environment configuration — ${detail}`);
  }
  return parsed.data;
}

export const env = readServerEnv();

export const isSupabaseConfigured =
  Boolean(env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const hasServiceRole = Boolean(env.SUPABASE_SERVICE_ROLE_KEY);
