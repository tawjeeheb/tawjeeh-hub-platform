#!/usr/bin/env node
// Resilience check: the public site must NEVER return a 5xx, even when Supabase
// is missing, misconfigured, or unreachable. Run it against a server started
// with broken/fake Supabase env to prove the site degrades to "logged out"
// instead of a 500 / blank page.
//
//   # 1) seed mode (no Supabase):
//   npm run start &  BASE_URL=http://localhost:3000 node scripts/check-resilience.mjs
//
//   # 2) wrong/unreachable Supabase (valid format, fake project):
//   NEXT_PUBLIC_SUPABASE_URL=https://fake-xyz.supabase.co \
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=fake_anon \
//   SUPABASE_SERVICE_ROLE_KEY=fake_service \
//   NEXT_PUBLIC_SITE_URL=https://example.onrender.com npm run start &
//   BASE_URL=http://localhost:3000 node scripts/check-resilience.mjs
const base = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

// Public surfaces that must always render (no auth required).
const ROUTES = [
  "/",
  "/majors",
  "/majors/biology",
  "/majors/sharia",
  "/saved",
  "/auth/login",
  "/auth/signup",
  "/products",
  "/products/sharia-islamic-studies-guide",
  "/support",
  "/legal/terms",
  "/robots.txt",
  "/sitemap.xml",
];

let fail = 0;
for (const path of ROUTES) {
  let status = 0;
  try {
    status = (await fetch(base + path, { redirect: "manual" })).status;
  } catch (e) {
    status = -1;
  }
  const bad = status >= 500 || status === -1;
  if (bad) fail += 1;
  console.log(`${bad ? "FAIL" : "PASS"}  ${status}  ${path}`);
}

console.log(
  fail === 0
    ? "\nALL PASS — no 5xx; site stays up even with broken/missing Supabase"
    : `\n${fail} ROUTE(S) RETURNED 5xx — site is not resilient`,
);
process.exit(fail === 0 ? 0 : 1);
