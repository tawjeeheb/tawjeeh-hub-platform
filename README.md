# توجيه هاب · Tawjeeh HUB

منصة تجارية وطنية لبيع الأدلة المهنية السعودية الرقمية (ملفات PDF متخصصة، كل ملف
يحتوي بطاقات وظيفية سعودية). مبنية بـ Next.js App Router + TypeScript + Tailwind،
بهيكلية جاهزة للربط مع Supabase (Auth / Postgres / Storage خاص / RLS) ومع بوابات
الدفع لاحقًا.

> هذا المستودع يحتوي أيضًا على ملفات محتوى ومراجع تصميم سابقة (ملفات `*.md`,
> `prompts/`, `sources/`, ومراجع الصور). كود المنصة موجود تحت `src/`.

---

## المتطلبات

- Node.js 20+ و npm 10+
- (للإنتاج) مشروع Supabase + بوابة دفع سعودية (Moyasar / HyperPay / PayTabs)

## التشغيل محليًا

```bash
npm install
cp .env.example .env.local   # ثم عبّئ القيم
npm run dev                  # http://localhost:3000
```

المنصة تعمل **بدون Supabase** أيضًا: يتم عرض كتالوج تجريبي من بيانات seed محليًا،
بينما تتطلب ميزات الحساب والشراء والتحميل ضبط Supabase.

## الفحوص

```bash
npm run typecheck     # TypeScript strict
npm run lint          # ESLint (next/core-web-vitals)
npm run build         # بناء الإنتاج
npm run test:redirect # وحدة: safeRelativePath يرفض كل حمولات open-redirect (Node 22+)
npm run test:products # وحدة: قواعد حالة المنتج والظهور العام (Node 22+)
npm audit --audit-level=moderate
```

اختبار أمني عملي (شغّل الخادم أولًا ثم):

```bash
npm run start &
BASE_URL=http://localhost:3000 node scripts/security-smoke.mjs
```

يتحقق السكريبت من: الصفحات العامة 200، إعادة توجيه dashboard/admin لغير المصرّح،
رفض checkout/download بدون مصادقة، رفض webhook بدون توقيع صحيح، أن callback مجرد
redirect بلا تغيير حالة، ووجود security headers.

> **اختبار الدفع (mock):** عودة المتصفح (callback) لا تُفعّل أي شيء إطلاقًا.
> التفعيل يتم حصريًا عبر webhook موقّع. لاختبار مسار الدفع محليًا بعد إنشاء طلب:
> `PAYMENT_WEBHOOK_SECRET=... node scripts/simulate-webhook.mjs <orderId> paid`

---

## المتغيرات البيئية

انظر `.env.example` للقائمة الكاملة. أهمها:

| المتغير | الوصف |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | عنوان الموقع (لإعادة التوجيه وروابط الدفع) |
| `NEXT_PUBLIC_SUPABASE_URL` | عنوان مشروع Supabase (عام) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | مفتاح anon العام |
| `SUPABASE_SERVICE_ROLE_KEY` | مفتاح service-role — **خادم فقط**، يتجاوز RLS |
| `SUPABASE_PRIVATE_BUCKET` | اسم الـ bucket الخاص لملفات المنتجات |
| `DOWNLOAD_URL_EXPIRY_SECONDS` | مدة صلاحية رابط التحميل الموقّع (قصيرة) |
| `PAYMENT_PROVIDER` | `mock` \| `moyasar` \| `hyperpay` \| `paytabs` |
| `PAYMENT_WEBHOOK_SECRET` | سرّ التحقق من توقيع webhook الدفع |

لا تضع أي سرّ داخل الكود، ولا تُضِف ملف `.env.local` إلى Git.

---

## النشر والقيود

- خطوات النشر المختصرة: **[`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md)**
- دليل المالك / لوحة الإدارة (إنشاء أدمن، إدارة المنتجات، حالات النشر): **[`docs/ADMIN_GUIDE.md`](docs/ADMIN_GUIDE.md)**
- المتطلبات المؤجَّلة (مفاتيح/خدمات تحجب البيع الحقيقي): **[`docs/DEFERRED_PRODUCTION_REQUIREMENTS.md`](docs/DEFERRED_PRODUCTION_REQUIREMENTS.md)**
- القيود المعروفة (soft-404، rate-limit، تنبيهات Next): **[`docs/KNOWN_LIMITATIONS.md`](docs/KNOWN_LIMITATIONS.md)**

## إعداد Supabase

الدليل الكامل خطوة بخطوة في **[`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md)**.
باختصار:

1. أنشئ مشروع Supabase، وانسخ الـ URL + anon + service role.
2. شغّل `supabase/schema.sql` (جداول، RLS، triggers، bucket خاص).
3. شغّل `supabase/seed.sql` (منتجات تجريبية).
4. عبّئ `.env.local` من `.env.example`، ثم تحقق من الجاهزية:
   ```bash
   node --env-file=.env.local scripts/backend-readiness.mjs   # أو: npm run backend-readiness
   ```
5. سجّل مستخدمًا من `/auth/signup`، ثم رقّه إلى أدمن بأمان:
   ```bash
   node --env-file=.env.local scripts/bootstrap-admin.mjs you@example.com
   ```
6. ارفع ملف PDF إلى الـ bucket الخاص، اربط `file_path` بالمنتج، ثم:
   ```bash
   node --env-file=.env.local scripts/verify-private-file-access.mjs
   ```

### سكربتات الـ backend
| السكربت | الغرض |
| --- | --- |
| `scripts/backend-readiness.mjs` | فحص env + الاتصال + الجداول + RLS + خصوصية الـ bucket |
| `scripts/bootstrap-admin.mjs` | ترقية مستخدم إلى أدمن عبر service role فقط |
| `scripts/verify-private-file-access.mjs` | إثبات أن الملف خاص ولا يُحمّل إلا بـ signed URL |
| `scripts/simulate-webhook.mjs` | محاكاة دفع عبر webhook موقّع (محلي فقط) |
| `scripts/security-smoke.mjs` | فحص الحماية على سيرفر يعمل |

---

## البنية والأمان

```
src/
  app/                صفحات App Router + route handlers + server actions
    api/checkout      إنشاء طلب وبدء جلسة دفع (لا بيانات بطاقات)
    api/webhooks/...  استقبال webhook الدفع مع تحقق التوقيع
    api/download/...  تحميل محمي عبر روابط موقّعة قصيرة الأجل
    admin/            لوحة الإدارة (CRUD منتجات، طلبات، عملاء، سجل أحداث)
    dashboard/        لوحة العميل (ملفاتي، الطلبات، تحميل آمن)
  components/          واجهات UI وبراند RTL
  lib/                supabase clients, env, auth, zod, audit, rate-limit, payments
supabase/             schema.sql + seed.sql (جداول + RLS + bucket خاص)
```

أبرز ضوابط الأمان المطبّقة:

- **لا تخزين لبيانات البطاقات** إطلاقًا — الدفع عبر صفحة المزوّد المستضافة فقط.
- **ملفات PDF ليست عامة** — bucket خاص، والتحميل عبر **روابط موقّعة قصيرة الأجل**
  فقط بعد: مستخدم مسجّل + طلب مدفوع + entitlement فعّال.
- **كل الحماية على الخادم** عبر RLS وفحوص `requireUser` / `requireAdmin`؛ لا
  اعتماد على الواجهة.
- **فصل الأدوار** `admin` / `customer`.
- **التحقق بـ Zod** لكل مدخلات (auth، checkout، admin CRUD).
- **Security headers** (CSP، HSTS، X-Frame-Options، …) في `next.config.mjs`.
- **Rate limiting** في الـ middleware وفي route handlers (placeholder قابل
  للترقية إلى Redis).
- **Webhook signature verification** عبر HMAC-SHA256 بمقارنة ثابتة الزمن.
- **Audit log** للأحداث المهمة: تسجيل دخول، إنشاء طلب، تأكيد دفع، تحميل ملف،
  تحديث منتج من الإدارة.
- **معالجة أخطاء نظيفة** دون كشف تفاصيل داخلية.

---

## الخطوة التالية للربط بالدفع

1. اختر المزوّد (Moyasar / HyperPay / PayTabs) واضبط `PAYMENT_PROVIDER` ومفاتيحه.
2. طبّق `PaymentAdapter` للمزوّد في `src/lib/payments/adapter.ts`:
   - `createCheckout`: إنشاء جلسة دفع مستضافة وإرجاع `redirectUrl`.
   - `verifyAndParseWebhook`: التحقق من توقيع المزوّد وتطبيع الحدث.
3. سجّل رابط الـ webhook لدى المزوّد: `/api/webhooks/payment`.
4. الفولفلمنت (تفعيل الـ entitlement) يتم في `src/lib/payments/fulfillment.ts`
   بشكل idempotent — لا حاجة لتغييره عند تبديل المزوّد.

بقية المهام التطويرية في `ROADMAP.md`.
