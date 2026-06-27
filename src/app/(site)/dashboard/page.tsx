import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ShoppingBag, CheckCircle2, Clock, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { DownloadButton } from "@/components/download-button";
import { SignOutButton } from "@/components/sign-out-button";
import { requireUser } from "@/lib/auth";
import { getUserEntitlements, getUserOrders } from "@/lib/data/orders";
import { formatDate, formatSar } from "@/lib/utils";

export const metadata: Metadata = { title: "حسابي" };

// Per-request: reads the session and the user's private data.
export const dynamic = "force-dynamic";

const ORDER_STATUS: Record<
  string,
  { label: string; variant: "available" | "coming" | "neutral" }
> = {
  paid: { label: "مدفوع", variant: "available" },
  pending: { label: "قيد الدفع", variant: "coming" },
  failed: { label: "فشل", variant: "neutral" },
  refunded: { label: "مسترجع", variant: "neutral" },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { checkout?: string };
}) {
  const user = await requireUser("/dashboard");
  const [entitlements, orders] = await Promise.all([
    getUserEntitlements(),
    getUserOrders(),
  ]);

  return (
    <div className="container py-10 md:py-12">
      {/* Welcome band */}
      <div className="relative overflow-hidden rounded-2xl border border-navy/10 bg-offwhite p-7">
        <div className="brand-wash absolute inset-0" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="eyebrow">حسابي</span>
            <h1 className="mt-3 text-2xl font-extrabold text-navy">
              مرحبًا{user.fullName ? `، ${user.fullName}` : ""}
            </h1>
            <p className="mt-1 text-sm text-navy/55" dir="ltr">
              {user.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ButtonLink href="/products" variant="outline" size="sm">
              تصفّح الأدلة
            </ButtonLink>
            <SignOutButton />
          </div>
        </div>
      </div>

      {searchParams.checkout === "returned" && (
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-navy-50 px-4 py-3 text-sm font-medium text-navy/80">
          <Clock className="h-5 w-5" />
          استلمنا عودتك من بوابة الدفع. سيظهر الملف في «ملفاتي» فور تأكيد الدفع.
        </div>
      )}

      {/* My files */}
      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
            <FileText className="h-5 w-5 text-teal-700" />
            ملفاتي
            {entitlements.length > 0 && (
              <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-700">
                {entitlements.length}
              </span>
            )}
          </h2>
          <p className="inline-flex items-center gap-1.5 text-xs text-navy/50">
            <Lock className="h-3.5 w-3.5" />
            التحميل عبر رابط آمن مؤقت مرتبط بحسابك
          </p>
        </div>
        <p className="mt-1 text-sm text-navy/55">
          تظهر هنا الأدلة التي اشتريتها فور تأكيد الدفع، وتبقى متاحة للتحميل من
          حسابك.
        </p>

        {entitlements.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="مكتبتك فارغة حتى الآن"
            body="ابدأ رحلتك في ثلاث خطوات بسيطة — وعند تفعيل الوصول يظهر الدليل هنا مباشرةً."
            steps={["اختر دليلًا يناسب تخصصك", "فعّل الوصول بعد الشراء", "حمّله بأمان من مكتبتك"]}
            cta={{ href: "/products", label: "استعرض الأدلة" }}
          />
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {entitlements.map(({ entitlement, product }) => (
              <div
                key={entitlement.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-navy/10 bg-white p-5 shadow-card"
              >
                <div className="min-w-0">
                  <Link
                    href={`/products/${product.slug}`}
                    className="block truncate font-bold text-navy hover:text-teal-700"
                  >
                    {product.title}
                  </Link>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-teal-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    الوصول مفعّل
                  </span>
                </div>
                <DownloadButton productId={product.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Orders */}
      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
          <ShoppingBag className="h-5 w-5 text-teal-700" />
          الطلبات
        </h2>

        {orders.length === 0 ? (
          <EmptyState title="لا توجد طلبات" body="ستظهر طلباتك هنا بعد الشراء." />
        ) : (
          <div className="mt-5 overflow-hidden rounded-2xl border border-navy/10 bg-white">
            <table className="w-full text-right text-sm">
              <thead className="bg-offwhite text-navy/60">
                <tr>
                  <th className="px-5 py-3 font-semibold">الملف</th>
                  <th className="px-5 py-3 font-semibold">المبلغ</th>
                  <th className="px-5 py-3 font-semibold">الحالة</th>
                  <th className="px-5 py-3 font-semibold">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/10">
                {orders.map((order) => {
                  const status =
                    ORDER_STATUS[order.status] ?? ORDER_STATUS.pending!;
                  return (
                    <tr key={order.id}>
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
      </section>
    </div>
  );
}

function EmptyState({
  title,
  body,
  icon: Icon = Clock,
  steps,
  cta,
}: {
  title: string;
  body: string;
  icon?: typeof Clock;
  steps?: string[];
  cta?: { href: string; label: string };
}) {
  return (
    <div className="relative mt-5 overflow-hidden rounded-2xl border border-dashed border-navy/15 bg-offwhite p-10 text-center">
      <div className="guidance-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-card">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-display text-lg font-extrabold text-navy">
          {title}
        </h3>
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-7 text-navy/60">
          {body}
        </p>

        {steps && steps.length > 0 && (
          <ol className="mx-auto mt-6 grid max-w-xl gap-3 sm:grid-cols-3">
            {steps.map((s, i) => (
              <li
                key={s}
                className="flex items-center gap-3 rounded-xl border border-navy/10 bg-white p-4 text-start"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-navy font-display text-sm font-extrabold text-white">
                  {(i + 1).toLocaleString("ar-EG")}
                </span>
                <span className="text-sm font-semibold text-navy/80">{s}</span>
              </li>
            ))}
          </ol>
        )}

        {cta && (
          <div className="mt-6">
            <ButtonLink href={cta.href} variant="primary" size="sm">
              {cta.label}
            </ButtonLink>
          </div>
        )}
      </div>
    </div>
  );
}
