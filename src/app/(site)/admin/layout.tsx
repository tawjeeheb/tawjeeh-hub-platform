import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Briefcase,
  ShoppingBag,
  Users,
  ScrollText,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

// Admin is always per-request: it reads the session and must never be cached.
export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/admin/jobs", label: "الوظائف", icon: Briefcase },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
  { href: "/admin/customers", label: "العملاء", icon: Users },
  { href: "/admin/audit", label: "سجل الأحداث", icon: ScrollText },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="container py-10">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-navy/10 bg-white p-4">
            <div className="px-2 pb-3 pt-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy/40">
                لوحة الإدارة
              </p>
              <p className="mt-1 truncate text-sm font-bold text-navy">
                {admin.fullName ?? admin.email}
              </p>
            </div>
            <nav className="space-y-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-navy/70 transition-colors hover:bg-navy-50 hover:text-navy"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 border-t border-navy/10 pt-2">
              <SignOutButton />
            </div>
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
