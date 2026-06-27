"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button";

// Site-segment error boundary. Renders inside the (site) header/footer and never
// exposes internal error details to the user.
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log only the digest reference server-side; no internals in the UI.
    console.error("Section error", error.digest ?? "");
  }, [error]);

  return (
    <div className="container flex min-h-[55vh] flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-bold text-navy">تعذّر تحميل هذا القسم</h1>
      <p className="mt-2 max-w-md text-sm leading-7 text-navy/60">
        حدث خطأ مؤقت. يمكنك إعادة المحاولة، وإذا استمرت المشكلة عُد إلى الصفحة
        الرئيسية.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset} variant="primary">
          <RotateCw className="h-4 w-4" />
          إعادة المحاولة
        </Button>
        <ButtonLink href="/" variant="outline">
          الصفحة الرئيسية
        </ButtonLink>
      </div>
    </div>
  );
}
