#!/usr/bin/env node
// Unit regression guard for safeRelativePath() — the open-redirect defense used
// by the auth login redirect and the login server action. This is the REAL
// coverage for the fix: the live route only redirects an already-authenticated
// user, so an anonymous HTTP smoke can't exercise the sanitizer directly.
//
// Requires Node 22+ (native TypeScript type-stripping). No server, no keys.
// Usage: node scripts/test-safe-redirect.mjs
import { safeRelativePath } from "../src/lib/utils.ts";

const F = "/dashboard"; // fallback
const ch = (n) => String.fromCharCode(n);

// [input, expected]  — expected === input means the path is ALLOWED as-is.
const cases = [
  // allowed: genuine same-origin rooted paths
  ["/dashboard", "/dashboard"],
  ["/products/abc", "/products/abc"],
  ["/admin/orders?tab=open", "/admin/orders?tab=open"],
  ["/", "/"],
  ["/%2F%2Fevil.com", "/%2F%2Fevil.com"], // percent-encoded stays same-origin
  // rejected: absolute / scheme
  ["https://evil.com", F],
  ["http://evil.com", F],
  ["https:/evil.com", F],
  ["javascript:alert(1)", F],
  ["data:text/html,x", F],
  // rejected: protocol-relative authority
  ["//evil.com", F],
  ["  //evil.com", F],
  // rejected: backslash authority tricks (anywhere)
  ["/\\evil.com", F],
  ["/\\/evil.com", F],
  ["\\\\evil.com", F],
  ["/foo\\bar", F],
  // rejected: whitespace
  ["/dash board", F],
  ["/dash" + ch(9) + "board", F], // tab
  ["/dash" + ch(10) + "board", F], // newline
  ["/x" + ch(0x2028) + "y", F], // line separator
  // rejected: C0 / DEL control chars (e.g. NUL that a browser may strip to "//")
  ["/" + ch(0) + "/evil.com", F],
  ["/" + ch(1) + "x", F],
  ["/x" + ch(127), F],
  // rejected: non-string / empty
  [123, F],
  [null, F],
  [undefined, F],
  ["", F],
  ["   ", F],
];

let fail = 0;
for (const [inp, exp] of cases) {
  const got = safeRelativePath(inp);
  const pass = got === exp;
  if (!pass) fail += 1;
  const show =
    typeof inp === "string"
      ? [...inp]
          .map((c) => {
            const n = c.charCodeAt(0);
            return n < 32 || n === 127 || n > 126 ? "\\x" + n.toString(16) : c;
          })
          .join("")
      : String(inp);
  console.log(`${pass ? "PASS" : "FAIL"}  in=[${show}] -> ${JSON.stringify(got)}`);
}
console.log(
  fail === 0 ? "\nALL PASS — safeRelativePath rejects every open-redirect payload" : `\n${fail} FAILURE(S)`,
);
process.exit(fail === 0 ? 0 : 1);
