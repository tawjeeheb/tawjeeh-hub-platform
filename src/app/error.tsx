"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Global error boundary. Never surfaces internal error details to the user.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log server-side digest only; no secrets are exposed to the client UI.
    console.error("Unhandled error", error.digest ?? "");
  }, [error]);

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-bold text-navy">حدث خطأ غير متوقع</h1>
      <p className="mt-2 max-w-md text-navy/60">
        نعتذر عن ذلك. يمكنك المحاولة مرة أخرى، وإذا استمرت المشكلة تواصل معنا.
      </p>
      <div className="mt-6">
        <Button onClick={reset} variant="primary">
          إعادة المحاولة
        </Button>
      </div>
    </div>
  );
}
