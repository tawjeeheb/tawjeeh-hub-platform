import { cn } from "@/lib/utils";

// ── Visual identity system for Tawjeeh HUB: a "professional guides archive".
// Stamps, numbered file-index labels, layered guide covers, classification dots.

type Accent = "navy" | "teal" | "plum";

// Each specialty gets a distinct on-brand accent (palette stays navy/teal/plum).
export function categoryAccent(key: string): {
  accent: Accent;
  spine: string;
  chip: string;
  soft: string;
} {
  const map: Record<string, Accent> = {
    sharia: "navy",
    medical: "teal",
    geo: "plum",
    "language-ai": "teal",
  };
  const accent = map[key] ?? "navy";
  const spine = {
    navy: "bg-navy",
    teal: "bg-teal",
    plum: "bg-plum",
  }[accent];
  const chip = {
    navy: "bg-navy-50 text-navy",
    teal: "bg-teal-50 text-teal-700",
    plum: "bg-plum-50 text-plum-700",
  }[accent];
  const soft = {
    navy: "from-navy-50",
    teal: "from-teal-50",
    plum: "from-plum-50",
  }[accent];
  return { accent, spine, chip, soft };
}

// A subtle dashed "stamp" like a file marking — never cartoonish.
export function Stamp({
  label,
  className,
  tone = "teal",
}: {
  label: string;
  className?: string;
  tone?: Accent;
}) {
  const color = {
    navy: "border-navy/30 text-navy/70",
    teal: "border-teal-700/35 text-teal-700/85",
    plum: "border-plum/35 text-plum-700/85",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex select-none items-center gap-1 rounded-md border border-dashed px-2.5 py-1 text-[10px] font-extrabold tracking-wide",
        color,
        className,
      )}
    >
      {label}
    </span>
  );
}

// Editorial numbered section label: ٠١ ──── المشكلة
export function SectionLabel({
  index,
  children,
  className,
}: {
  index: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-wide text-navy/45",
        className,
      )}
    >
      <span className="font-display text-base font-extrabold text-teal-700">
        {index}
      </span>
      <span className="h-px w-7 bg-navy/20" />
      {children}
    </span>
  );
}

// Three small classification dots used as a recurring archive motif.
export function ClassDots({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-teal" />
      <span className="h-1.5 w-1.5 rounded-full bg-plum/70" />
      <span className="h-1.5 w-1.5 rounded-full bg-navy/25" />
    </span>
  );
}

// A stylized guide "booklet" cover with a colored spine + index tab. The
// repeatable product object across every specialty.
export function GuideCover({
  title,
  category,
  categoryKey,
  index = "٠١",
  className,
}: {
  title: string;
  category: string;
  categoryKey: string;
  index?: string;
  className?: string;
}) {
  const { spine, chip } = categoryAccent(categoryKey);
  return (
    <div
      className={cn(
        "relative aspect-[3/4] overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-elev ring-1 ring-inset ring-white/60",
        className,
      )}
    >
      {/* colored spine + hairline groove on the right edge (RTL) */}
      <span className={cn("absolute inset-y-0 right-0 w-2.5", spine)} />
      <span className="absolute inset-y-0 right-2.5 w-px bg-navy/10" />
      {/* index tab */}
      <span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg bg-navy font-display text-sm font-extrabold text-white shadow-soft">
        {index}
      </span>
      <div className="flex h-full flex-col p-5 pr-7">
        <span className={cn("field-tag mt-1 w-fit", chip)}>{category}</span>
        <p className="mt-3 font-display text-base font-extrabold leading-snug text-navy">
          {title}
        </p>
        {/* mini index lines */}
        <div className="mt-auto space-y-2">
          <span className="block h-1.5 w-full rounded-full bg-navy/[0.09]" />
          <span className="block h-1.5 w-4/5 rounded-full bg-navy/[0.09]" />
          <span className="block h-1.5 w-3/5 rounded-full bg-navy/[0.06]" />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-navy/[0.06] pt-3">
          <ClassDots />
          <span className="text-[10px] font-bold text-navy/35">دليل مهني</span>
        </div>
      </div>
    </div>
  );
}

// A small circular "secure download" seal — a signature trust mark.
export function SecureDownloadMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-dashed border-teal-700/30 bg-teal-50/60 px-3 py-1.5",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-teal-700" fill="none" aria-hidden>
        <path
          d="M12 2l7 3v6c0 4.4-3 8.3-7 9-4-0.7-7-4.6-7-9V5l7-3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 12.2v-1.4a2.5 2.5 0 1 1 5 0v1.4M9 12h6v3.2H9z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[11px] font-extrabold text-teal-700">تحميل آمن موثّق</span>
    </span>
  );
}
