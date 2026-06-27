// Shared helpers for the backend scripts. Server/CLI context ONLY — these read
// the service-role key and must never be imported by application/client code.
import { createClient } from "@supabase/supabase-js";

export function readEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    service: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    bucket: process.env.SUPABASE_PRIVATE_BUCKET ?? "product-files",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    expiry: Number(process.env.DOWNLOAD_URL_EXPIRY_SECONDS ?? "120"),
  };
}

// True only when the public Supabase pair is present.
export function hasPublic(env) {
  return Boolean(env.url && env.anon);
}

// Throws (without printing the key) when the service role is missing.
export function requireService(env) {
  if (!env.service) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Run with: node --env-file=.env.local <script>",
    );
  }
}

export function adminClient(env) {
  requireService(env);
  return createClient(env.url, env.service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function anonClient(env) {
  if (!hasPublic(env)) throw new Error("Supabase public env is not set.");
  return createClient(env.url, env.anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Console helpers — never print secret values.
export const log = {
  pass: (m) => console.log(`PASS  ${m}`),
  fail: (m) => console.log(`FAIL  ${m}`),
  info: (m) => console.log(`·     ${m}`),
  head: (m) => console.log(`\n=== ${m} ===`),
};

// Mask a key for display: show only length, never the value.
export function masked(value) {
  return value ? `set (${value.length} chars)` : "missing";
}
