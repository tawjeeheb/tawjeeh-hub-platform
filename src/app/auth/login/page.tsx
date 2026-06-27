import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/auth-forms";
import { getSessionUser } from "@/lib/auth";
import { safeRelativePath } from "@/lib/utils";

export const metadata: Metadata = { title: "تسجيل الدخول" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const user = await getSessionUser();
  if (user) redirect(safeRelativePath(searchParams.next));

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
      <LoginForm next={searchParams.next} />
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
