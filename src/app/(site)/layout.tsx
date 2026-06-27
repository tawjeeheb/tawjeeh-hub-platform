import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Marketing/app shell: header + footer wrap every public and authenticated
// page. Auth routes live OUTSIDE this group and intentionally render without
// this chrome (see src/app/auth/layout.tsx).
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Accessibility: keyboard skip link to the main content. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:right-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-navy focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        تخطّي إلى المحتوى
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
