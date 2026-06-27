import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { recordAudit } from "@/lib/audit";

// Trusted, idempotent fulfillment of a paid order. Called only from verified
// server contexts (webhook handler / verified payment callback). Uses the
// service-role client because it must update another user's rows.
export async function fulfillPaidOrder(
  orderId: string,
  providerPaymentId: string,
): Promise<{ ok: boolean }> {
  const admin = createSupabaseAdminClient();

  // Load the order; bail if missing or already fulfilled (idempotency).
  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, product_id, status")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { ok: false };
  if (order.status === "paid") return { ok: true };

  const paidAt = new Date().toISOString();

  await admin
    .from("orders")
    .update({
      status: "paid",
      provider_payment_id: providerPaymentId,
      paid_at: paidAt,
    })
    .eq("id", orderId);

  // Grant entitlement (unique on (user_id, product_id) — upsert is idempotent).
  await admin.from("entitlements").upsert(
    {
      user_id: order.user_id,
      product_id: order.product_id,
      order_id: order.id,
      active: true,
    },
    { onConflict: "user_id,product_id" },
  );

  await recordAudit({
    actorId: order.user_id,
    action: "payment_confirmed",
    entityType: "order",
    entityId: order.id,
    metadata: { provider_payment_id: providerPaymentId },
  });

  return { ok: true };
}
