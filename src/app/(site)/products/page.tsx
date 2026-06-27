import type { Metadata } from "next";
import { ProductsBrowser } from "@/components/products-browser";
import { Stamp, ClassDots } from "@/components/brand/studio";
import { getPublicProducts } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "مكتبة الأدلة المهنية",
  description:
    "مكتبة الأدلة المهنية السعودية — كل دليل مجموعة بطاقات مهنية موثّقة لتخصص كامل. فلتر حسب المجال والحالة.",
};

export default async function ProductsPage() {
  const products = await getPublicProducts();
  const available = products.filter((p) => p.status === "available").length;

  return (
    <>
      <section className="relative overflow-hidden border-b border-navy/10 bg-offwhite">
        <div className="guidance-grid absolute inset-0 opacity-50" />
        <div className="brand-wash absolute inset-0" />
        <div className="container relative py-14 md:py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <Stamp label="مكتبة الأدلة" tone="teal" className="bg-white shadow-card" />
              <h1 className="mt-5 text-balance font-display text-3xl font-extrabold text-navy md:text-[2.6rem]">
                مكتبة أدلة مهنية لسوق العمل السعودي
              </h1>
              <p className="mt-3 text-base leading-8 text-navy/65">
                كل دليل مجموعة بطاقات مهنية موثّقة لتخصص كامل — اختر مجالك واستعرض
                ما يحتويه الدليل قبل الشراء.
              </p>
            </div>
            {/* library counters */}
            <div className="flex shrink-0 items-center gap-3">
              <div className="rounded-2xl border border-navy/10 bg-white px-5 py-4 text-center shadow-card">
                <div className="font-display text-2xl font-extrabold text-navy">
                  {products.length}
                </div>
                <div className="mt-0.5 text-xs font-semibold text-navy/50">
                  أدلة في المكتبة
                </div>
              </div>
              <div className="rounded-2xl border border-navy/10 bg-white px-5 py-4 text-center shadow-card">
                <div className="font-display text-2xl font-extrabold text-teal-700">
                  {available}
                </div>
                <div className="mt-0.5 text-xs font-semibold text-navy/50">
                  متاح الآن
                </div>
              </div>
            </div>
          </div>
          <ClassDots className="mt-6" />
        </div>
      </section>

      <div className="container py-12">
        <ProductsBrowser products={products} />
      </div>
    </>
  );
}
