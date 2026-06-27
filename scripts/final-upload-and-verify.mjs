#!/usr/bin/env node
// Upload a PDF into the PRIVATE bucket and verify access control end to end.
// Never prints secrets. Never makes the bucket/object public.
//
// Usage:
//   node --env-file=.env.local scripts/final-upload-and-verify.mjs \
//     [storagePath] [localPdfPath]
//
// Defaults:
//   storagePath = products/sharia-islamic-studies-guide.pdf
//   localPdfPath = (none) -> a small PLACEHOLDER pdf is generated and uploaded
//                  (replace later with the real guide via the admin panel).
import { readFileSync } from "node:fs";
import {
  readEnv,
  hasPublic,
  adminClient,
  anonClient,
  log,
  masked,
} from "./_lib.mjs";

const env = readEnv();
const storagePath = process.argv[2] ?? "products/sharia-islamic-studies-guide.pdf";
const localPdf = process.argv[3];

log.head("Environment");
log.info(`bucket: ${env.bucket} · target: ${storagePath}`);
log.info(`SUPABASE_SERVICE_ROLE_KEY: ${masked(env.service)}`);

if (!hasPublic(env) || !env.service) {
  log.fail("Supabase env incomplete (need url + anon + service role).");
  process.exit(1);
}

// Minimal placeholder PDF (clearly a test file — replace with the real guide).
const PLACEHOLDER_PDF = Buffer.from(
  "%PDF-1.4\n" +
    "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
    "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
    "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 144]>>endobj\n" +
    "trailer<</Root 1 0 R>>\n%%EOF\n",
  "utf8",
);

const bytes = localPdf ? readFileSync(localPdf) : PLACEHOLDER_PDF;
if (!localPdf) {
  log.info("No local PDF given — uploading a small PLACEHOLDER for testing.");
}

const admin = adminClient(env);
const anon = anonClient(env);
let failures = 0;
const fail = (m) => {
  failures += 1;
  log.fail(m);
};

// 0. Bucket must be private.
log.head("Verify bucket privacy");
{
  const { data, error } = await admin.storage.getBucket(env.bucket);
  if (error) {
    fail(`bucket '${env.bucket}' not found: ${error.message}`);
    process.exit(1);
  }
  if (data.public === true) {
    fail(`bucket '${env.bucket}' is PUBLIC — refusing to upload. Make it private.`);
    process.exit(1);
  }
  log.pass(`bucket '${env.bucket}' is private`);
}

// 1. Upload (upsert) into the private bucket.
log.head("Upload");
{
  const { error } = await admin.storage
    .from(env.bucket)
    .upload(storagePath, bytes, { contentType: "application/pdf", upsert: true });
  if (error) {
    fail(`upload failed: ${error.message}`);
    process.exit(1);
  }
  log.pass(`uploaded → ${env.bucket}/${storagePath}`);
}

// 2. Service role can mint a short signed URL.
log.head("Signed URL (entitled-download mechanism)");
{
  const { data, error } = await admin.storage
    .from(env.bucket)
    .createSignedUrl(storagePath, Math.min(env.expiry, 120), { download: true });
  if (error || !data?.signedUrl) fail(`could not sign object: ${error?.message}`);
  else log.pass(`signed URL minted (expires in ${Math.min(env.expiry, 120)}s)`);
}

// 3. Anonymous direct access is denied.
log.head("Anonymous access is denied");
{
  const { data, error } = await anon.storage.from(env.bucket).download(storagePath);
  if (error || !data) log.pass("anon download() is DENIED");
  else fail("anon download() SUCCEEDED — bucket not private!");

  const pub = anon.storage.from(env.bucket).getPublicUrl(storagePath);
  try {
    const res = await fetch(pub.data.publicUrl);
    if (res.status === 200) fail("public URL returned 200 — object is public!");
    else log.pass(`public URL blocked (status ${res.status})`);
  } catch {
    log.pass("public URL unreachable");
  }
}

// 4. Confirm a product is linked to this path (read-only).
log.head("Product link");
{
  const { data } = await admin
    .from("products")
    .select("slug, file_path")
    .eq("file_path", storagePath)
    .maybeSingle();
  if (data) log.pass(`product '${data.slug}' is linked to this file_path`);
  else log.info(`No product points to '${storagePath}' yet — link it in /admin/products.`);
}

console.log(`\n${failures === 0 ? "ALL CHECKS PASS" : `${failures} FAILURE(S)`}`);
process.exit(failures === 0 ? 0 : 1);
