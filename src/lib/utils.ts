import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names with conflict resolution. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Returns a SAME-ORIGIN relative path or the fallback — prevents open redirects.
 * Only a single-slash-rooted path is allowed. Rejects:
 *  - non-string / non-rooted values (absolute URLs, "javascript:", bare words)
 *  - protocol-relative ("//host")
 *  - ANY backslash (browsers may fold "\" into "/", so "/\host" reads as authority)
 *  - ANY whitespace OR C0/DEL control char — e.g. NUL in "/\0/host" that some
 *    browsers strip down to "//host", plus U+2028/U+2029 line separators (\s).
 */
export function safeRelativePath(
  value: unknown,
  fallback = "/dashboard",
): string {
  if (typeof value !== "string") return fallback;
  const v = value.trim();
  if (!v.startsWith("/")) return fallback; // must be a rooted path
  if (v.startsWith("//")) return fallback; // protocol-relative authority
  if (v.includes("\\")) return fallback; // backslash → authority trick
  // eslint-disable-next-line no-control-regex
  if (/[\s\u0000-\u001f\u007f]/.test(v)) return fallback; // whitespace + controls
  return v;
}

/** Format a price in Saudi Riyal for an Arabic (ar-SA) audience. */
export function formatSar(amount: number): string {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format an ISO date string into a readable Arabic date. */
export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
