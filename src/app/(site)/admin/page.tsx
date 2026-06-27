import type { Metadata } from "next";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  CheckCircle2,
  Users,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { adminStats } from "@/lib/data/admin";
import { isSupabaseConfigured, hasServiceRole, env } from "@/lib/env";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_STATUS_META, ALL_PRODUCT_STATUSES } from "@/lib/product-status";

export const metadata: Metadata = { title: "لوحة الإدارة" };

const ORDER_LABELS: Record<string, string> = {
  pending: "قيد الدفع",
  paid: "مدفوع",
  failed: "فشل",
  refunded: "مسترجع",
};

export default async function AdminOverviewPage() {
  const stats = await adminStats();
  const configured = isSupabaseConfigured && hasServiceRole;

  // Operational alerts — what the owner must act on before / after launch.
  const alerts: { tone: "warn" | "info"; text: string }[] = [];
  if (!configured) {
    alerts.push({
      tone: "warn",
      text: "قاعدة البيانات غير مهيأة. اضبط متغيّرات Supabase لتفعيل الحساب والإدارة والشراء والتحميل.",
    });
  }
  if (configured && stats.productsWithoutFile > 0) {
    alerts.push({
      tone: "warn",
      text: `${stats.productsWithoutFile} منتج بلا ملف PDF مرتبط — لن يُتاح تحميله حتى يُربط ملفه.`,
    });
  }
  if (env.PAYMENT_PROVIDER === "mock") {
    alerts.push({
      tone: "info",
      text: "بوّابة الدفع في وضع تجريبي (mock). لا دفع حقيقي حتى ربط مزوّد سعودي معتمد.",
    });
  }
  if (env.NEXT_PUBLIC_SITE_URL.includes("localhost")) {
    alerts.push({
      tone: "info",
      text: "NEXT_PUBLIC_SITE_URL لا يزال على localhost — حدّثه إلى الدومين الفعلي قبل الإطلاق.",
    });
  }

  const cards = [
    { label: "المنتجات", value: stats.products, icon: Package },
    { label: "إجمالي الطلبات", value: stats.orders, icon: ShoppingBag },
    { label: "طلبات مدفوعة", value: stats.paidOrders, icon: CheckCircle2 },
    { label: "العملاء", value: stats.customers, icon: Users },
  ];

  const links = [
    { href: "/admin/products", label: "إدارة المنتجات", desc: "إضافة وتعديل وأرشفة الأدلة" },
    { href: "/admin/orders", label: "إدارة الطلبات", desc: "متابعة الطلبات وحالات الدفع" },
    { href: "/admin/customers", label: "العملاء", desc: "قائمة الحسابات المسجّلة" },
    { href: "/admin/audit", label: "سجل الأحداث", desc: "تتبّع العمليات الحساسة" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-navy">نظرة عامة</h1>

      {alerts.length > 0 && (
        <div className="mt-5 space-y-2">
          {alerts.map((a, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${
                a.tone === "warn"
                  ? "bg-plum-50 text-plum-700"
                  : "bg-navy-50 text-navy/80"
              }`}
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{a.text}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-navy/10 bg-white p-6 shadow-card"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <card.icon className="h-5 w-5" />
            </div>
            <div className="mt-4 text-3xl font-extrabold text-navy">
              {card.value}
            </div>
            <div className="mt-1 text-sm text-navy/60">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Breakdowns */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-navy/10 bg-white p-6">
          <h2 className="text-sm font-bold text-navy">المنتجات حسب الحالة</h2>
          <div className="mt-4 space-y-2.5">
            {ALL_PRODUCT_STATUSES.map((s) => (
              <div key={s} className="flex items-center justify-between">
                <Badge variant={PRODUCT_STATUS_META[s].badge}>
                  {PRODUCT_STATUS_META[s].label}
                </Badge>
                <span className="text-sm font-bold text-navy">
                  {stats.productsByStatus[s] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-navy/10 bg-white p-6">
          <h2 className="text-sm font-bold text-navy">الطلبات حسب الحالة</h2>
          <div className="mt-4 space-y-2.5">
            {Object.keys(ORDER_LABELS).map((s) => (
              <div key={s} className="flex items-center justify-between">
                <span className="text-sm text-navy/70">{ORDER_LABELS[s]}</span>
                <span className="text-sm font-bold text-navy">
                  {stats.ordersByStatus[s] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group flex items-center justify-between rounded-2xl border border-navy/10 bg-white p-5 transition-colors hover:border-teal-600/40"
          >
            <div>
              <div className="font-bold text-navy">{l.label}</div>
              <div className="mt-0.5 text-xs text-navy/55">{l.desc}</div>
            </div>
            <ArrowLeft className="h-4 w-4 text-navy/30 transition-colors group-hover:text-teal-700" />
          </Link>
        ))}
      </div>

      {/* Owner references */}
      <div className="mt-6 rounded-2xl border border-dashed border-navy/15 bg-offwhite p-5 text-sm leading-7 text-navy/65">
        مراجع التشغيل: المتطلبات المؤجّلة في{" "}
        <code className="rounded bg-white px-1.5 py-0.5">
          docs/DEFERRED_PRODUCTION_REQUIREMENTS.md
        </code>{" "}
        · خطوات النشر في{" "}
        <code className="rounded bg-white px-1.5 py-0.5">DEPLOYMENT_CHECKLIST.md</code>{" "}
        · القيود المعروفة في{" "}
        <code className="rounded bg-white px-1.5 py-0.5">docs/KNOWN_LIMITATIONS.md</code>.
      </div>
    </div>
  );
}
