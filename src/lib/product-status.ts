import type { ProductStatus } from "@/lib/types";

// Single source of truth for how each product status is shown in the owner UI.
// Safe for both server and client (no secrets, no server-only imports).
export const PRODUCT_STATUS_META: Record<
  ProductStatus,
  { label: string; badge: "available" | "coming" | "draft" | "archived"; public: boolean }
> = {
  available: { label: "متاح", badge: "available", public: true },
  coming_soon: { label: "قريبًا", badge: "coming", public: true },
  draft: { label: "مسودة", badge: "draft", public: false },
  archived: { label: "مؤرشف", badge: "archived", public: false },
};

export const ALL_PRODUCT_STATUSES: ProductStatus[] = [
  "available",
  "coming_soon",
  "draft",
  "archived",
];
