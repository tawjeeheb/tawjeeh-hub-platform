"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Initiates checkout server-side. All authorization happens on the server;
// this button only kicks off the request and follows the returned redirect.
export function BuyButton({
  productId,
  price,
}: {
  productId: string;
  price: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });

      if (res.status === 401) {
        router.push(
          `/auth/login?next=${encodeURIComponent(window.location.pathname)}`,
        );
        return;
      }

      const data = (await res.json()) as {
        redirectUrl?: string;
        error?: string;
      };

      if (!res.ok || !data.redirectUrl) {
        setError(data.error ?? "تعذّر بدء عملية الشراء. حاول مرة أخرى.");
        return;
      }
      window.location.href = data.redirectUrl;
    } catch {
      setError("حدث خطأ غير متوقع. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleBuy}
        disabled={loading}
        size="lg"
        variant="teal"
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            جارٍ التحويل…
          </>
        ) : (
          <>اشترِ الآن — {price}</>
        )}
      </Button>
      {error && (
        <p className="text-sm font-medium text-plum-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
