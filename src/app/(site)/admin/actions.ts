"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasServiceRole, isSupabaseConfigured } from "@/lib/env";
import { productUpsertSchema, productStatusChangeSchema } from "@/lib/validations";
import { recordAudit } from "@/lib/audit";

export interface AdminActionState {
  error?: string;
  success?: string;
}

function parseListField(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildPayload(formData: FormData) {
  return productUpsertSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    subtitle: formData.get("subtitle") ?? "",
    description: formData.get("description"),
    contents: parseListField(formData.get("contents")),
    audience: parseListField(formData.get("audience")),
    category: formData.get("category"),
    price_sar: formData.get("price_sar"),
    status: formData.get("status"),
    cover_url: formData.get("cover_url") ?? "",
    file_path: formData.get("file_path") ?? "",
  });
}

export async function upsertProductAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();

  if (!isSupabaseConfigured || !hasServiceRole) {
    return { error: "خدمة قاعدة البيانات غير مفعّلة." };
  }

  const parsed = buildPayload(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }

  const id = formData.get("id");
  const db = createSupabaseAdminClient();
  const row = {
    ...parsed.data,
    subtitle: parsed.data.subtitle || null,
    cover_url: parsed.data.cover_url || null,
    file_path: parsed.data.file_path || null,
    updated_at: new Date().toISOString(),
  };

  if (typeof id === "string" && id.length > 0) {
    const { error } = await db.from("products").update(row).eq("id", id);
    if (error) return { error: "تعذّر تحديث المنتج." };
    await recordAudit({
      actorId: admin.id,
      action: "admin_product_updated",
      entityType: "product",
      entityId: id,
      metadata: { slug: row.slug, op: "update" },
    });
  } else {
    const { data, error } = await db
      .from("products")
      .insert(row)
      .select("id")
      .single();
    if (error) return { error: "تعذّر إنشاء المنتج. تحقق من تفرّد الـ slug." };
    await recordAudit({
      actorId: admin.id,
      action: "admin_product_updated",
      entityType: "product",
      entityId: data?.id ?? null,
      metadata: { slug: row.slug, op: "create" },
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { success: "تم الحفظ بنجاح." };
}

// Narrow status change (activate / archive / move to draft / coming soon).
// Re-runs full validation when moving a product PUBLIC so we never publish an
// incomplete record from a one-click action.
export async function setProductStatusAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!isSupabaseConfigured || !hasServiceRole) return;

  const parsed = productStatusChangeSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  const db = createSupabaseAdminClient();

  // Guard: only publish (available/coming_soon) a product that already satisfies
  // the public-readiness rules. Otherwise keep it private and do nothing.
  if (parsed.data.status === "available" || parsed.data.status === "coming_soon") {
    const { data: current } = await db
      .from("products")
      .select("price_sar, description")
      .eq("id", parsed.data.id)
      .maybeSingle();
    if (!current) return;
    const descOk = (current.description ?? "").trim().length >= 40;
    const priceOk = parsed.data.status !== "available" || current.price_sar > 0;
    if (!descOk || !priceOk) return; // refuse to publish an incomplete product
  }

  const { error } = await db
    .from("products")
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.id);
  if (error) return;

  await recordAudit({
    actorId: admin.id,
    action: "admin_product_updated",
    entityType: "product",
    entityId: parsed.data.id,
    metadata: { op: "status_change", status: parsed.data.status },
  });
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!isSupabaseConfigured || !hasServiceRole) return;

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const db = createSupabaseAdminClient();
  await db.from("products").delete().eq("id", id);
  await recordAudit({
    actorId: admin.id,
    action: "admin_product_updated",
    entityType: "product",
    entityId: id,
    metadata: { op: "delete" },
  });
  revalidatePath("/admin/products");
  revalidatePath("/products");
}
