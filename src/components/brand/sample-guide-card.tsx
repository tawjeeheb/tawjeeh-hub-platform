import { cn } from "@/lib/utils";

type Tag = "teal" | "plum" | "navy";

interface Field {
  label: string;
  value: string;
  tag?: Tag;
}

const TAG_CLASS: Record<Tag, string> = {
  teal: "bg-teal-50 text-teal-700",
  plum: "bg-plum-50 text-plum-700",
  navy: "bg-navy-50 text-navy",
};

// A stylized preview of one professional card from inside a guide. Pure layout
// (no photography) — it shows the actual structured value the product delivers.
const DEFAULT_FIELDS: Field[] = [
  { label: "المسمى الوظيفي", value: "كاتب عدل" },
  { label: "التصنيف السعودي (SSC)", value: "2612", tag: "teal" },
  { label: "المؤهل", value: "بكالوريوس شريعة / أنظمة" },
  { label: "الشهادة المهنية", value: "تأهيل عدلي", tag: "plum" },
  { label: "جهة التوظيف", value: "وزارة العدل", tag: "navy" },
];

export function SampleGuideCard({
  className,
  title = "بطاقة مهنية",
  index = "٠١",
  category = "الشريعة والدراسات الإسلامية",
  fields = DEFAULT_FIELDS,
}: {
  className?: string;
  title?: string;
  index?: string;
  category?: string;
  fields?: Field[];
}) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-elev",
        className,
      )}
    >
      {/* Header */}
      <div className="relative flex items-center justify-between bg-navy-sheen px-5 py-4">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:14px_14px]"
        />
        <div className="relative">
          <p className="text-[11px] font-semibold text-teal-100">{category}</p>
          <p className="mt-0.5 font-display text-base font-extrabold text-white">
            {title}
          </p>
        </div>
        <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 font-display text-sm font-extrabold text-white">
          {index}
        </span>
      </div>

      {/* Fields */}
      <div className="divide-y divide-navy/[0.06]">
        {fields.map((f) => (
          <div
            key={f.label}
            className="flex items-center justify-between gap-3 px-5 py-3"
          >
            <span className="text-xs text-navy/55">{f.label}</span>
            {f.tag ? (
              <span className={cn("field-tag", TAG_CLASS[f.tag])}>
                {f.value}
              </span>
            ) : (
              <span className="text-sm font-bold text-navy">{f.value}</span>
            )}
          </div>
        ))}
      </div>

      {/* Footer accent */}
      <div className="flex items-center gap-2 border-t border-navy/[0.06] px-5 py-3">
        <span className="h-1.5 w-1.5 rounded-full bg-teal" />
        <span className="h-1.5 w-1.5 rounded-full bg-plum/70" />
        <span className="h-1.5 w-10 rounded-full bg-navy/10" />
        <span className="ms-auto text-[10px] font-semibold text-navy/40">
          توجيه هاب
        </span>
      </div>
    </div>
  );
}
