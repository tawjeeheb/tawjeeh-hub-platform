import { NextResponse, type NextRequest } from "next/server";
import { getPaymentAdapter } from "@/lib/payments/adapter";
import { fulfillPaidOrder } from "@/lib/payments/fulfillment";
import { isSupabaseConfigured, hasServiceRole, env } from "@/lib/env";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Payment provider webhook. The signature is verified BEFORE any processing —
// the body is otherwise untrusted external input. Returns 200 quickly so the
// provider does not retry on success.
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  if (!rateLimit(`webhook:${ip}`, 120, 60_000).success) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  if (!isSupabaseConfigured || !hasServiceRole) {
    return new NextResponse("Service Unavailable", { status: 503 });
  }

  // Fail closed: without a configured signing secret, no webhook can be trusted.
  if (!env.PAYMENT_WEBHOOK_SECRET) {
    return new NextResponse("Service Unavailable", { status: 503 });
  }

  // Fail closed: unimplemented provider → no fulfillment path.
  const adapter = getPaymentAdapter();
  if (!adapter) {
    return new NextResponse("Service Unavailable", { status: 503 });
  }

  const rawBody = await request.text();
  const signature =
    request.headers.get("x-signature") ??
    request.headers.get("x-webhook-signature");

  const event = await adapter.verifyAndParseWebhook(rawBody, signature);

  if (!event) {
    // Verification failed (missing/invalid signature or malformed payload).
    // Reject as unauthorized without revealing why, and never fulfill.
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (event.status === "paid" && event.orderId) {
    await fulfillPaidOrder(event.orderId, event.providerPaymentId);
  }

  return NextResponse.json({ received: true });
}
