"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, env } from "@/lib/env";
import { recordAudit } from "@/lib/audit";
import { safeRelativePath } from "@/lib/utils";
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
} from "@/lib/validations";

export interface AuthFormState {
  error?: string;
  success?: string;
}

const NOT_CONFIGURED: AuthFormState = {
  error: "خدمة الحسابات غير مفعّلة بعد. يرجى ضبط إعدادات Supabase.",
};

function safeNext(raw: FormDataEntryValue | null): string {
  // Same-origin relative paths only — see safeRelativePath (blocks open redirects).
  return safeRelativePath(typeof raw === "string" ? raw : undefined);
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured) return NOT_CONFIGURED;

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }

  const supabase = createSupabaseServerClient()!;
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Generic message — never reveal whether the email exists.
    return { error: "بيانات الدخول غير صحيحة." };
  }

  await recordAudit({ actorId: data.user?.id ?? null, action: "login" });
  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function signupAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured) return NOT_CONFIGURED;

  const parsed = signupSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }

  const supabase = createSupabaseServerClient()!;
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/login`,
    },
  });

  if (error) {
    return { error: "تعذّر إنشاء الحساب. تحقق من البيانات وحاول مجددًا." };
  }

  return {
    success:
      "تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيد الحساب ثم سجّل الدخول.",
  };
}

export async function forgotPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured) return NOT_CONFIGURED;

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بريد غير صحيح" };
  }

  const supabase = createSupabaseServerClient()!;
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/login`,
  });

  // Always return success to avoid leaking which emails are registered.
  return {
    success:
      "إذا كان البريد مسجلًا لدينا، فستصلك رسالة لإعادة تعيين كلمة المرور.",
  };
}

export async function signOutAction(): Promise<void> {
  const supabase = createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
