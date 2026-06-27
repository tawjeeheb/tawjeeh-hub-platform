#!/usr/bin/env node
// Promote an existing user to admin — SAFELY.
//
// Usage (load env from .env.local):
//   node --env-file=.env.local scripts/bootstrap-admin.mjs admin@example.com
//   # or: ADMIN_EMAIL=admin@example.com node --env-file=.env.local scripts/bootstrap-admin.mjs
//
// Requirements:
//  - The user must have ALREADY signed up (a profile row exists via the
//    on_auth_user_created trigger).
//  - SUPABASE_SERVICE_ROLE_KEY must be set (service role bypasses RLS).
//
// This script never prints secrets.
import { readEnv, adminClient, requireService, log } from "./_lib.mjs";

const env = readEnv();
const email = (process.argv[2] ?? process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();

if (!email) {
  console.error("Usage: node --env-file=.env.local scripts/bootstrap-admin.mjs <email>");
  process.exit(1);
}

try {
  requireService(env); // refuses without the service role
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

const db = adminClient(env);

// Look up the profile by email (created automatically on signup).
const { data: profile, error: findErr } = await db
  .from("profiles")
  .select("id, email, role")
  .eq("email", email)
  .maybeSingle();

if (findErr) {
  console.error("Lookup failed. Check the Supabase connection and schema.");
  process.exit(1);
}
if (!profile) {
  console.error(
    `No profile found for ${email}. The user must sign up first, then re-run.`,
  );
  process.exit(1);
}
if (profile.role === "admin") {
  log.pass(`${email} is already an admin. Nothing to do.`);
  process.exit(0);
}

const { error: updErr } = await db
  .from("profiles")
  .update({ role: "admin" })
  .eq("id", profile.id);

if (updErr) {
  console.error("Failed to update role.");
  process.exit(1);
}

log.pass(`${email} is now an admin.`);
