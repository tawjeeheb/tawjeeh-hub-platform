import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isSupabaseConfigured, hasServiceRole, env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPaymentAdapter } from "@/lib/payments/adapter";
import { checkoutSchema } from "@/lib/validations";
import { recordAudit } from "@/lib/audit";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Creates an order and starts a hosted-payment session. No card data is ever
// received or stored here — we only redirect the customer to the provider.
export async function POST(request: NextRequest) {
  // Auth gate — server-side only.
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  // Per-user rate limit.
  const ip = getClientIp(request.headers);
  if (!rateLimit(`checkout:${user.id}:${ip}`, 10, 60_000).success) {
    return NextResponse.json({ error: "محاولات كثيرة جدًا" }, { status: 429 });
  }

  if (!isSupabaseConfigured || !hasServiceRole) {
    return NextResponse.json(
      { error: "خدمة الدفع غير مفعّلة بعد." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  // Load product server-side; trust the DB price, never the client.
  const { data: product } = await admin
    .from("products")
    .select("id, title, price_sar, status")
    .eq("id", parsed.data.product_id)
    .maybeSingle();

  if (!product || product.status !== "available") {
    return NextResponse.json(
      { error: "المنتج غير متاح للشراء." },
      { status: 404 },
    );
  }

  // Fail safe: if the configured provider has no implementation, do not create
  // an order or fall back to another provider.
  const adapter = getPaymentAdapter();
  if (!adapter) {
    return NextResponse.json(
      { error: "خدمة الدفع غير مفعّلة بعد." },
      { status: 503 },
    );
  }

  // Create the pending order.
  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: user.id,
      product_id: product.id,
      amount_sar: product.price_sar,
      status: "pending",
      payment_provider: adapter.provider,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: "تعذّر إنشاء الطلب." },
      { status: 500 },
    );
  }

  const session = await adapter.createCheckout({
    orderId: order.id,
    amountSar: product.price_sar,
    productTitle: product.title,
    customerEmail: user.email,
    callbackUrl: `${env.NEXT_PUBLIC_SITE_URL}/api/payments/callback`,
  });

  await admin
    .from("orders")
    .update({ provider_payment_id: session.reference })
    .eq("id", order.id);

  await recordAudit({
    actorId: user.id,
    action: "purchase_created",
    entityType: "order",
    entityId: order.id,
    metadata: { product_id: product.id, amount_sar: product.price_sar },
  });

  return NextResponse.json({ redirectUrl: session.redirectUrl });
}
