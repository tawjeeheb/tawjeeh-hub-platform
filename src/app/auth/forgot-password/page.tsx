import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "استعادة كلمة المرور" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="استعادة كلمة المرور"
      subtitle="أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين"
      footer={
        <Link
          href="/auth/login"
          className="font-semibold text-teal-700 hover:text-teal-600"
        >
          العودة لتسجيل الدخول
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
