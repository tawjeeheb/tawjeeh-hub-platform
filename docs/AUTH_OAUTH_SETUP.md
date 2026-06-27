# تفعيل تسجيل الدخول بـ Google و Apple

كود تسجيل الدخول الاجتماعي **جاهز ومُختبَر** في المنصة. لتشغيله فعليًا، تبقّت
إعدادات في حساباتك الخارجية فقط (لا يمكن للوكيل إنشاؤها). هذا الملف يحدّدها بدقة.

## كيف يعمل المسار (مرجع)
1. المستخدم يضغط «المتابعة بواسطة Google/Apple» → يبدأ `signInWithProviderAction`.
2. المتصفح يُحوَّل إلى المزوّد، ثم إلى Supabase
   (`https://<project-ref>.supabase.co/auth/v1/callback`).
3. Supabase يُعيد المتصفح إلى **تطبيقنا**: `<SITE_URL>/auth/callback?code=…`.
4. مسار `/auth/callback` يبادل الـ code بجلسة (PKCE) ويوجّه المستخدم إلى وجهته
   الآمنة (`next` بعد تعقيمه — لا open redirect).

> **مهم:** يجب أن يكون `NEXT_PUBLIC_SITE_URL` = دومين الإنتاج الحقيقي، وإلا
> سيعود OAuth إلى localhost. (للمعاينة بلا OAuth يمكن تركه فارغًا؛ لكن OAuth
> الحقيقي يتطلب ضبطه.)

---

## ١) Supabase (لوحة التحكم) — مطلوب لكلا المزوّدين
**Authentication → URL Configuration:**
- **Site URL:** `https://<your-render-domain>`
- **Redirect URLs** (allowlist) — أضِف:
  - `https://<your-render-domain>/auth/callback`
  - `http://localhost:3000/auth/callback` (للتطوير المحلي)

ثم فعّل المزوّدين من **Authentication → Providers** (التفاصيل أدناه).

---

## ٢) Google (Google Cloud Console)
1. **APIs & Services → OAuth consent screen:** نوع External، اسم التطبيق،
   بريد الدعم، والـ scopes: `email`, `profile`, `openid`.
2. **Credentials → Create credentials → OAuth client ID → Web application:**
   - **Authorized redirect URIs:**
     `https://<project-ref>.supabase.co/auth/v1/callback`
   - (اختياري) **Authorized JavaScript origins:** دومين موقعك.
3. انسخ **Client ID** و **Client Secret**.
4. في Supabase → **Providers → Google:** فعّل، والصق الـ Client ID والـ Secret.

> هذا كل ما يحتاجه Google. بعدها يعمل زر Google فورًا.

---

## ٣) Apple (يتطلب حساب Apple Developer مدفوع)
**هذه الخطوات لا يمكن إنجازها إلا من حسابك في Apple Developer:**
1. **Certificates, Identifiers & Profiles → Identifiers → Services IDs:** أنشئ
   Services ID (سيكون هو «client_id»). فعّل **Sign in with Apple** واضبط:
   - **Domains:** `<project-ref>.supabase.co`
   - **Return URLs:** `https://<project-ref>.supabase.co/auth/v1/callback`
2. **Keys:** أنشئ مفتاحًا جديدًا مفعّلًا عليه **Sign in with Apple**، ونزّل ملف
   **`.p8`**. سجّل **Key ID** و **Team ID**.
3. في Supabase → **Providers → Apple:** فعّل، وأدخل **Services ID**، ثم سرّ
   العميل (Client Secret) — وهو JWT موقّع بمفتاح `.p8`. ولّده حسب دليل Supabase
   لـ Apple (يحتاج Team ID + Key ID + محتوى `.p8` + الـ Services ID).

> **نقطة التوقف:** إنشاء الـ Services ID والـ Key (`.p8`) والحصول على Team ID /
> Key ID — كلها داخل حسابك في Apple Developer فقط. أنجِزها ثم الصق القيم في
> Supabase، وسيعمل زر Apple دون أي تغيير في الكود.

---

## ٤) لا حاجة لمتغيّرات بيئة جديدة في التطبيق
أسرار Google/Apple تُحفظ في **Supabase** لا في التطبيق. التطبيق يحتاج فقط
`NEXT_PUBLIC_SITE_URL` الصحيح (موجود مسبقًا).

## ٥) منع الحسابات المكررة
Supabase يربط الهوية بالبريد الإلكتروني. لتجنّب حسابين بنفس البريد عبر مزوّدين
مختلفين، فعّل في Supabase → **Authentication → Settings**:
**«Confirm email» / «Link accounts with the same email»** حسب سياستك. الإعداد
الافتراضي يمنع ازدواج البريد المؤكَّد.

## ما الذي يُختبر بعد الإعداد
بعد لصق المفاتيح في Supabase وضبط `NEXT_PUBLIC_SITE_URL`: جرّب Google ثم Apple،
سجّل الخروج، أعد الدخول (مستخدم عائد)، وتحقق أن المستخدم الجديد يُنشأ مرة واحدة.
