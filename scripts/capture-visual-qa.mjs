#!/usr/bin/env node
// Visual QA capture. Kills stale Next servers, starts a clean `next start`
// against the existing build, and screenshots the key pages at desktop
// (1440x1000) and mobile (390x844) into artifacts/visual-qa/.
//
// Playwright is intentionally NOT a project dependency. Install it transiently
// before running, then it can be removed again:
//
//   npm i -D playwright --no-save   # or: npm i -D playwright
//   npm run build
//   node scripts/capture-visual-qa.mjs
//   npm uninstall -D playwright && git checkout package.json package-lock.json
//
// The pre-installed Chromium at /opt/pw-browsers/chromium is used when present.
import { spawn, execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const OUT = "artifacts/visual-qa";
const BASE = "http://localhost:3000";
const PAGES = [
  { name: "home", path: "/" },
  { name: "products", path: "/products" },
  { name: "product-detail", path: "/products/sharia-islamic-studies-guide" },
  { name: "login", path: "/auth/login" },
  { name: "signup", path: "/auth/signup" },
  { name: "forgot-password", path: "/auth/forgot-password" },
];

function killStaleServers() {
  for (const pat of ["next-server", "next start"]) {
    try {
      execSync(`pkill -f "${pat}"`, { stdio: "ignore" });
    } catch {
      /* nothing to kill */
    }
  }
}

async function waitForServer(timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(BASE + "/");
      if (res.ok) return true;
    } catch {
      /* not up yet */
    }
    await sleep(1000);
  }
  return false;
}

async function main() {
  let playwright;
  try {
    playwright = await import("playwright");
  } catch {
    console.error(
      "playwright not installed. Run: npm i -D playwright --no-save",
    );
    process.exit(1);
  }

  mkdirSync(OUT, { recursive: true });
  killStaleServers();
  await sleep(1500);

  const server = spawn("npm", ["run", "start"], {
    stdio: "ignore",
    detached: true,
  });

  try {
    if (!(await waitForServer())) throw new Error("server did not start");

    const launch = await playwright.chromium
      .launch({ executablePath: "/opt/pw-browsers/chromium" })
      .catch(() => playwright.chromium.launch());

    for (const view of [
      { tag: "desktop", width: 1440, height: 1000 },
      { tag: "mobile", width: 390, height: 844 },
    ]) {
      const ctx = await launch.newContext({
        viewport: { width: view.width, height: view.height },
        locale: "ar",
      });
      for (const p of PAGES) {
        const page = await ctx.newPage();
        await page.goto(BASE + p.path, { waitUntil: "networkidle" });
        await page.waitForTimeout(400);
        await page.screenshot({
          path: `${OUT}/${p.name}-${view.tag}.png`,
          fullPage: view.tag === "desktop",
        });
        await page.close();
        console.log(`captured ${p.name}-${view.tag}`);
      }
      await ctx.close();
    }
    await launch.close();
  } finally {
    try {
      process.kill(-server.pid);
    } catch {
      /* already gone */
    }
    killStaleServers();
  }
  console.log(`\nDone → ${OUT}/`);
}

main();
