import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/auth-forms";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = { title: "إنشاء حساب" };

// Reads the session to redirect already-authenticated users.
export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <AuthShell
      title="إنشاء حساب"
      subtitle="أنشئ حسابك للوصول إلى الأدلة المهنية وتحميلها بأمان"
      footer={
        <>
          لديك حساب بالفعل؟{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-teal-700 hover:text-teal-600"
          >
            تسجيل الدخول
          </Link>
        </>
      }
    >
      {/* Social sign-up first — the fastest path to an account */}
      <OAuthButtons next="/dashboard" />
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-navy/10" />
        <span className="text-xs font-medium text-navy/40">أو بالبريد الإلكتروني</span>
        <span className="h-px flex-1 bg-navy/10" />
      </div>

      <SignupForm />
      <p className="mt-5 text-center text-xs leading-6 text-navy/50">
        بإنشائك الحساب فإنك توافق على{" "}
        <Link href="/legal/terms" className="underline hover:text-navy">
          الشروط والأحكام
        </Link>{" "}
        و
        <Link href="/legal/privacy" className="underline hover:text-navy">
          سياسة الخصوصية
        </Link>
        .
      </p>
    </AuthShell>
  );
}
