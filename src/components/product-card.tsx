import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductCover } from "@/components/brand/brand-motif";
import { Stamp, ClassDots, categoryAccent } from "@/components/brand/studio";
import { cn, formatSar } from "@/lib/utils";
import { categoryLabel } from "@/lib/categories";
import type { PublicProduct } from "@/lib/types";

export function ProductCard({ product }: { product: PublicProduct }) {
  const isAvailable = product.status === "available";
  const { spine, chip, accent } = categoryAccent(product.category);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="surface lift group relative flex flex-col overflow-hidden focus:outline-none"
    >
      {/* category accent strip distinguishes each specialty */}
      <span className={cn("h-1.5 w-full", spine)} />

      <div className="relative">
        <ProductCover compact />
        <span className="absolute right-4 top-4">
          <Stamp
            label={isAvailable ? "متاح الآن" : "قريبًا"}
            tone={isAvailable ? "teal" : "plum"}
            className="bg-white/95 shadow-soft backdrop-blur"
          />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <span className={cn("field-tag w-fit", chip)}>
          {categoryLabel(product.category)}
        </span>
        <h3 className="mt-3 font-display text-[1.05rem] font-extrabold leading-7 text-navy">
          {product.title}
        </h3>
        {product.subtitle && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-navy/60">
            {product.subtitle}
          </p>
        )}

        <ClassDots className="mt-4" />

        <div className="mt-auto flex items-center justify-between border-t border-navy/10 pt-5">
          <div>
            <span className="block text-[11px] text-navy/45">السعر</span>
            <span className="font-display text-xl font-extrabold text-navy">
              {formatSar(product.price_sar)}
            </span>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-sm font-bold transition-colors",
              accent === "plum"
                ? "text-plum-700 group-hover:text-plum"
                : accent === "navy"
                  ? "text-navy group-hover:text-navy-700"
                  : "text-teal-700 group-hover:text-teal-600",
            )}
          >
            عرض التفاصيل
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
