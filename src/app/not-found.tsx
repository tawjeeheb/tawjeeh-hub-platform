import { ButtonLink } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Root 404 boundary. It lives at the root (outside the (site) group), so it
// renders its own header/footer to stay consistent with the rest of the site.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
          <span className="text-6xl font-extrabold text-teal">٤٠٤</span>
          <h1 className="mt-4 text-2xl font-bold text-navy">
            الصفحة غير موجودة
          </h1>
          <p className="mt-2 max-w-md text-navy/60">
            عذرًا، الصفحة التي تبحث عنها غير متوفرة أو تم نقلها.
          </p>
          <div className="mt-6 flex gap-3">
            <ButtonLink href="/" variant="primary">
              الصفحة الرئيسية
            </ButtonLink>
            <ButtonLink href="/products" variant="outline">
              الأدلة المهنية
            </ButtonLink>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
