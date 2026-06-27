import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, hasServiceRole } from "@/lib/env";
import { SEED_PRODUCTS, getSeedProductBySlug } from "@/lib/seed-products";
import {
  toPublicProduct,
  isPubliclyVisible,
  PUBLIC_PRODUCT_STATUSES,
  type Product,
  type PublicProduct,
} from "@/lib/types";

// Public catalog access. Falls back to the curated seed catalog when Supabase
// is not configured so the storefront always renders. Two invariants hold on
// every path: `file_path` is stripped before anything reaches the browser, and
// only PUBLIC_PRODUCT_STATUSES (available/coming_soon) are ever returned — draft
// and archived products are invisible to the public, including the sitemap.

const PUBLIC_COLUMNS =
  "id, slug, title, subtitle, description, contents, audience, category, price_sar, status, cover_url, created_at, updated_at";

function seedPublic(): PublicProduct[] {
  return SEED_PRODUCTS.filter((p) => isPubliclyVisible(p.status)).map(
    toPublicProduct,
  );
}

export async function getPublicProducts(): Promise<PublicProduct[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase || !isSupabaseConfigured) {
    return seedPublic();
  }

  const { data, error } = await supabase
    .from("products")
    .select(PUBLIC_COLUMNS)
    .in("status", PUBLIC_PRODUCT_STATUSES)
    .order("created_at", { ascending: true });

  if (error || !data) return seedPublic();
  return data as PublicProduct[];
}

export async function getPublicProductBySlug(
  slug: string,
): Promise<PublicProduct | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase || !isSupabaseConfigured) {
    const seed = getSeedProductBySlug(slug);
    return seed && isPubliclyVisible(seed.status)
      ? toPublicProduct(seed)
      : null;
  }

  const { data, error } = await supabase
    .from("products")
    .select(PUBLIC_COLUMNS)
    .eq("slug", slug)
    .in("status", PUBLIC_PRODUCT_STATUSES)
    .maybeSingle();

  if (error || !data) {
    const seed = getSeedProductBySlug(slug);
    return seed && isPubliclyVisible(seed.status)
      ? toPublicProduct(seed)
      : null;
  }
  return data as PublicProduct;
}

/** Server-only: fetch a full product including private `file_path`. */
export async function getProductWithFilePath(
  productId: string,
): Promise<Product | null> {
  // `file_path` is privileged: clients are denied the column at the DB level
  // (see schema.sql column grants), so it must be read with the service role.
  if (!isSupabaseConfigured || !hasServiceRole) {
    return SEED_PRODUCTS.find((p) => p.id === productId) ?? null;
  }
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("products")
    .select("*")
    .eq("id", productId)
    .maybeSingle();
  return (data as Product | null) ?? null;
}
