import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { adminListOrders } from "@/lib/data/admin";
import { formatDate, formatSar } from "@/lib/utils";

const STATUS: Record<
  string,
  { label: string; variant: "available" | "coming" | "neutral" }
> = {
  paid: { label: "مدفوع", variant: "available" },
  pending: { label: "قيد الدفع", variant: "coming" },
  failed: { label: "فشل", variant: "neutral" },
  refunded: { label: "مسترجع", variant: "neutral" },
};

const FILTERS = [
  { key: "", label: "الكل" },
  { key: "pending", label: "قيد الدفع" },
  { key: "paid", label: "مدفوع" },
  { key: "failed", label: "فشل" },
  { key: "refunded", label: "مسترجع" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const allOrders = await adminListOrders();
  const filter = searchParams.status ?? "";
  const orders = filter
    ? allOrders.filter((o) => o.status === filter)
    : allOrders;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy">الطلبات</h1>

      {/* Fulfillment integrity note — paid status is never set by hand here. */}
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-navy/10 bg-offwhite p-4 text-sm leading-7 text-navy/70">
        <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-700" />
        <p>
          هذه الصفحة <span className="font-semibold">للعرض فقط</span>. لا يمكن
          تحويل أي طلب إلى «مدفوع» يدويًا — التفعيل (الـ entitlement) يتم حصريًا
          عبر webhook دفع موقّع وموثّق. هذا يمنع منح وصول دون دفع فعلي مؤكَّد.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key || "all"}
            href={f.key ? `/admin/orders?status=${f.key}` : "/admin/orders"}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              filter === f.key ? "bg-navy text-white" : "bg-navy-50 text-navy/70"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-navy/15 bg-offwhite p-10 text-center text-sm text-navy/60">
          {allOrders.length === 0
            ? "لا توجد طلبات بعد."
            : "لا طلبات بهذه الحالة."}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-navy/10 bg-white">
          <table className="w-full min-w-[720px] text-right text-sm">
            <thead className="bg-offwhite text-navy/60">
              <tr>
                <th className="px-5 py-3 font-semibold">رقم الطلب</th>
                <th className="px-5 py-3 font-semibold">العميل</th>
                <th className="px-5 py-3 font-semibold">الملف</th>
                <th className="px-5 py-3 font-semibold">المبلغ</th>
                <th className="px-5 py-3 font-semibold">الحالة</th>
                <th className="px-5 py-3 font-semibold">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/10">
              {orders.map((order) => {
                const status = STATUS[order.status] ?? STATUS.pending!;
                return (
                  <tr key={order.id}>
                    <td className="px-5 py-4 font-mono text-xs text-navy/50" dir="ltr">
                      {order.id.slice(0, 8)}
                    </td>
                    <td className="px-5 py-4 text-navy/80" dir="ltr">
                      {order.customer_email}
                    </td>
                    <td className="px-5 py-4 font-medium text-navy">
                      {order.product_title}
                    </td>
                    <td className="px-5 py-4 text-navy/70">
                      {formatSar(order.amount_sar)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                    <td className="px-5 py-4 text-navy/60">
                      {formatDate(order.created_at)}
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
