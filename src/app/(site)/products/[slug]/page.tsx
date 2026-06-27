import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Users,
  ShieldCheck,
  FileText,
  Lock,
  Compass,
  Download,
  ChevronLeft,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BuyButton } from "@/components/buy-button";
import { SampleGuideCard } from "@/components/brand/sample-guide-card";
import { SecureDownloadMark } from "@/components/brand/studio";
import { formatSar } from "@/lib/utils";
import { categoryLabel } from "@/lib/categories";
import { getPublicProductBySlug, getPublicProducts } from "@/lib/data/products";

const HOW_IT_HELPS = [
  "تفهم متطلبات كل مهنة فعليًا قبل أن تستثمر وقتك فيها.",
  "تقارن المسارات المتقاربة وتختار الأنسب لميولك وقدراتك.",
  "تعرف الشهادات والخبرات التي ترفع فرص قبولك في سوق العمل.",
];

const AFTER_PURCHASE = [
  { icon: CheckCircle2, label: "يظهر الدليل فورًا في «ملفاتي» بعد تأكيد الدفع" },
  { icon: Download, label: "حمّله بأمان عبر رابط مؤقت في أي وقت" },
  { icon: Compass, label: "استعرض البطاقات المهنية وخطّط لمسارك" },
];

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const product = await getPublicProductBySlug(params.slug);
  if (!product) notFound();
  const description = product.subtitle ?? product.description.slice(0, 160);
  return {
    title: product.title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "article",
      title: product.title,
      description,
      locale: "ar_SA",
      siteName: "توجيه هاب · Tawjeeh HUB",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
    },
  };
}

// Rendered dynamically (per request) so an unknown slug yields a real 404 — not
// a soft-404 (200) — and so admin-added products work without a rebuild.
export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getPublicProductBySlug(params.slug);
  if (!product) notFound();

  const isAvailable = product.status === "available";

  return (
    <div className="container py-10 md:py-14">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-navy/50">
        <Link href="/products" className="hover:text-navy">
          الأدلة المهنية
        </Link>
        <ChevronLeft className="h-4 w-4" />
        <span className="text-navy/70">{categoryLabel(product.category)}</span>
      </nav>

      <div className="mt-6 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        {/* Main content */}
        <article>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-teal-700">
              {categoryLabel(product.category)}
            </span>
            <Badge variant={isAvailable ? "available" : "coming"}>
              {isAvailable ? "متاح الآن" : "قريبًا"}
            </Badge>
          </div>

          <h1 className="mt-4 text-balance text-3xl font-extrabold leading-snug text-navy md:text-4xl">
            {product.title}
          </h1>
          {product.subtitle && (
            <p className="mt-3 text-lg text-navy/70">{product.subtitle}</p>
          )}

          {/* Crafted preview: a sample professional card from the guide */}
          <div className="relative mt-8 overflow-hidden rounded-3xl border border-navy/10 bg-offwhite p-6 sm:p-8">
            <div className="guidance-grid absolute inset-0 opacity-60" />
            <div className="brand-wash absolute inset-0" />
            <div className="relative grid items-center gap-6 sm:grid-cols-[1fr_1.1fr]">
              <div>
                <span className="eyebrow">نموذج من داخل الدليل</span>
                <p className="mt-4 font-display text-xl font-extrabold text-navy">
                  بطاقة مهنية واحدة من عشرات البطاقات
                </p>
                <p className="mt-2 text-sm leading-7 text-navy/65">
                  كل مهنة تُعرض كبطاقة مستقلة منظَّمة، تختصر عليك البحث وتجمع كل
                  ما تحتاجه في مكان واحد.
                </p>
              </div>
              <SampleGuideCard className="mx-auto w-full max-w-xs" />
            </div>
          </div>

          <p className="mt-8 text-base leading-8 text-navy/75">
            {product.description}
          </p>

          {/* No-guarantee disclaimer */}
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-navy/10 bg-offwhite p-4">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-navy/50" />
            <p className="text-sm leading-7 text-navy/65">
              هذا الدليل أداة توجيه مهني تساعدك على فهم المسارات والشروط والشهادات
              وجهات التوظيف، وهو <span className="font-semibold">لا يضمن الحصول على وظيفة</span>{" "}
              ولا يَعِد بالتوظيف.
            </p>
          </div>

          {/* Why you need this guide — decision support tied to the research pain */}
          <section className="mt-10">
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-navy">
              <Compass className="h-5 w-5 text-teal-700" />
              لماذا تحتاج هذا الدليل؟
            </h2>
            <div className="mt-5 rounded-2xl border border-navy/10 bg-offwhite p-6">
              <p className="text-sm leading-8 text-navy/75">
                هذا التخصص قد يكون له مسارات متعددة ومسميات وجهات ليست واضحة دائمًا
                للطالب. بدل أن تبحث عن كل ذلك من عشرات المصادر المتفرقة، يجمع هذا
                الدليل الصورة المهنية في مكان واحد منظّم: المسميات، الجهات،
                الشروط، الشهادات، المهارات، والمسار — فيقلّل التشتت ويوفّر وقتك.
              </p>
              <p className="mt-4 text-sm font-semibold text-teal-700">
                بعد قراءته ستعرف: ما المسميات المناسبة لتخصصك، أين قد تعمل، وما
                الذي يؤهّلك للوصول.
              </p>
            </div>
          </section>

          {/* What it contains — presented as a document file index */}
          {product.contents.length > 0 && (
            <section className="mt-10">
              <h2 className="flex items-center gap-2 text-xl font-extrabold text-navy">
                <FileText className="h-5 w-5 text-teal-700" />
                ما الذي يحتويه الملف؟
              </h2>
              <div className="mt-5 overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-card">
                <div className="flex items-center justify-between border-b border-navy/10 bg-offwhite px-5 py-3">
                  <span className="text-xs font-bold text-navy/55">
                    فهرس الدليل
                  </span>
                  <span className="text-xs font-bold text-navy/40">
                    {product.contents.length} عنصرًا
                  </span>
                </div>
                <ol className="divide-y divide-navy/[0.06]">
                  {product.contents.map((item, i) => (
                    <li
                      key={item}
                      className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-offwhite/60"
                    >
                      <span className="w-7 flex-shrink-0 font-display text-sm font-extrabold text-teal-700">
                        {(i + 1).toLocaleString("ar-EG", {
                          minimumIntegerDigits: 2,
                          useGrouping: false,
                        })}
                      </span>
                      <span className="text-sm leading-6 text-navy/80">
                        {item}
                      </span>
                      <CheckCircle2 className="ms-auto h-4 w-4 flex-shrink-0 text-teal-600/70" />
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          )}

          {/* Audience */}
          {product.audience.length > 0 && (
            <section className="mt-10">
              <h2 className="flex items-center gap-2 text-xl font-bold text-navy">
                <Users className="h-5 w-5 text-teal-700" />
                مناسب لمن؟
              </h2>
              <ul className="mt-5 space-y-3">
                {product.audience.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-7 text-navy/80"
                  >
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-plum" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* How it helps */}
          <section className="mt-10">
            <h2 className="flex items-center gap-2 text-xl font-bold text-navy">
              <Compass className="h-5 w-5 text-teal-700" />
              كيف يساعدك هذا الدليل؟
            </h2>
            <ul className="mt-5 space-y-3">
              {HOW_IT_HELPS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-7 text-navy/80"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* After purchase */}
          <section className="mt-10">
            <h2 className="flex items-center gap-2 text-xl font-bold text-navy">
              <Download className="h-5 w-5 text-teal-700" />
              ماذا بعد الشراء؟
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {AFTER_PURCHASE.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-navy/10 bg-offwhite p-5"
                >
                  <item.icon className="h-5 w-5 text-teal-700" />
                  <p className="mt-3 text-sm leading-6 text-navy/75">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Copyright / sharing notice */}
          <div className="mt-10 flex items-start gap-3 rounded-xl border border-plum/20 bg-plum-50 p-5">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-plum-700" />
            <p className="text-sm leading-7 text-plum-700">
              ملاحظة حقوق الملكية: هذا الملف مرخّص للاستخدام الشخصي للمشتري فقط.
              يُمنع منعًا باتًا مشاركته أو إعادة نشره أو بيعه أو توزيعه بأي صورة.
              كل عملية تحميل موثّقة ومرتبطة بحساب المشتري.
            </p>
          </div>
        </article>

        {/* Purchase panel */}
        <aside className="lg:pt-2">
          <div className="sticky top-24 overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-elev">
            {/* navy header with price */}
            <div className="relative bg-navy-sheen px-7 py-6">
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:14px_14px]"
              />
              <span className="relative inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-teal-100">
                دليل مهني رقمي
              </span>
              <div className="relative mt-3 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-extrabold text-white">
                  {formatSar(product.price_sar)}
                </span>
                <span className="text-sm text-white/55">مرة واحدة</span>
              </div>
            </div>

            <div className="p-7">
              {isAvailable ? (
                <BuyButton
                  productId={product.id}
                  price={formatSar(product.price_sar)}
                />
              ) : (
                <div className="rounded-xl border border-navy/10 bg-navy-50 px-4 py-3 text-center text-sm font-semibold text-navy/70">
                  هذا الدليل قيد الإعداد — متاح قريبًا
                </div>
              )}

              {isAvailable && (
                <p className="mt-3 rounded-lg bg-plum-50 px-3 py-2 text-center text-xs leading-5 text-plum-700">
                  الدفع الحقيقي قيد التفعيل حاليًا (وضع تجريبي آمن). لن يُخصم منك
                  أي مبلغ، ولن يُمنح الوصول إلا عبر المسار الآمن.
                </p>
              )}

              {isAvailable && <SecureDownloadMark className="mt-5 w-full justify-center" />}

              <ul className="mt-6 space-y-3 border-t border-navy/10 pt-6 text-sm text-navy/75">
                <li className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <Lock className="h-4 w-4" />
                  </span>
                  تحميل آمن عبر روابط مؤقتة
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <FileText className="h-4 w-4" />
                  </span>
                  ملف PDF عالي الدقة
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  ترجع إليه لاحقًا من مكتبتك في أي وقت
                </li>
              </ul>

              <p className="mt-5 border-t border-navy/10 pt-4 text-center text-xs leading-6 text-navy/50">
                لا يلزم خبرة مسبقة لفهم الدليل — مناسب للطلاب والخريجين والباحثين
                عن مسار.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
