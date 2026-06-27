#!/usr/bin/env node
// Backend readiness check. Verifies a real Supabase project is wired correctly
// and that the security-critical invariants hold. Read-only; safe to re-run.
//
// Usage:
//   node --env-file=.env.local scripts/backend-readiness.mjs
//
// Exit code is non-zero if any check fails.
import {
  readEnv,
  hasPublic,
  adminClient,
  anonClient,
  log,
  masked,
} from "./_lib.mjs";

const env = readEnv();
let failures = 0;
const fail = (m) => {
  failures += 1;
  log.fail(m);
};

log.head("Environment");
log.info(`NEXT_PUBLIC_SUPABASE_URL: ${env.url ? "set" : "missing"}`);
log.info(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${masked(env.anon)}`);
log.info(`SUPABASE_SERVICE_ROLE_KEY: ${masked(env.service)}`);
log.info(`SUPABASE_PRIVATE_BUCKET: ${env.bucket}`);

if (!hasPublic(env) || !env.service) {
  fail("Supabase env incomplete (need url + anon + service role). Not ready.");
  console.log(`\n${failures} FAILURE(S) — NOT READY`);
  process.exit(1);
}
if (env.service === env.anon) {
  fail("Service-role key equals anon key — misconfiguration.");
}

const admin = adminClient(env);
const anon = anonClient(env);

// 1. Connection + required tables.
log.head("Connection & schema");
const TABLES = ["profiles", "products", "orders", "entitlements", "downloads", "audit_logs"];
for (const t of TABLES) {
  const { error } = await admin.from(t).select("*", { count: "exact", head: true });
  if (error) fail(`table missing/unreadable: ${t} (${error.message})`);
  else log.pass(`table present: ${t}`);
}

// 2. Public-safe products: allowed columns readable by anon.
log.head("Products public-safe read");
{
  const { error } = await anon.from("products").select("id, slug, title, price_sar, status").limit(1);
  if (error) fail(`anon cannot read public product columns: ${error.message}`);
  else log.pass("anon can read public product columns");
}

// 3. file_path must NOT be selectable by anon (column-level grant).
{
  const { data, error } = await anon.from("products").select("file_path").limit(1);
  if (error) log.pass("anon is DENIED products.file_path (column-level lock works)");
  else if (Array.isArray(data) && data.every((r) => r.file_path === undefined))
    log.pass("anon receives no file_path value");
  else fail("anon CAN read products.file_path — column lock missing!");
}

// 4. Storage bucket is private.
log.head("Storage");
{
  const { data, error } = await admin.storage.getBucket(env.bucket);
  if (error) fail(`bucket '${env.bucket}' not found: ${error.message}`);
  else if (data?.public === true) fail(`bucket '${env.bucket}' is PUBLIC — must be private!`);
  else log.pass(`bucket '${env.bucket}' is private`);
}

// 5. RLS blocks anon from reading user-scoped tables (no auth.uid → 0 rows).
log.head("RLS isolation (anon)");
for (const t of ["orders", "entitlements", "downloads", "audit_logs"]) {
  const { data, error } = await anon.from(t).select("id").limit(1);
  // Either an explicit error or zero rows is acceptable (deny). Rows = leak.
  if (error) log.pass(`anon denied on ${t}`);
  else if (Array.isArray(data) && data.length === 0) log.pass(`anon sees 0 rows in ${t}`);
  else fail(`anon CAN read rows from ${t} — RLS too permissive!`);
}

console.log(`\n${failures === 0 ? "ALL PASS — BACKEND READY" : `${failures} FAILURE(S) — NOT READY`}`);
process.exit(failures === 0 ? 0 : 1);
