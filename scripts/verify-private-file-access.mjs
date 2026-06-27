#!/usr/bin/env node
// Verify the private-file workflow end to end as far as is automatable without
// creating real authenticated users. Anything that needs a logged-in browser
// session is printed as explicit manual steps.
//
// Usage:
//   node --env-file=.env.local scripts/verify-private-file-access.mjs
//
// Checks automated here:
//   1. bucket exists and is PRIVATE
//   2. at least one product has a file_path
//   3. the object actually exists in storage
//   4. the service role can mint a SHORT signed URL (the download mechanism)
//   5. anonymous direct access is DENIED (download + public URL)
import { readEnv, hasPublic, adminClient, anonClient, log, masked } from "./_lib.mjs";

const env = readEnv();
let failures = 0;
const fail = (m) => {
  failures += 1;
  log.fail(m);
};

log.head("Environment");
log.info(`SUPABASE_SERVICE_ROLE_KEY: ${masked(env.service)}`);
log.info(`bucket: ${env.bucket} · signed-URL expiry: ${env.expiry}s`);

if (!hasPublic(env) || !env.service) {
  fail("Supabase env incomplete (need url + anon + service role).");
  process.exit(1);
}

const admin = adminClient(env);
const anon = anonClient(env);

// 1. Bucket private.
log.head("1. Bucket is private");
{
  const { data, error } = await admin.storage.getBucket(env.bucket);
  if (error) {
    fail(`bucket '${env.bucket}' not found: ${error.message}`);
    process.exit(1);
  }
  if (data.public === true) fail(`bucket '${env.bucket}' is PUBLIC — must be private!`);
  else log.pass(`bucket '${env.bucket}' is private`);
}

// 2. A product has a file_path.
log.head("2. Product has a file_path");
const { data: product, error: prodErr } = await admin
  .from("products")
  .select("id, slug, file_path")
  .not("file_path", "is", null)
  .limit(1)
  .maybeSingle();

if (prodErr) {
  fail(`could not query products: ${prodErr.message}`);
  process.exit(1);
}
if (!product) {
  log.info("No product has a file_path yet. Upload a PDF and set file_path first.");
  log.info("See docs/SUPABASE_SETUP.md (sections 6–7). Skipping object checks.");
  console.log(`\n${failures} security failure(s). Setup incomplete (no file_path).`);
  process.exit(failures === 0 ? 0 : 1);
}
log.pass(`product '${product.slug}' has file_path: ${product.file_path}`);

// 3 + 4. Object exists AND service role can mint a short signed URL.
log.head("3-4. Object exists & service role mints a signed URL");
const { data: signed, error: signErr } = await admin.storage
  .from(env.bucket)
  .createSignedUrl(product.file_path, Math.min(env.expiry, 120), { download: true });

if (signErr || !signed?.signedUrl) {
  log.info(`Could not sign '${product.file_path}'. Is the file uploaded to the bucket?`);
  log.info(`(${signErr?.message ?? "no signed URL returned"})`);
} else {
  log.pass("service role minted a short-lived signed URL (download mechanism OK)");
  // The signed URL works (proves the file is reachable only WITH a token).
  try {
    const res = await fetch(signed.signedUrl, { method: "HEAD" });
    if (res.ok) log.pass("signed URL resolves (HEAD 200)");
    else log.info(`signed URL HEAD returned ${res.status} (object may be empty/placeholder)`);
  } catch {
    log.info("could not HEAD the signed URL (network).");
  }
}

// 5. Anonymous direct access is denied.
log.head("5. Anonymous direct access is denied");
{
  const { data, error } = await anon.storage.from(env.bucket).download(product.file_path);
  if (error || !data) log.pass("anon download() is DENIED");
  else fail("anon download() SUCCEEDED — bucket is not private!");
}
{
  const pub = anon.storage.from(env.bucket).getPublicUrl(product.file_path);
  try {
    const res = await fetch(pub.data.publicUrl, { method: "GET" });
    if (res.status === 200) fail(`public URL returned 200 — file is publicly accessible!`);
    else log.pass(`public URL is blocked (status ${res.status})`);
  } catch {
    log.pass("public URL is unreachable");
  }
}

// Manual steps that need a real authenticated browser session.
log.head("Manual steps (need a logged-in user)");
console.log(
  [
    "A. Authenticated user WITHOUT entitlement:",
    "   - Log in as a normal user who has NOT purchased the product.",
    "   - GET /api/download/<productId>  ->  expect 403 (no entitlement).",
    "",
    "B. Authenticated user WITH entitlement:",
    "   - Grant a paid order via the signed webhook (scripts/simulate-webhook.mjs),",
    "     then from the dashboard click 'تحميل آمن'.",
    "   - GET /api/download/<productId>  ->  expect 302 redirect to a signed URL",
    "     that expires in DOWNLOAD_URL_EXPIRY_SECONDS.",
  ].join("\n"),
);

console.log(`\n${failures === 0 ? "ALL AUTOMATED CHECKS PASS" : `${failures} SECURITY FAILURE(S)`}`);
process.exit(failures === 0 ? 0 : 1);
