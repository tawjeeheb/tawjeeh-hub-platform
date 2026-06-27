import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/auth-forms";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { getSessionUser } from "@/lib/auth";
import { safeRelativePath } from "@/lib/utils";

export const metadata: Metadata = { title: "تسجيل الدخول" };

// Friendly, non-leaking messages for callback/OAuth failure codes.
const ERROR_MESSAGES: Record<string, string> = {
  oauth: "تعذّر إكمال تسجيل الدخول عبر المزوّد. حاول مرة أخرى.",
  oauth_cancelled: "تم إلغاء تسجيل الدخول. يمكنك المحاولة مجددًا.",
  auth_disabled: "خدمة الحسابات غير مفعّلة بعد. يرجى ضبط إعدادات Supabase.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  const user = await getSessionUser();
  if (user) redirect(safeRelativePath(searchParams.next));

  const errorMessage = searchParams.error
    ? ERROR_MESSAGES[searchParams.error] ?? ERROR_MESSAGES.oauth
    : null;

  return (
    <AuthShell
      title="تسجيل الدخول"
      subtitle="ادخل إلى حسابك للوصول إلى أدلتك المهنية"
      footer={
        <>
          ليس لديك حساب؟{" "}
          <Link
            href="/auth/signup"
            className="font-semibold text-teal-700 hover:text-teal-600"
          >
            إنشاء حساب
          </Link>
        </>
      }
    >
      {errorMessage && (
        <p
          role="alert"
          className="mb-5 rounded-xl bg-plum-50 px-4 py-3 text-sm font-medium text-plum-700"
        >
          {errorMessage}
        </p>
      )}

      {/* 1–2. Social sign-in (fewest clicks to an account) */}
      <OAuthButtons next={searchParams.next} />

      {/* 3. Elegant divider */}
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-navy/10" />
        <span className="text-xs font-medium text-navy/40">أو بالبريد الإلكتروني</span>
        <span className="h-px flex-1 bg-navy/10" />
      </div>

      {/* 4. Email + password */}
      <LoginForm next={searchParams.next} />

      {/* 6. Forgot password */}
      <div className="mt-4 text-center">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-navy/60 hover:text-navy"
        >
          نسيت كلمة المرور؟
        </Link>
      </div>
    </AuthShell>
  );
}
