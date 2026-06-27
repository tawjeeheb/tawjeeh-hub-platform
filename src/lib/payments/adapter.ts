import "server-only";
import crypto from "node:crypto";
import { env } from "@/lib/env";
import { webhookEventSchema } from "@/lib/validations";
import type { PaymentProvider } from "@/lib/types";

// Payment adapter abstraction. Concrete providers (Moyasar, HyperPay, PayTabs)
// plug in here later without touching call sites. NO card data ever touches our
// servers — we only create a hosted payment session and verify webhooks.

export interface CreateCheckoutParams {
  orderId: string;
  amountSar: number;
  productTitle: string;
  customerEmail: string;
  callbackUrl: string;
}

export interface CheckoutSession {
  /** Where to send the customer to complete payment. */
  redirectUrl: string;
  provider: PaymentProvider;
  /** Provider-side reference, persisted on the order. */
  reference: string;
}

export interface WebhookEvent {
  providerPaymentId: string;
  orderId: string | null;
  status: "paid" | "failed";
  amountSar: number | null;
}

export interface PaymentAdapter {
  readonly provider: PaymentProvider;
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutSession>;
  /**
   * Verify a webhook came from the provider using its signature scheme.
   * Returns the normalized event, or null if verification fails.
   */
  verifyAndParseWebhook(
    rawBody: string,
    signature: string | null,
  ): Promise<WebhookEvent | null>;
}

// HMAC-SHA256 hex signature of a raw body. Exported so a dev tool can produce a
// VALID webhook signature — there is no other way to trigger fulfillment.
export function signWebhookBody(rawBody: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}

// Constant-time HMAC-SHA256 comparison, the common scheme across providers.
function verifyHmac(rawBody: string, signature: string, secret: string): boolean {
  const a = Buffer.from(signWebhookBody(rawBody, secret));
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// --- Mock adapter (development) ---------------------------------------------
// Models a hosted checkout. It does NOT auto-confirm payment: the browser
// return (callback) never grants access. Fulfillment occurs only when a
// correctly-signed webhook is received — exactly like a real provider. For
// local testing, post a signed webhook (see scripts/simulate-webhook.mjs).
const mockAdapter: PaymentAdapter = {
  provider: "mock",
  async createCheckout(params) {
    return {
      provider: "mock",
      reference: `mock_${params.orderId}`,
      // The customer is returned to the callback, which is informational only.
      // The order stays "pending" until the signed webhook confirms it.
      redirectUrl: `${params.callbackUrl}?order=${params.orderId}`,
    };
  },
  async verifyAndParseWebhook(rawBody, signature) {
    const secret = env.PAYMENT_WEBHOOK_SECRET;
    // Fail closed: no secret configured or no signature provided → reject.
    if (!secret || !signature) return null;
    if (!verifyHmac(rawBody, signature, secret)) return null;

    let json: unknown;
    try {
      json = JSON.parse(rawBody);
    } catch {
      return null;
    }
    const parsed = webhookEventSchema.safeParse(json);
    if (!parsed.success) return null;

    return {
      providerPaymentId: parsed.data.payment_id,
      orderId: parsed.data.order_id,
      status: parsed.data.status,
      amountSar: parsed.data.amount_sar ?? null,
    };
  },
};

// Returns the active adapter, or null when the configured provider has no
// implementation yet. Callers MUST treat null as a fail-safe 503 — never fall
// back to a different provider, so a misconfigured production cannot silently
// run the mock flow.
export function getPaymentAdapter(): PaymentAdapter | null {
  switch (env.PAYMENT_PROVIDER) {
    case "mock":
      return mockAdapter;
    // TODO(payments): real providers require external infrastructure — see
    // ROADMAP.md. Until implemented they fail safe (no checkout, no webhook).
    case "moyasar":
    case "hyperpay":
    case "paytabs":
    default:
      return null;
  }
}
