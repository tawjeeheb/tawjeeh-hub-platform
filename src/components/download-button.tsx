"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Requests a fresh signed URL from the server and navigates to it. The file URL
// is never rendered into the page; it is fetched on demand and discarded.
export function DownloadButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/download/${productId}`, {
        method: "GET",
        redirect: "follow",
      });

      if (res.redirected) {
        window.location.href = res.url;
        return;
      }
      if (res.ok) {
        // Some environments return the file directly.
        window.location.href = `/api/download/${productId}`;
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "تعذّر بدء التحميل.");
    } catch {
      setError("حدث خطأ أثناء التحميل.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button onClick={handleDownload} disabled={loading} variant="teal" size="sm">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        تحميل آمن
      </Button>
      {error && (
        <p className="mt-1 text-xs font-medium text-plum-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
