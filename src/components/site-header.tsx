import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";
import { getSessionUser } from "@/lib/auth";

const NAV = [
  { href: "/majors", label: "الوظائف حسب التخصص" },
  { href: "/products", label: "الأدلة المهنية" },
  { href: "/#how", label: "كيف يعمل" },
  { href: "/about", label: "فكرة المنصة" },
];

export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-white/85 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-9">
          <Logo priority />
          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-navy/70 transition-colors hover:text-navy"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {user.role === "admin" && (
                <ButtonLink href="/admin" variant="ghost" size="sm">
                  لوحة الإدارة
                </ButtonLink>
              )}
              <ButtonLink href="/dashboard" variant="outline" size="sm">
                حسابي
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink href="/auth/login" variant="ghost" size="sm">
                تسجيل الدخول
              </ButtonLink>
              <ButtonLink href="/auth/signup" variant="primary" size="sm">
                إنشاء حساب
              </ButtonLink>
            </>
          )}
        </div>

        <MobileNav
          items={NAV}
          isAuthed={Boolean(user)}
          isAdmin={user?.role === "admin"}
        />
      </div>
    </header>
  );
}
