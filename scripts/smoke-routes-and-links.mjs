#!/usr/bin/env node
// Store-completion smoke: verifies every public route loads, protected routes
// redirect, SEO files serve, and NO internal link on any public page is dead.
// Needs only a running server (BASE_URL). No keys, prints no secrets.
//
// Usage: BASE_URL=http://localhost:3000 node scripts/smoke-routes-and-links.mjs
const base = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

let fail = 0;
const ok = (m) => console.log(`PASS  ${m}`);
const bad = (m) => {
  fail += 1;
  console.log(`FAIL  ${m}`);
};

async function status(path, redirect = "manual") {
  const res = await fetch(base + path, { redirect });
  return res.status;
}

async function method(path, verb) {
  const res = await fetch(base + path, { method: verb, redirect: "manual" });
  return res.status;
}

async function getRes(path) {
  return fetch(base + path, { redirect: "manual" });
}

const PUBLIC = [
  "/",
  "/about",
  "/products",
  "/products/sharia-islamic-studies-guide",
  "/products/medical-laboratory-sciences-guide",
  "/products/geography-gis-guide",
  "/products/arabic-language-ai-guide",
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/legal/terms",
  "/legal/privacy",
  "/legal/refund",
  "/support",
];
const PROTECTED = ["/dashboard", "/admin", "/admin/products", "/admin/orders"];
const SEO = ["/robots.txt", "/sitemap.xml"];

console.log("=== Public routes (expect 200) ===");
for (const p of PUBLIC) {
  const s = await status(p);
  s === 200 ? ok(`200 ${p}`) : bad(`${s} ${p} (expected 200)`);
}

console.log("\n=== Protected routes (expect 3xx redirect) ===");
for (const p of PROTECTED) {
  const s = await status(p);
  s >= 300 && s < 400 ? ok(`${s} ${p}`) : bad(`${s} ${p} (expected redirect)`);
}

console.log("\n=== SEO files (expect 200) ===");
for (const p of SEO) {
  const s = await status(p);
  s === 200 ? ok(`200 ${p}`) : bad(`${s} ${p}`);
}

console.log("\n=== Unknown product slug renders a graceful not-found (no crash, no leak) ===");
{
  const res = await fetch(base + "/products/this-slug-does-not-exist");
  const html = await res.text();
  const isNotFound = /غير موجود/.test(html);
  const noProductContent = !/اشترِ الآن|فهرس الدليل/.test(html);
  // NOTE: status is a soft-404 (200) because middleware runs on the route — a
  // known Next.js limitation. The body is the correct not-found page with no leak.
  isNotFound && noProductContent
    ? ok(`unknown slug -> not-found page (status ${res.status}, body OK, no leak)`)
    : bad(`unknown slug -> unexpected body (status ${res.status})`);
}

console.log("\n=== API method statuses (no auth/keys) ===");
{
  // checkout: POST-only. GET must be 405; POST without a session must be 401.
  const cGet = await method("/api/checkout", "GET");
  cGet === 405 ? ok(`checkout GET -> 405`) : bad(`checkout GET ${cGet} (expected 405)`);
  const cPost = await method("/api/checkout", "POST");
  cPost === 401 ? ok(`checkout POST (no auth) -> 401`) : bad(`checkout POST ${cPost} (expected 401)`);

  // download: GET-only handler, gated by auth. GET without auth -> 401; POST -> 405.
  const dGet = await method("/api/download/x", "GET");
  dGet === 401 ? ok(`download GET (no auth) -> 401`) : bad(`download GET ${dGet} (expected 401)`);
  const dPost = await method("/api/download/x", "POST");
  dPost === 405 ? ok(`download POST -> 405`) : bad(`download POST ${dPost} (expected 405)`);

  // webhook: POST-only. GET -> 405; POST without a valid signature -> 503 (fail-safe).
  const wGet = await method("/api/webhooks/payment", "GET");
  wGet === 405 ? ok(`webhook GET -> 405`) : bad(`webhook GET ${wGet} (expected 405)`);
  const wPost = await method("/api/webhooks/payment", "POST");
  [400, 401, 503].includes(wPost)
    ? ok(`webhook POST (no signature) -> ${wPost} (rejected)`)
    : bad(`webhook POST ${wPost} (expected 4xx/503)`);

  // payment callback is a stateless redirect — never grants entitlement.
  const cb = await status("/api/payments/callback?order=x&simulate=paid");
  cb >= 300 && cb < 400 ? ok(`callback is stateless redirect (${cb})`) : bad(`callback ${cb}`);
}

console.log("\n=== Open-redirect protection on /auth/login?next= ===");
{
  // An unauthenticated visit must NOT bounce the browser to an external origin,
  // and the server must not emit a Location header pointing off-site. The submit
  // path is sanitized server-side by safeRelativePath(); here we assert the page
  // itself never turns an attacker-supplied ?next into an external redirect.
  // NOTE: this is an end-to-end defense-in-depth check. The authoritative unit
  // coverage of every payload class lives in `npm run test:redirect`.
  for (const evil of [
    "https://evil.example.com",
    "//evil.example.com",
    "/%5Cevil.example.com", // backslash authority
    "https:%2f%2fevil.example.com",
    "/%00//evil.example.com", // NUL then //
    "/%09//evil.example.com", // tab then //
    "%2F%2Fevil.example.com", // encoded //
  ]) {
    const res = await getRes(`/auth/login?next=${encodeURIComponent(evil)}`);
    const loc = res.headers.get("location") ?? "";
    const offSite = /^https?:\/\//i.test(loc) && !loc.startsWith(base);
    const protoRel = loc.startsWith("//");
    !offSite && !protoRel
      ? ok(`next=${evil} -> no off-site redirect (status ${res.status})`)
      : bad(`next=${evil} -> redirected to "${loc}"`);
  }
}

console.log("\n=== Social sign-in (Google/Apple) present on auth pages ===");
{
  for (const p of ["/auth/login", "/auth/signup"]) {
    const html = await (await fetch(base + p)).text();
    const hasGoogle = /بواسطة Google/.test(html);
    const hasApple = /بواسطة Apple/.test(html);
    const hasEmail = /البريد الإلكتروني/.test(html);
    hasGoogle && hasApple && hasEmail
      ? ok(`${p}: Google + Apple + email all present`)
      : bad(`${p}: google=${hasGoogle} apple=${hasApple} email=${hasEmail}`);
  }
}

console.log("\n=== OAuth callback: safe handling + no open redirect ===");
{
  // No code → must redirect back to the login page (never render a session).
  const noCode = await getRes("/auth/callback");
  const loc1 = noCode.headers.get("location") ?? "";
  noCode.status >= 300 && noCode.status < 400 && loc1.includes("/auth/login")
    ? ok(`callback without code -> redirects to login (${noCode.status})`)
    : bad(`callback without code -> ${noCode.status} ${loc1}`);

  // Attacker-supplied external `next` must be neutralized (same-origin only).
  for (const evil of ["https://evil.example.com", "//evil.example.com", "/%5Cevil.example.com"]) {
    const res = await getRes(`/auth/callback?code=x&next=${encodeURIComponent(evil)}`);
    const loc = res.headers.get("location") ?? "";
    const offSite = (/^https?:\/\//i.test(loc) && !loc.startsWith(base)) || loc.startsWith("//");
    !offSite
      ? ok(`callback next=${evil} -> no off-site redirect`)
      : bad(`callback next=${evil} -> redirected to "${loc}"`);
  }
}

console.log("\n=== Coming-soon products are NOT purchasable ===");
{
  // geography-gis-guide is seeded as coming-soon: must show "قيد الإعداد"
  // and expose no purchase CTA. An available product must expose the CTA.
  const soon = await (await fetch(base + "/products/geography-gis-guide")).text();
  const soonLabeled = /قيد الإعداد/.test(soon);
  const soonNoBuy = !/اشترِ الآن/.test(soon);
  soonLabeled && soonNoBuy
    ? ok(`coming-soon product: labeled "قيد الإعداد", no buy CTA`)
    : bad(`coming-soon product: labeled=${soonLabeled} noBuy=${soonNoBuy}`);

  const live = await (await fetch(base + "/products/sharia-islamic-studies-guide")).text();
  /اشترِ الآن/.test(live)
    ? ok(`available product: exposes buy CTA`)
    : bad(`available product: missing buy CTA`);
}

console.log("\n=== Draft/archived products are NOT public ===");
{
  const HIDDEN = [
    "draft-civil-engineering-guide",
    "archived-legacy-accounting-guide",
  ];

  // (a) hidden slugs must render the graceful not-found page, never the product.
  for (const slug of HIDDEN) {
    const html = await (await fetch(base + `/products/${slug}`)).text();
    const isNotFound = /غير موجود/.test(html);
    const noProduct = !/فهرس الدليل|اشترِ الآن/.test(html);
    isNotFound && noProduct
      ? ok(`hidden product ${slug} -> not-found (no leak)`)
      : bad(`hidden product ${slug} -> exposed`);
  }

  // (b) the public catalog HTML must not mention hidden slugs.
  const catalog = await (await fetch(base + "/products")).text();
  const inCatalog = HIDDEN.filter((s) => catalog.includes(s));
  inCatalog.length === 0
    ? ok(`catalog hides draft/archived`)
    : bad(`catalog leaks hidden slugs: ${inCatalog.join(", ")}`);

  // (c) the sitemap must not list hidden slugs.
  const sitemap = await (await fetch(base + "/sitemap.xml")).text();
  const inSitemap = HIDDEN.filter((s) => sitemap.includes(s));
  inSitemap.length === 0
    ? ok(`sitemap hides draft/archived`)
    : bad(`sitemap leaks hidden slugs: ${inSitemap.join(", ")}`);
}

// Crawl internal links on every public page; every target must NOT 404/500.
console.log("\n=== Dead-link crawl on public pages ===");
const seen = new Map();
for (const p of PUBLIC) {
  const html = await (await fetch(base + p)).text();
  const hrefs = [...html.matchAll(/href="(\/[^"#?]*)/g)].map((m) => m[1]);
  const internal = [...new Set(hrefs)].filter(
    (h) => !h.startsWith("/_next") && !h.startsWith("/api"),
  );
  for (const h of internal) {
    if (!seen.has(h)) seen.set(h, await status(h, "follow"));
    const s = seen.get(h);
    if (s >= 400) bad(`dead link ${h} (${s}) found on ${p}`);
  }
}
console.log(`checked ${seen.size} unique internal links`);
const dead = [...seen.entries()].filter(([, s]) => s >= 400);
if (dead.length === 0) ok("no dead internal links");

// Security: file_path must never appear in public HTML.
console.log("\n=== Security: file_path not exposed ===");
{
  let leaked = false;
  for (const p of ["/", "/products", "/products/sharia-islamic-studies-guide"]) {
    const html = await (await fetch(base + p)).text();
    if (/file_path|products\/[a-z-]+\.pdf/.test(html)) leaked = true;
  }
  leaked ? bad("file_path / .pdf path found in public HTML!") : ok("no file_path in public HTML");
}

console.log(`\n${fail === 0 ? "ALL PASS — store basics green" : `${fail} FAILURE(S)`}`);
process.exit(fail === 0 ? 0 : 1);
