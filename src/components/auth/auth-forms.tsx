"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  loginAction,
  signupAction,
  forgotPasswordAction,
  type AuthFormState,
} from "@/app/auth/actions";

const initial: AuthFormState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full" size="lg">
      {pending ? "جارٍ المعالجة…" : label}
    </Button>
  );
}

function Messages({ state }: { state: AuthFormState }) {
  return (
    <>
      {state.error && (
        <p
          role="alert"
          className="rounded-xl bg-plum-50 px-4 py-3 text-sm font-medium text-plum-700"
        >
          {state.error}
        </p>
      )}
      {state.success && (
        <p
          role="status"
          className="rounded-xl bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700"
        >
          {state.success}
        </p>
      )}
    </>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useFormState(loginAction, initial);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? "/dashboard"} />
      <Messages state={state} />
      <div>
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required dir="ltr" />
      </div>
      <div>
        <Label htmlFor="password">كلمة المرور</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          dir="ltr"
        />
      </div>
      <SubmitButton label="تسجيل الدخول" />
    </form>
  );
}

export function SignupForm() {
  const [state, action] = useFormState(signupAction, initial);
  return (
    <form action={action} className="space-y-4">
      <Messages state={state} />
      <div>
        <Label htmlFor="full_name">الاسم الكامل</Label>
        <Input id="full_name" name="full_name" type="text" autoComplete="name" required />
      </div>
      <div>
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required dir="ltr" />
      </div>
      <div>
        <Label htmlFor="password">كلمة المرور</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          dir="ltr"
        />
        <p className="mt-1.5 text-xs text-navy/50">
          8 أحرف على الأقل.
        </p>
      </div>
      <SubmitButton label="إنشاء حساب" />
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useFormState(forgotPasswordAction, initial);
  return (
    <form action={action} className="space-y-4">
      <Messages state={state} />
      <div>
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required dir="ltr" />
      </div>
      <SubmitButton label="إرسال رابط إعادة التعيين" />
    </form>
  );
}
