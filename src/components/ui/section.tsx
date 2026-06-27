import { cn } from "@/lib/utils";
import { SectionLabel } from "@/components/brand/studio";

// Consistent vertical rhythm + optional muted background for page sections.
export function Section({
  children,
  muted = false,
  className,
  bordered = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
  bordered?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "py-20 md:py-24",
        muted && "bg-offwhite",
        bordered && "border-y border-navy/10",
        className,
      )}
    >
      <div className="container">{children}</div>
    </section>
  );
}

// Numbered file-index label + title + optional subtitle. `index` gives the
// editorial archive rhythm (٠١ ─ المشكلة). Falls back to an eyebrow chip.
export function SectionHeading({
  eyebrow,
  index,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  index?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <div
      className={cn(
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
        className,
      )}
    >
      {index ? (
        <span
          className={cn(
            "inline-flex",
            align === "center" && "justify-center",
          )}
        >
          <SectionLabel index={index}>{eyebrow}</SectionLabel>
        </span>
      ) : (
        eyebrow && <span className="eyebrow">{eyebrow}</span>
      )}
      <h2 className="mt-4 text-balance font-display text-[2rem] font-extrabold leading-tight text-navy md:text-[2.4rem]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3.5 text-base leading-8 text-navy/65 md:text-[1.05rem]">
          {subtitle}
        </p>
      )}
    </div>
  );
}
