import { cn } from "@/lib/utils";

// Decorative geometric chevron motif echoing the Tawjeeh HUB logo mark.
// Pure SVG, brand colors only — used as subtle ornamentation (never the logo).
export function ChevronMotif({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden
      className={cn("h-full w-full", className)}
    >
      <g
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M36 30 L66 60 L36 90" />
        <path d="M54 30 L84 60 L54 90" opacity="0.6" />
        <path d="M18 42 L36 60 L18 78" opacity="0.35" />
      </g>
    </svg>
  );
}

// A premium cover panel used on product cards / detail pages. No photography —
// a layered "professional card stack" motif on a deep navy sheen, signalling
// that the product is a set of structured professional cards.
export function ProductCover({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-navy-sheen",
        compact ? "h-40" : "h-52",
        className,
      )}
    >
      {/* dotted texture */}
      <div className="absolute inset-0 opacity-[0.14] [background-image:radial-gradient(rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:16px_16px]" />
      {/* teal glow */}
      <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-teal/25 blur-2xl" />
      <ChevronMotif className="absolute -left-8 -bottom-8 h-32 w-32 text-white/10" />

      {/* layered mini-card preview */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-[62%] w-[64%]">
          <div className="absolute right-3 top-3 h-full w-full rotate-6 rounded-xl bg-white/15" />
          <div className="absolute left-2 top-1.5 h-full w-full -rotate-3 rounded-xl bg-white/25" />
          <div className="relative flex h-full w-full flex-col gap-2 rounded-xl bg-white p-3 shadow-elev">
            <div className="flex items-center justify-between">
              <span className="h-2 w-12 rounded-full bg-navy/80" />
              <span className="field-tag bg-teal-50 text-teal-700">SSC</span>
            </div>
            <span className="h-1.5 w-full rounded-full bg-navy/10" />
            <span className="h-1.5 w-3/4 rounded-full bg-navy/10" />
            <div className="mt-auto flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-teal" />
              <span className="h-1.5 w-1.5 rounded-full bg-plum/70" />
              <span className="h-1.5 w-6 rounded-full bg-navy/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
