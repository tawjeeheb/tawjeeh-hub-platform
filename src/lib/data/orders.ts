import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Entitlement, Order, Product } from "@/lib/types";

// User-scoped reads. RLS guarantees a user only ever sees their own rows; these
// helpers add no privileged access of their own.

export interface OwnedProduct {
  entitlement: Entitlement;
  product: Pick<Product, "id" | "slug" | "title" | "category" | "status">;
}

export async function getUserEntitlements(): Promise<OwnedProduct[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("entitlements")
    .select(
      "id, user_id, product_id, order_id, active, created_at, products(id, slug, title, category, status)",
    )
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (!data) return [];

  return data
    .filter((row) => row.products)
    .map((row) => {
      const { products, ...entitlement } = row as typeof row & {
        products: OwnedProduct["product"];
      };
      return { entitlement: entitlement as Entitlement, product: products };
    });
}

export interface OrderWithProduct extends Order {
  product_title: string;
}

export async function getUserOrders(): Promise<OrderWithProduct[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("orders")
    .select("*, products(title)")
    .order("created_at", { ascending: false });

  if (!data) return [];

  return data.map((row) => {
    const { products, ...order } = row as Order & {
      products: { title: string } | null;
    };
    return {
      ...(order as Order),
      product_title: products?.title ?? "—",
    };
  });
}

/** True if the signed-in user has an active entitlement for the product. */
export async function userHasEntitlement(
  productId: string,
): Promise<{ ok: boolean; orderId: string | null }> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return { ok: false, orderId: null };

  const { data } = await supabase
    .from("entitlements")
    .select("order_id")
    .eq("product_id", productId)
    .eq("active", true)
    .maybeSingle();

  return { ok: Boolean(data), orderId: data?.order_id ?? null };
}
