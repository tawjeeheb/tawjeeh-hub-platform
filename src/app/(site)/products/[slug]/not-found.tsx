import { FileQuestion } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

// Segment-level 404 for unknown product slugs — ensures a real 404 status
// (not a soft-404) while keeping the catalog dynamic for admin-added products.
export default function ProductNotFound() {
  return (
    <div className="container flex min-h-[55vh] flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-offwhite text-navy/40">
        <FileQuestion className="h-7 w-7" />
      </div>
      <h1 className="mt-5 font-display text-2xl font-extrabold text-navy">
        هذا الدليل غير موجود
      </h1>
      <p className="mt-2 max-w-md text-sm leading-7 text-navy/60">
        قد يكون الرابط قديمًا أو تغيّر. استعرض مكتبة الأدلة المهنية لاختيار دليل
        تخصصك.
      </p>
      <div className="mt-6 flex gap-3">
        <ButtonLink href="/products" variant="primary">
          مكتبة الأدلة
        </ButtonLink>
        <ButtonLink href="/" variant="outline">
          الصفحة الرئيسية
        </ButtonLink>
      </div>
    </div>
  );
}
