import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasServiceRole, isSupabaseConfigured } from "@/lib/env";
import { getSessionUser } from "@/lib/auth";
import type {
  AuditLog,
  Order,
  Product,
  Profile,
} from "@/lib/types";

// Admin reads use the service-role client (which bypasses RLS). As a second,
// independent line of defense — not relying on the /admin layout gate alone —
// every function re-verifies the caller is an admin server-side and returns
// nothing otherwise. This guarantees no privileged data is ever produced for a
// non-admin, regardless of how the function is reached.
async function adminAvailable(): Promise<boolean> {
  if (!isSupabaseConfigured || !hasServiceRole) return false;
  const user = await getSessionUser();
  return user?.role === "admin";
}

export async function adminListProducts(): Promise<Product[]> {
  if (!(await adminAvailable())) return [];
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Product[] | null) ?? [];
}

export async function adminGetProduct(id: string): Promise<Product | null> {
  if (!(await adminAvailable())) return null;
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Product | null) ?? null;
}

export interface AdminOrderRow extends Order {
  product_title: string;
  customer_email: string;
}

export async function adminListOrders(): Promise<AdminOrderRow[]> {
  if (!(await adminAvailable())) return [];
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("orders")
    .select("*, products(title), profiles(email)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (!data) return [];
  return data.map((row) => {
    const { products, profiles, ...order } = row as Order & {
      products: { title: string } | null;
      profiles: { email: string } | null;
    };
    return {
      ...(order as Order),
      product_title: products?.title ?? "—",
      customer_email: profiles?.email ?? "—",
    };
  });
}

export async function adminListCustomers(): Promise<Profile[]> {
  if (!(await adminAvailable())) return [];
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  return (data as Profile[] | null) ?? [];
}

export async function adminListAuditLogs(): Promise<AuditLog[]> {
  if (!(await adminAvailable())) return [];
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  return (data as AuditLog[] | null) ?? [];
}

export interface AdminStats {
  products: number;
  orders: number;
  paidOrders: number;
  customers: number;
  productsByStatus: Record<string, number>;
  ordersByStatus: Record<string, number>;
  productsWithoutFile: number;
}

const EMPTY_STATS: AdminStats = {
  products: 0,
  orders: 0,
  paidOrders: 0,
  customers: 0,
  productsByStatus: {},
  ordersByStatus: {},
  productsWithoutFile: 0,
};

function tally<T extends string>(rows: { [k: string]: unknown }[], key: string) {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const v = String(r[key] ?? "");
    out[v] = (out[v] ?? 0) + 1;
  }
  return out as Record<T, number>;
}

export async function adminStats(): Promise<AdminStats> {
  if (!(await adminAvailable())) return EMPTY_STATS;

  const admin = createSupabaseAdminClient();
  const [products, orders, customers] = await Promise.all([
    admin.from("products").select("status, file_path"),
    admin.from("orders").select("status"),
    admin.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  const productRows = (products.data as { status: string; file_path: string | null }[] | null) ?? [];
  const orderRows = (orders.data as { status: string }[] | null) ?? [];

  const productsByStatus = tally(productRows, "status");
  const ordersByStatus = tally(orderRows, "status");

  return {
    products: productRows.length,
    orders: orderRows.length,
    paidOrders: ordersByStatus["paid"] ?? 0,
    customers: customers.count ?? 0,
    productsByStatus,
    ordersByStatus,
    productsWithoutFile: productRows.filter((p) => !p.file_path).length,
  };
}
