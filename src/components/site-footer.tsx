import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ClassDots, Stamp } from "@/components/brand/studio";

const FOOTER_LINKS = [
  {
    title: "المنصة",
    links: [
      { href: "/products", label: "الأدلة المهنية" },
      { href: "/about", label: "فكرة المنصة" },
      { href: "/dashboard", label: "حسابي" },
    ],
  },
  {
    title: "المساعدة",
    links: [
      { href: "/#faq", label: "الأسئلة الشائعة" },
      { href: "/support", label: "الدعم والمساعدة" },
      { href: "/#how", label: "كيف تعمل المنصة" },
    ],
  },
  {
    title: "قانوني",
    links: [
      { href: "/legal/terms", label: "الشروط والأحكام" },
      { href: "/legal/privacy", label: "سياسة الخصوصية" },
      { href: "/legal/refund", label: "سياسة الاسترجاع" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-navy/10 bg-offwhite">
      <div className="container py-14">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[1.8fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-sm text-sm leading-7 text-navy/60">
              منصة وطنية متخصصة في إنتاج أدلة مهنية سعودية عالية الدقة، تساعد
              الطالب والخريج على فهم مسارات التخصص وفرصه داخل سوق العمل السعودي.
            </p>
            <ClassDots />
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-bold text-navy">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-navy/60 transition-colors hover:text-teal-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* honest professional note */}
        <div className="mt-10 flex items-start gap-3 rounded-xl border border-navy/10 bg-white p-4">
          <Stamp label="تنبيه" tone="plum" className="mt-0.5 shrink-0" />
          <p className="text-xs leading-6 text-navy/55">
            الأدلة المهنية أدوات توجيه ومرجع معلوماتي تساعدك على فهم المسارات
            والشروط والشهادات وجهات التوظيف، وهي لا تضمن الحصول على وظيفة ولا
            تَعِد بالتوظيف.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-navy/10 pt-6 text-center text-xs text-navy/50 sm:flex-row sm:text-start">
          <span>
            © {new Date().getFullYear()} توجيه هاب · Tawjeeh HUB — جميع الحقوق
            محفوظة.
          </span>
          <span>منصة سعودية للتوجيه المهني</span>
        </div>
      </div>
    </footer>
  );
}
