# تشغيل Tawjeeh HUB على Supabase

دليل قصير لتفعيل الـ backend الحقيقي (Auth + Postgres + Storage خاص + RLS).
الدفع يبقى في وضع safe-fail حتى ربط مزود حقيقي لاحقًا.

> كل الأوامر تُشغّل من جذر المشروع. لتحميل المتغيّرات استخدم علم Node:
> `node --env-file=.env.local scripts/<script>.mjs`

---

## 1) إنشاء مشروع Supabase
1. أنشئ مشروعًا جديدًا على https://supabase.com.
2. من **Project Settings → API** انسخ:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (سرّي — خادم فقط)

## 2) تشغيل المخطط (schema)
1. افتح **SQL Editor** في Supabase.
2. الصق محتوى `supabase/schema.sql` كاملًا و **Run**.
   - ينشئ الجداول، RLS، triggers، الدوال، والـ bucket الخاص `product-files`.

## 3) تشغيل البيانات التجريبية (seed)
1. في SQL Editor، الصق محتوى `supabase/seed.sql` و **Run**.
   - يضيف 4 أدلة مهنية تجريبية مع `file_path` جاهز للربط.

## 4) ضبط المتغيّرات البيئية
1. انسخ `.env.example` إلى `.env.local`.
2. عبّئ قيم Supabase الثلاث + `NEXT_PUBLIC_SITE_URL`.
3. للدفع التجريبي محليًا فقط: عيّن `PAYMENT_PROVIDER=mock` و`PAYMENT_WEBHOOK_SECRET` بقيمة عشوائية.

> تنبيه: Supabase **الكل أو لا شيء**. إذا ضبطت الـ URL بدون anon (أو العكس)
> سيفشل التشغيل بوضوح. في الإنتاج، وجود Supabase يستلزم `SUPABASE_SERVICE_ROLE_KEY`.

تحقق من الجاهزية:
```bash
node --env-file=.env.local scripts/backend-readiness.mjs
```

## 5) إنشاء أول مستخدم
1. شغّل التطبيق: `npm run dev`.
2. من `/auth/signup` أنشئ حسابًا بالبريد الذي تريده أن يكون أدمن.
3. أكّد البريد إن طلب Supabase ذلك (Authentication → Users).

## 6) ترقية المستخدم إلى أدمن
```bash
node --env-file=.env.local scripts/bootstrap-admin.mjs you@example.com
```
- يستخدم service role فقط، لا يطبع أي أسرار، ويرفض العمل إن لم يكن service role مضبوطًا.
- يجب أن يكون المستخدم قد سجّل أولًا (لإنشاء صف profile).

## 7) رفع أول ملف PDF خاص
1. في Supabase: **Storage → product-files** (الـ bucket خاص).
2. ارفع الملف داخل مسار، مثال: `products/sharia-islamic-studies-guide.pdf`.
3. تأكد أن الـ bucket **Private** (ليس Public).

## 8) ربط `file_path` بالمنتج
- إمّا من لوحة الإدارة: `/admin/products` → عدّل المنتج → ضع المسار في حقل
  «مسار الملف في التخزين الخاص» واحفظ.
- أو عبر SQL:
  ```sql
  update public.products
  set file_path = 'products/sharia-islamic-studies-guide.pdf'
  where slug = 'sharia-islamic-studies-guide';
  ```

## 9) اختبار التحميل المحمي
تحقق آلي لما يمكن فحصه دون مستخدمين حقيقيين:
```bash
node --env-file=.env.local scripts/verify-private-file-access.mjs
```
ثم الخطوات اليدوية:
- **بدون شراء:** سجّل دخولًا بمستخدم لم يشترِ، ثم `GET /api/download/<productId>` → المتوقع **403**.
- **بعد الشراء:** فعّل طلبًا عبر webhook موقّع محليًا:
  ```bash
  node --env-file=.env.local scripts/simulate-webhook.mjs <orderId> paid
  ```
  ثم من `/dashboard` اضغط «تحميل آمن» → المتوقع **302** إلى رابط موقّع قصير الأجل.

## 10) اختبار لوحة الإدارة
- بمستخدم أدمن: `/admin` يعمل (المنتجات، الطلبات، العملاء، السجل).
- بمستخدم عادي: `/admin` يعيد التوجيه إلى `/dashboard` (تحقق server-side).

---

## أخطاء شائعة وحلولها
| العرض | السبب المحتمل | الحل |
| --- | --- | --- |
| `Invalid environment configuration` | ضبط Supabase جزئي | اضبط الثلاثة معًا (url + anon + service) |
| المنتجات لا تتحدّث بعد ضبط Supabase | الصفحة بُنيت قبل ضبط env | أعد البناء/التشغيل بعد ضبط `.env.local` |
| `403` عند التحميل رغم الشراء | لا يوجد entitlement فعّال | تأكد أن webhook الموقّع نجح وحوّل الطلب إلى paid |
| `503` عند checkout/webhook | مزود الدفع غير مفعّل أو لا secret | متوقع الآن (safe-fail) حتى ربط مزود حقيقي |
| anon يرى `file_path` | لم تُطبّق column grants | أعد تشغيل قسم الـ grants في `schema.sql` |
| الملف يفتح للعامة | الـ bucket Public | اجعله Private من إعدادات الـ bucket |
| `bootstrap-admin` يقول لا يوجد profile | المستخدم لم يسجّل بعد | سجّل من `/auth/signup` ثم أعد المحاولة |

## ملاحظات أمنية
- لا تضع `SUPABASE_SERVICE_ROLE_KEY` في أي متغيّر `NEXT_PUBLIC_` ولا في كود العميل.
- ملفات الـ PDF لا تكون عامة أبدًا؛ التحميل عبر روابط موقّعة قصيرة بعد فحص الـ entitlement.
- ترقية الأدوار تتم فقط عبر service role (`scripts/bootstrap-admin.mjs`)، ولا يمكن للعميل ترقية نفسه.
