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

// Only these providers are accepted — never trust the raw form value.
const OAUTH_PROVIDERS = ["google", "apple"] as const;
type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

function isProvider(v: FormDataEntryValue | null): v is OAuthProvider {
  return typeof v === "string" && (OAUTH_PROVIDERS as readonly string[]).includes(v);
}

// Starts a hosted OAuth sign-in (Google / Apple). On success we redirect the
// browser to the provider; the session is finalized at /auth/callback. Errors
// (or an unconfigured backend) bounce back to the login page with a code — we
// never surface raw provider/Supabase errors. `next` is sanitized to a
// same-origin path so OAuth can never be abused as an open redirect.
export async function signInWithProviderAction(formData: FormData): Promise<void> {
  const provider = formData.get("provider");
  const safe = safeNext(formData.get("next"));

  if (!isProvider(provider)) {
    redirect(`/auth/login?error=oauth&next=${encodeURIComponent(safe)}`);
  }
  if (!isSupabaseConfigured) {
    redirect(`/auth/login?error=auth_disabled&next=${encodeURIComponent(safe)}`);
  }

  const supabase = createSupabaseServerClient()!;
  const redirectTo = `${env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(safe)}`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });

  if (error || !data?.url) {
    redirect(`/auth/login?error=oauth&next=${encodeURIComponent(safe)}`);
  }
  redirect(data.url);
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
      // Confirmation link lands on the callback, which finalizes the session and
      // sends the user straight to their dashboard (less friction to purchase).
      emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard`,
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
