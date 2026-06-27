import Link from "next/link";
import { Plus, Pencil, FileCheck2, FileX2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { adminListProducts } from "@/lib/data/admin";
import {
  deleteProductAction,
  setProductStatusAction,
} from "@/app/(site)/admin/actions";
import { formatSar, formatDate } from "@/lib/utils";
import { PRODUCT_STATUS_META, ALL_PRODUCT_STATUSES } from "@/lib/product-status";
import type { ProductStatus } from "@/lib/types";

function isStatus(v: string | undefined): v is ProductStatus {
  return !!v && (ALL_PRODUCT_STATUSES as string[]).includes(v);
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const all = await adminListProducts();
  const statusFilter = isStatus(searchParams.status) ? searchParams.status : null;
  const q = (searchParams.q ?? "").trim().toLowerCase();

  const products = all.filter((p) => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (q && !`${p.title} ${p.slug} ${p.category}`.toLowerCase().includes(q))
      return false;
    return true;
  });

  const counts = ALL_PRODUCT_STATUSES.map((s) => ({
    status: s,
    label: PRODUCT_STATUS_META[s].label,
    count: all.filter((p) => p.status === s).length,
  }));

  const filterHref = (s: ProductStatus | null) =>
    s ? `/admin/products?status=${s}` : "/admin/products";

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-navy">المنتجات</h1>
        <ButtonLink href="/admin/products/new" size="sm">
          <Plus className="h-4 w-4" />
          منتج جديد
        </ButtonLink>
      </div>

      {/* Status filter chips */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link
          href={filterHref(null)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            !statusFilter ? "bg-navy text-white" : "bg-navy-50 text-navy/70"
          }`}
        >
          الكل ({all.length})
        </Link>
        {counts.map((c) => (
          <Link
            key={c.status}
            href={filterHref(c.status)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              statusFilter === c.status
                ? "bg-navy text-white"
                : "bg-navy-50 text-navy/70"
            }`}
          >
            {c.label} ({c.count})
          </Link>
        ))}
      </div>

      {/* Search */}
      <form className="mt-4" action="/admin/products">
        {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
        <input
          type="search"
          name="q"
          defaultValue={searchParams.q ?? ""}
          placeholder="ابحث بالعنوان أو الـ slug أو المجال…"
          className="h-10 w-full max-w-md rounded-xl border border-navy/15 bg-white px-4 text-sm text-navy placeholder:text-navy/40 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
        />
      </form>

      {products.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-navy/15 bg-offwhite p-10 text-center text-sm text-navy/60">
          {all.length === 0
            ? "لا توجد منتجات بعد. أضف أول دليل مهني."
            : "لا منتجات تطابق هذا الفلتر."}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-navy/10 bg-white">
          <table className="w-full min-w-[820px] text-right text-sm">
            <thead className="bg-offwhite text-navy/60">
              <tr>
                <th className="px-5 py-3 font-semibold">العنوان / الـ slug</th>
                <th className="px-5 py-3 font-semibold">المجال</th>
                <th className="px-5 py-3 font-semibold">السعر</th>
                <th className="px-5 py-3 font-semibold">الحالة</th>
                <th className="px-5 py-3 font-semibold">الملف</th>
                <th className="px-5 py-3 font-semibold">آخر تحديث</th>
                <th className="px-5 py-3 font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/10">
              {products.map((product) => {
                const meta = PRODUCT_STATUS_META[product.status];
                const hasFile = Boolean(product.file_path); // status only — never the path
                return (
                  <tr key={product.id}>
                    <td className="px-5 py-4">
                      <div className="font-medium text-navy">{product.title}</div>
                      <div className="text-xs text-navy/50" dir="ltr">
                        {product.slug}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-navy/70">{product.category}</td>
                    <td className="px-5 py-4 text-navy/70">
                      {formatSar(product.price_sar)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={meta.badge}>{meta.label}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      {hasFile ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
                          <FileCheck2 className="h-3.5 w-3.5" /> مرتبط
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-plum-700">
                          <FileX2 className="h-3.5 w-3.5" /> غير مرتبط
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-navy/60">
                      {formatDate(product.updated_at)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-600"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          تعديل
                        </Link>
                        {product.status === "archived" ? (
                          <form action={setProductStatusAction}>
                            <input type="hidden" name="id" value={product.id} />
                            <input type="hidden" name="status" value="coming_soon" />
                            <Button type="submit" variant="ghost" size="sm">
                              استعادة
                            </Button>
                          </form>
                        ) : (
                          <form action={setProductStatusAction}>
                            <input type="hidden" name="id" value={product.id} />
                            <input type="hidden" name="status" value="archived" />
                            <Button type="submit" variant="ghost" size="sm">
                              أرشفة
                            </Button>
                          </form>
                        )}
                        <form action={deleteProductAction}>
                          <input type="hidden" name="id" value={product.id} />
                          <Button type="submit" variant="ghost" size="sm">
                            حذف
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
