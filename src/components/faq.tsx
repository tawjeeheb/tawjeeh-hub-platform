import { Plus } from "lucide-react";

export interface FaqItem {
  q: string;
  a: string;
}

// Accessible FAQ using native <details>/<summary> — no client JS, RTL-friendly.
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="mx-auto mt-12 max-w-3xl divide-y divide-navy/10 overflow-hidden rounded-2xl border border-navy/10 bg-white">
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 text-start font-bold text-navy transition-colors hover:bg-offwhite [&::-webkit-details-marker]:hidden">
            <span>{item.q}</span>
            <Plus className="h-5 w-5 flex-shrink-0 text-teal-700 transition-transform duration-200 group-open:rotate-45" />
          </summary>
          <div className="px-6 pb-6 text-sm leading-7 text-navy/70">
            {item.a}
          </div>
        </details>
      ))}
    </div>
  );
}
