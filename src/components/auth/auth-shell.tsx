import Link from "next/link";
import { ArrowRight, FolderLock, ShieldCheck, Download } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ChevronMotif } from "@/components/brand/brand-motif";
import { Stamp, ClassDots, GuideCover } from "@/components/brand/studio";

const BRAND_POINTS = [
  { icon: FolderLock, label: "حسابك يحفظ أدلتك المهنية وملفاتك بعد الشراء" },
  { icon: ShieldCheck, label: "دخول آمن للوصول إلى مكتبتك" },
  { icon: Download, label: "تحميل فوري وموثّق بعد الشراء" },
];

// Focused, premium two-column auth experience. No marketing header/footer.
// A single logo appears on the form side; the brand panel (lg+) uses text and
// the chevron motif only.
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel — desktop only */}
      <aside className="relative hidden overflow-hidden bg-navy p-12 lg:flex lg:flex-col lg:justify-between">
        <ChevronMotif className="pointer-events-none absolute -left-10 -top-10 h-72 w-72 text-white/10" />
        <ChevronMotif className="pointer-events-none absolute -bottom-16 -right-8 h-64 w-64 text-white/5" />
        <Link
          href="/"
          className="relative inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 transition-colors hover:bg-white/15"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للرئيسية
        </Link>

        <div className="relative">
          <Stamp label="حسابك الشخصي" tone="teal" className="border-white/25 text-teal-100" />
          <h2 className="mt-5 text-balance font-display text-[2rem] font-extrabold leading-snug text-white">
            مكتبتك المهنية
            <br />
            في مكان واحد آمن
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/70">
            من حسابك تصل إلى أدلتك المهنية وتحمّلها بأمان في أي وقت.
          </p>
          <ul className="mt-8 space-y-4">
            {BRAND_POINTS.map((p) => (
              <li key={p.label} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-teal-100">
                  <p.icon className="h-5 w-5" />
                </span>
                {p.label}
              </li>
            ))}
          </ul>

          {/* signature library visual */}
          <div className="mt-10 flex items-center gap-5">
            <div className="w-24 -rotate-6">
              <GuideCover
                title="الشريعة والدراسات الإسلامية"
                category="دليل ٠١"
                categoryKey="sharia"
                index="٠١"
              />
            </div>
            <ClassDots className="opacity-70" />
          </div>
        </div>

        <p className="relative text-xs text-white/40">
          © {new Date().getFullYear()} توجيه هاب · Tawjeeh HUB
        </p>
      </aside>

      {/* Form side */}
      <main className="relative flex items-center justify-center bg-offwhite px-5 py-10 sm:px-8">
        <div className="guidance-grid absolute inset-0 opacity-50 lg:hidden" />
        <div className="relative w-full max-w-md">
          {/* Single logo */}
          <div className="mb-8 text-center">
            <Logo className="justify-center" priority />
            <h1 className="mt-7 text-2xl font-extrabold text-navy">{title}</h1>
            <p className="mt-2 text-sm text-navy/60">{subtitle}</p>
          </div>

          <div className="rounded-2xl border border-navy/10 bg-white p-7 shadow-soft sm:p-8">
            {children}
          </div>

          {footer && (
            <div className="mt-6 text-center text-sm text-navy/60">{footer}</div>
          )}

          {/* Mobile back link (brand panel is hidden on small screens) */}
          <div className="mt-6 text-center lg:hidden">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm font-semibold text-navy/55 hover:text-navy"
            >
              <ArrowRight className="h-4 w-4" />
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
