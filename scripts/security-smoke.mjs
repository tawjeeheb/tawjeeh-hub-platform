#!/usr/bin/env node
// Security baseline smoke test. Boots against an already-running server and
// asserts the public/protected/endpoint behaviors required by the security
// baseline. Exit code is non-zero if any assertion fails.
//
// Usage: BASE_URL=http://localhost:3000 node scripts/security-smoke.mjs
const base = process.env.BASE_URL ?? "http://localhost:3000";

let failures = 0;
function check(name, cond, detail = "") {
  const ok = Boolean(cond);
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
}

async function status(path, opts) {
  const res = await fetch(`${base}${path}`, { redirect: "manual", ...opts });
  return res.status;
}

// 1. Public pages return 200
for (const p of [
  "/",
  "/products",
  "/products/sharia-islamic-studies-guide",
  "/about",
  "/auth/login",
  "/auth/signup",
  "/legal/terms",
  "/legal/privacy",
  "/legal/refund",
]) {
  check(`public 200: ${p}`, (await status(p)) === 200);
}

// 2. Protected dashboard redirects unauthenticated (3xx, not 200)
{
  const s = await status("/dashboard");
  check("dashboard redirects unauthenticated", s >= 300 && s < 400, `status ${s}`);
}

// 3. Admin redirects/rejects non-admin (unauthenticated → redirect)
{
  const s = await status("/admin");
  check("admin redirects unauthenticated", s >= 300 && s < 400, `status ${s}`);
}

// 4. Checkout rejects unauthenticated (401)
{
  const s = await status("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: "11111111-1111-4111-8111-111111111111" }),
  });
  check("checkout rejects unauthenticated", s === 401, `status ${s}`);
}

// 5. Download rejects unauthenticated (401)
{
  const s = await status("/api/download/11111111-1111-4111-8111-111111111111");
  check("download rejects unauthenticated", s === 401, `status ${s}`);
}

// 6. Webhook rejects missing/invalid signature (no fulfillment): 400/401/503
{
  const s = await status("/api/webhooks/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: "x", status: "paid" }),
  });
  check("webhook rejects bad/missing signature", [400, 401, 503].includes(s), `status ${s}`);
}

// 7. Payment callback never marks paid (pure redirect, no state change)
{
  const s = await status(
    "/api/payments/callback?order=11111111-1111-4111-8111-111111111111&simulate=paid",
  );
  check("callback is a stateless redirect", s >= 300 && s < 400, `status ${s}`);
}

// 8. Security headers exist
{
  const res = await fetch(`${base}/`);
  const need = [
    "content-security-policy",
    "x-frame-options",
    "x-content-type-options",
    "referrer-policy",
    "strict-transport-security",
  ];
  for (const h of need) check(`header present: ${h}`, res.headers.get(h));
}

console.log(`\n${failures === 0 ? "ALL PASS" : `${failures} FAILURE(S)`}`);
process.exit(failures === 0 ? 0 : 1);
