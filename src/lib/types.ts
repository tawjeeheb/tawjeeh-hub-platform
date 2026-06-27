// Domain types shared across the app. These mirror the Postgres schema in
// `supabase/schema.sql`. Keep them in sync with the database.

export type UserRole = "admin" | "customer";

export type ProductStatus = "available" | "coming_soon" | "draft" | "archived";

/** Statuses that are visible to the public (catalog, sitemap, product page). */
export const PUBLIC_PRODUCT_STATUSES: ProductStatus[] = [
  "available",
  "coming_soon",
];

export function isPubliclyVisible(status: ProductStatus): boolean {
  return PUBLIC_PRODUCT_STATUSES.includes(status);
}

export type OrderStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentProvider = "mock" | "moyasar" | "hyperpay" | "paytabs";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  /** Bullet list of what the file contains. */
  contents: string[];
  /** Who the file is suitable for. */
  audience: string[];
  category: string;
  price_sar: number;
  status: ProductStatus;
  cover_url: string | null;
  /** Path inside the PRIVATE storage bucket. Never exposed to the client. */
  file_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  amount_sar: number;
  status: OrderStatus;
  payment_provider: PaymentProvider;
  provider_payment_id: string | null;
  created_at: string;
  paid_at: string | null;
}

export interface Entitlement {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string;
  active: boolean;
  created_at: string;
}

export interface DownloadRecord {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string;
  downloaded_at: string;
  ip_address: string | null;
}

export type AuditAction =
  | "login"
  | "purchase_created"
  | "payment_confirmed"
  | "file_downloaded"
  | "admin_product_updated";

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: AuditAction;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** Product shape safe to send to the browser — never includes `file_path`. */
export type PublicProduct = Omit<Product, "file_path">;

export function toPublicProduct(p: Product): PublicProduct {
  const { file_path: _filePath, ...rest } = p;
  return rest;
}
