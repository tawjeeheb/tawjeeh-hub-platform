"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { signInWithProviderAction } from "@/app/auth/actions";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.46h6.47a5.53 5.53 0 0 1-2.4 3.63v3.02h3.88c2.27-2.09 3.57-5.17 3.57-8.75Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3.02c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.12A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.61H1.27a12 12 0 0 0 0 10.78l4-3.12Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.43-3.43A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.27 6.61l4 3.12C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 12.86c-.02-2.18 1.78-3.23 1.86-3.28-1.01-1.48-2.59-1.68-3.15-1.7-1.34-.14-2.62.79-3.3.79-.68 0-1.73-.77-2.85-.75-1.47.02-2.82.85-3.58 2.17-1.53 2.65-.39 6.57 1.1 8.72.73 1.05 1.59 2.23 2.73 2.19 1.1-.04 1.51-.71 2.84-.71 1.32 0 1.7.71 2.85.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.4 1.2-2.46-.03-.01-2.3-.88-2.32-3.5ZM14.88 6.55c.6-.73 1.01-1.74.9-2.75-.87.04-1.92.58-2.54 1.31-.56.64-1.05 1.67-.92 2.65.97.08 1.96-.49 2.56-1.21Z" />
    </svg>
  );
}

function ProviderButton({
  provider,
  label,
  icon,
}: {
  provider: "google" | "apple";
  label: string;
  icon: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="provider"
      value={provider}
      disabled={pending}
      aria-label={label}
      className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-navy/15 bg-white text-sm font-semibold text-navy transition-colors hover:bg-navy-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : icon}
      {label}
    </button>
  );
}

// Google + Apple sign-in. Each renders as its own form so it works without
// client JS; the shared server action sanitizes `next` and starts the hosted
// OAuth flow. Buttons disable themselves while submitting (no double-clicks).
export function OAuthButtons({ next }: { next?: string }) {
  return (
    <div className="space-y-3">
      <form action={signInWithProviderAction}>
        <input type="hidden" name="next" value={next ?? "/dashboard"} />
        <ProviderButton
          provider="google"
          label="المتابعة بواسطة Google"
          icon={<GoogleIcon />}
        />
      </form>
      <form action={signInWithProviderAction}>
        <input type="hidden" name="next" value={next ?? "/dashboard"} />
        <ProviderButton
          provider="apple"
          label="المتابعة بواسطة Apple"
          icon={<AppleIcon />}
        />
      </form>
    </div>
  );
}
