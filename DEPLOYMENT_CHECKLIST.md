# قائمة جاهزية النشر — Tawjeeh HUB

قائمة مختصرة للمالك قبل وأثناء أول نشر إنتاجي. لا تضع أي سرّ في Git؛ كل المفاتيح
تُدخل في واجهة الاستضافة فقط. التفاصيل خطوة بخطوة في `docs/SUPABASE_SETUP.md`.

## قبل النشر

- [ ] **مشروع Supabase جاهز** — شغّل `supabase/schema.sql` ثم `supabase/seed.sql`.
  - قاعدة بيانات قائمة من قبل؟ شغّل أيضًا
    `supabase/migrations/0001_product_status_draft_archived.sql` لإضافة حالتَي
    `draft`/`archived`.
- [ ] **إدارة المتجر بعد الدخول:** راجع `docs/ADMIN_GUIDE.md` (إنشاء أول مالك،
  إدارة المنتجات وحالات النشر، ولماذا لا تُعدَّل حالة «مدفوع» يدويًا).
- [ ] **المفاتيح المطلوبة جاهزة** (من Supabase → Settings → API):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (سرّي — خادم فقط)
- [ ] **رفع ملف PDF خاص** إلى الـ bucket `product-files` (Private) على المسار
  المرتبط بالمنتج (مثال: `products/sharia-islamic-studies-guide.pdf`).
- [ ] **التحقق من الخصوصية:** `npm run verify-files` و`npm run backend-readiness`
  يرجعان أخضر (bucket خاص، `file_path` مخفي عن anon، signed URL يعمل).

## النشر (Render Blueprint)

- [ ] Render → New → **Blueprint** → هذا المستودع → الفرع `claude/clever-davinci-79zjrg`
  → المسار `render.yaml`.
- [ ] عبّئ المتغيّرات `sync:false` في واجهة Render (لا في Git):
  - `NEXT_PUBLIC_SITE_URL` — مؤقتًا `https://tawjeeh-hub.onrender.com`، ثم
    حدّثه إلى الرابط الفعلي بعد أول نشر وأعد النشر.
  - `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` ·
    `SUPABASE_SERVICE_ROLE_KEY`
  - `PAYMENT_WEBHOOK_SECRET` (سرّ عشوائي لتفعيل مسار webhook الموقّع لاحقًا).
- [ ] **Apply** وانتظر **Live**.

> ملاحظة: في الإنتاج يجب وجود الثلاثة (url + anon + service role) معًا، وإلا
> يفشل البناء بوضوح (حماية مقصودة في `src/lib/env.ts`).

## بعد النشر

- [ ] أنشئ مستخدمًا من `/auth/signup`، ثم رقّه إلى أدمن:
  `node --env-file=.env.local scripts/bootstrap-admin.mjs you@example.com`
  (أو شغّله من بيئة فيها المفاتيح).
- [ ] اربط `file_path` بالمنتج من `/admin/products` إن لم يكن مضبوطًا.
- [ ] افتح الرابط وتحقق: الرئيسية / المنتجات / منتج / `/auth/login` / `/robots.txt`
  / `/sitemap.xml`، وأن `/dashboard` و`/admin` يعيدان التوجيه قبل الدخول.

## الدفع الحقيقي (لاحقًا، خارج هذه المرحلة)

- [ ] اختر مزوّدًا سعوديًا معتمدًا (Moyasar / HyperPay / PayTabs).
- [ ] نفّذ محوّله في `src/lib/payments/adapter.ts` (`createCheckout` +
  `verifyAndParseWebhook`) واضبط `PAYMENT_PROVIDER` ومفاتيحه.
- [ ] سجّل رابط webhook لدى المزوّد: `/api/webhooks/payment`.

## ملاحظات أمنية

- [ ] **تدوير المفاتيح:** أي مفتاح ظهر سابقًا في أي مكان (محادثة/طرفية) يجب
  تدويره من Supabase قبل الإطلاق.
- [ ] `.env.local` غير مُتتبَّع في Git، ولا توجد أسرار في المستودع.
- [ ] ملفات الـ PDF والـ bucket تبقى **Private**؛ التحميل عبر signed URLs فقط.
- [ ] (اختياري) دومين مخصّص: أضِفه في Render وحدّث `NEXT_PUBLIC_SITE_URL`.
- [ ] (للتوسّع) فعّل Upstash Redis لـ rate limiting الموزّع.

## فحوص سريعة (محليًا قبل الدفع)

```bash
npm run typecheck && npm run lint && npm run build
npm run test:redirect       # وحدة open-redirect (لا يحتاج سيرفرًا · Node 22+)
npm run test:products       # وحدة حالات المنتج والظهور (لا يحتاج سيرفرًا · Node 22+)
npm run smoke-routes        # يحتاج سيرفرًا يعمل
npm run security-smoke      # يحتاج سيرفرًا يعمل
npm audit --audit-level=moderate
```
