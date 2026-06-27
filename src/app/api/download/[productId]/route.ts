import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { userHasEntitlement } from "@/lib/data/orders";
import { getProductWithFilePath } from "@/lib/data/products";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { recordAudit } from "@/lib/audit";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { env, hasServiceRole, isSupabaseConfigured } from "@/lib/env";

export const runtime = "nodejs";

// Protected download. Files live in a PRIVATE bucket and are NEVER public. A
// short-lived signed URL is issued only after EVERY check passes:
//   1. user authenticated
//   2. active entitlement exists (implies a paid order)
//   3. the product has a stored file
// The direct file URL is never embedded in any HTML — we redirect to a freshly
// signed, short-expiry URL on each request.
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const ip = getClientIp(request.headers);
  if (!rateLimit(`download:${user.id}`, 30, 60_000).success) {
    return NextResponse.json({ error: "محاولات كثيرة جدًا" }, { status: 429 });
  }

  if (!isSupabaseConfigured || !hasServiceRole) {
    return NextResponse.json(
      { error: "خدمة التحميل غير مفعّلة بعد." },
      { status: 503 },
    );
  }

  const productId = params.productId;

  // Entitlement check — the core authorization gate.
  const { ok, orderId } = await userHasEntitlement(productId);
  if (!ok) {
    return NextResponse.json(
      { error: "لا تملك صلاحية تحميل هذا الملف." },
      { status: 403 },
    );
  }

  const product = await getProductWithFilePath(productId);
  if (!product?.file_path) {
    return NextResponse.json(
      { error: "الملف غير متوفر حاليًا." },
      { status: 404 },
    );
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage
    .from(env.SUPABASE_PRIVATE_BUCKET)
    .createSignedUrl(product.file_path, env.DOWNLOAD_URL_EXPIRY_SECONDS, {
      download: true,
    });

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "تعذّر إنشاء رابط التحميل." }, {
      status: 500,
    });
  }

  // Record the download (best-effort) and audit it.
  await admin.from("downloads").insert({
    user_id: user.id,
    product_id: productId,
    order_id: orderId,
    ip_address: ip,
  });
  await recordAudit({
    actorId: user.id,
    action: "file_downloaded",
    entityType: "product",
    entityId: productId,
    metadata: { order_id: orderId },
  });

  // 302 to the freshly signed, short-lived URL.
  return NextResponse.redirect(data.signedUrl, { status: 302 });
}
