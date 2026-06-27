import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Uses the official Tawjeeh HUB logo asset. The logo is never redrawn.
export function Logo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center", className)}
      aria-label="توجيه هاب — الصفحة الرئيسية"
    >
      <Image
        src="/tawjeeh-hub-logo.png"
        alt="توجيه هاب · Tawjeeh HUB"
        width={150}
        height={40}
        priority={priority}
        className="h-9 w-auto"
      />
    </Link>
  );
}
