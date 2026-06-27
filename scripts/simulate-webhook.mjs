#!/usr/bin/env node
// Dev tool: post a correctly-SIGNED payment webhook to fulfill an order.
// This is the ONLY way to confirm payment (the browser callback never does),
// which mirrors how a real provider works.
//
// Usage:
//   PAYMENT_WEBHOOK_SECRET=... node scripts/simulate-webhook.mjs <orderId> [paid|failed]
//
// Requires the dev server running and Supabase + service role configured.
import crypto from "node:crypto";

const [, , orderId, status = "paid"] = process.argv;
const secret = process.env.PAYMENT_WEBHOOK_SECRET;
const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

if (!orderId || !secret) {
  console.error(
    "Usage: PAYMENT_WEBHOOK_SECRET=... node scripts/simulate-webhook.mjs <orderId> [paid|failed]",
  );
  process.exit(1);
}

const body = JSON.stringify({
  order_id: orderId,
  payment_id: `sim_${orderId}`,
  status,
  amount_sar: 0,
});
const signature = crypto
  .createHmac("sha256", secret)
  .update(body, "utf8")
  .digest("hex");

const res = await fetch(`${base}/api/webhooks/payment`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-signature": signature },
  body,
});

console.log(`HTTP ${res.status}`, await res.text());
