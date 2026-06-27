"use client";

import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";
import { SEED_CATEGORIES } from "@/lib/categories";
import type { PublicProduct } from "@/lib/types";

type Filter = "all" | string;

export function ProductsBrowser({
  products,
}: {
  products: PublicProduct[];
}) {
  const [category, setCategory] = useState<Filter>("all");
  const [status, setStatus] = useState<"all" | "available" | "coming_soon">(
    "all",
  );

  // Categories actually present in the catalog, keeping brand labels.
  const categories = useMemo(() => {
    const present = new Set(products.map((p) => p.category));
    return SEED_CATEGORIES.filter((c) => present.has(c.key));
  }, [products]);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (category === "all" || p.category === category) &&
          (status === "all" || p.status === status),
      ),
    [products, category, status],
  );

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-navy/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="me-1 text-xs font-bold text-navy/45">المجال</span>
          <FilterChip
            active={category === "all"}
            onClick={() => setCategory("all")}
          >
            كل المجالات
          </FilterChip>
          {categories.map((c) => (
            <FilterChip
              key={c.key}
              active={category === c.key}
              onClick={() => setCategory(c.key)}
            >
              {c.label}
            </FilterChip>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip active={status === "all"} onClick={() => setStatus("all")}>
            الكل
          </FilterChip>
          <FilterChip
            active={status === "available"}
            onClick={() => setStatus("available")}
          >
            متاح الآن
          </FilterChip>
          <FilterChip
            active={status === "coming_soon"}
            onClick={() => setStatus("coming_soon")}
          >
            قريبًا
          </FilterChip>
        </div>
      </div>

      <p className="mt-6 text-sm font-semibold text-navy/50">
        {filtered.length} دليل
      </p>

      {filtered.length === 0 ? (
        <div className="mt-2 rounded-2xl border border-dashed border-navy/15 bg-offwhite py-16 text-center">
          <SearchX className="mx-auto h-8 w-8 text-navy/30" />
          <p className="mt-3 font-bold text-navy">لا توجد أدلة مطابقة</p>
          <p className="mt-1 text-sm text-navy/55">
            جرّب تغيير المجال أو الحالة لعرض المزيد.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
        active
          ? "border-navy bg-navy text-white"
          : "border-navy/15 bg-white text-navy/70 hover:border-navy/30",
      )}
    >
      {children}
    </button>
  );
}
