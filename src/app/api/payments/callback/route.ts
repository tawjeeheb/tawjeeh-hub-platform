import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

export const runtime = "nodejs";

// Customer return URL after a hosted payment.
//
// SECURITY: this endpoint is purely informational and performs NO state change.
// It never marks an order as paid and never grants an entitlement — fulfillment
// happens ONLY in the signature-verified webhook (`/api/webhooks/payment`).
// The browser return is untrusted and easily forged, so it must never confer
// access. The customer is simply redirected to their dashboard, where the order
// shows as "pending" until the webhook confirms it.
export async function GET(request: NextRequest) {
  const orderId = new URL(request.url).searchParams.get("order");

  const dashboard = new URL("/dashboard", env.NEXT_PUBLIC_SITE_URL);
  // Cosmetic hint only — does not imply the order is paid.
  if (orderId) dashboard.searchParams.set("checkout", "returned");

  return NextResponse.redirect(dashboard);
}
