"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

interface NavItem {
  href: string;
  label: string;
}

// Compact mobile navigation disclosure. Lives inside the server header and
// receives already-resolved nav + auth state as props (no client data fetching).
export function MobileNav({
  items,
  isAuthed,
  isAdmin,
}: {
  items: NavItem[];
  isAuthed: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-navy/15 text-navy"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 border-b border-navy/10 bg-white shadow-soft">
          <nav className="container flex flex-col gap-1 py-4">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-semibold text-navy/80 hover:bg-navy-50"
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-3 flex flex-col gap-2 border-t border-navy/10 pt-4">
              {isAuthed ? (
                <>
                  {isAdmin && (
                    <ButtonLink
                      href="/admin"
                      variant="outline"
                      onClick={() => setOpen(false)}
                    >
                      لوحة الإدارة
                    </ButtonLink>
                  )}
                  <ButtonLink href="/dashboard" onClick={() => setOpen(false)}>
                    حسابي
                  </ButtonLink>
                </>
              ) : (
                <>
                  <ButtonLink
                    href="/auth/login"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    تسجيل الدخول
                  </ButtonLink>
                  <ButtonLink href="/auth/signup" onClick={() => setOpen(false)}>
                    إنشاء حساب
                  </ButtonLink>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
