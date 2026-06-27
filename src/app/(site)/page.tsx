import {
  ShieldCheck,
  FileText,
  Layers,
  Compass,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Award,
  Route,
  Search,
  HelpCircle,
  Sparkles,
  MousePointerClick,
  CreditCard,
  Download,
  Lock,
  UserCircle,
  EyeOff,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/section";
import { ProductCard } from "@/components/product-card";
import { ChevronMotif } from "@/components/brand/brand-motif";
import { SampleGuideCard } from "@/components/brand/sample-guide-card";
import {
  Stamp,
  GuideCover,
  SecureDownloadMark,
} from "@/components/brand/studio";
import { Faq } from "@/components/faq";
import { CareerHubSection } from "@/components/career-hub-section";
import { getPublicProducts } from "@/lib/data/products";

const PROBLEMS = [
  {
    icon: Search,
    title: "من أين تبدأ؟",
    body: "تبحث عن مسار تخصصك بين عشرات المصادر والمواقع دون ترتيب أو مرجع واحد واضح.",
  },
  {
    icon: HelpCircle,
    title: "مسميات وجهات غامضة",
    body: "لا تعرف المسميات المناسبة لتخصصك، ولا الجهات التي قد توظّفك، ولا الشهادات والمهارات المطلوبة.",
  },
  {
    icon: Compass,
    title: "معلومات لا تبني صورة",
    body: "الإعلانات والتجارب الشخصية المتفرقة لا تكفي لبناء صورة مهنية واضحة تتّخذ عليها قرارك.",
  },
];

const FILE_CONTENTS = [
  { icon: FileText, label: "المسمى الوظيفي والمسميات المكافئة" },
  { icon: Layers, label: "التصنيف السعودي الموحد للمهن (SSC)" },
  { icon: Briefcase, label: "طبيعة العمل والمهام الرئيسية" },
  { icon: CheckCircle2, label: "الشروط والمؤهلات والخبرات" },
  { icon: Award, label: "الشهادات المهنية وبرامج التأهيل" },
  { icon: Route, label: "جهات التوظيف والمسار الوظيفي" },
];

const AUDIENCE = [
  {
    icon: GraduationCap,
    title: "الطلاب",
    body: "لاختيار التخصص بثقة بناءً على فرصه الحقيقية في سوق العمل.",
  },
  {
    icon: Briefcase,
    title: "الخريجون",
    body: "لفهم المسارات المتاحة ومتطلبات كل مهنة قبل التقديم.",
  },
  {
    icon: Compass,
    title: "الباحثون عن عمل",
    body: "لمعرفة جهات التوظيف والشهادات التي ترفع فرص القبول.",
  },
];

const DIFFERENTIATORS = [
  {
    title: "موثّق لا منسوخ",
    body: "كل معلومة مرتبطة بمصدرها الرسمي، دون نقل من الذاكرة أو صياغة عامة.",
  },
  {
    title: "منظّم لا مبعثر",
    body: "بنية ثابتة لكل بطاقة مهنية تجعل المقارنة والقرار أسهل بكثير.",
  },
  {
    title: "سعودي لا عام",
    body: "محتوى مبنيّ على سوق العمل السعودي وتصنيفاته، لا على نماذج أجنبية.",
  },
  {
    title: "دقيق لا متضارب",
    body: "فصل واضح بين المهن المتقاربة دون خلط بين المسميات والمسارات.",
  },
];

const HOW_STEPS = [
  {
    step: "١",
    icon: MousePointerClick,
    title: "اختر الدليل",
    body: "تصفّح الأدلة المهنية واختر ما يناسب تخصصك ومرحلتك.",
  },
  {
    step: "٢",
    icon: CreditCard,
    title: "أتمم الطلب",
    body: "أنشئ حسابك وأتمم الطلب. الدفع الحقيقي قيد التفعيل لاحقًا.",
  },
  {
    step: "٣",
    icon: CheckCircle2,
    title: "يصلك الوصول",
    body: "يظهر الدليل في «ملفاتي» مباشرة بعد تأكيد الطلب، بحساب خاص بك.",
  },
  {
    step: "٤",
    icon: Download,
    title: "حمّل بأمان",
    body: "حمّل ملف الـ PDF عبر رابط آمن مؤقت، في أي وقت ومن أي جهاز.",
  },
];

const TRUST = [
  {
    icon: Lock,
    title: "ملفات خاصة بالكامل",
    body: "ملفات الـ PDF محفوظة في تخزين خاص، ولا توجد أي روابط عامة للملفات.",
  },
  {
    icon: ShieldCheck,
    title: "تحميل عبر رابط آمن",
    body: "كل تحميل يتم عبر رابط موقّع قصير الصلاحية، مرتبط بحسابك فقط.",
  },
  {
    icon: UserCircle,
    title: "حساب مستخدم موثّق",
    body: "وصولك لملفاتك محميّ خلف تسجيل دخول، وكل عملية موثّقة في حسابك.",
  },
  {
    icon: EyeOff,
    title: "لا كشف لمسار الملف",
    body: "مسار الملف لا يظهر للعميل إطلاقًا، والحماية مطبّقة على مستوى الخادم.",
  },
];

const FAQ_ITEMS = [
  {
    q: "لماذا أشتري الدليل بدل أن أبحث بنفسي؟",
    a: "يمكنك البحث بنفسك، لكن الدليل يختصر عليك التشتت ويجمع العناصر المهنية الأساسية في ترتيب واحد: المسميات، الجهات، المهارات، الشهادات، المسار، والتنبيهات. هو لا يضمن وظيفة، لكنه يساعدك على فهم الصورة أسرع وبوضوح أكبر.",
  },
  {
    q: "هل الدليل يضمن لي وظيفة؟",
    a: "لا. الدليل أداة توجيه ومرجع معلوماتي يساعدك على فهم المسارات والشروط والشهادات وجهات التوظيف بوضوح، لكنه لا يَعِد بوظيفة ولا يضمن التوظيف.",
  },
  {
    q: "هل يناسبني إن لم أكن أعرف مساري بعد؟",
    a: "نعم — صُمّم خصوصًا لمن لا يعرف من أين يبدأ. لا يلزم خبرة مسبقة، وهو مناسب للطلاب والخريجين والباحثين عن مسار لفهم خياراتهم قبل اتخاذ القرار.",
  },
  {
    q: "ماذا يحدث بعد الشراء؟ وأين أجد ملفاتي؟",
    a: "بعد اكتمال الدفع وتفعيل الوصول يظهر الدليل في «مكتبتي» داخل حسابك، وتحمّله بأمان عبر رابط مؤقت. ويمكنك الرجوع إليه لاحقًا في أي وقت من حسابك.",
  },
  {
    q: "هل الملفات عامة أو متاحة للجميع؟",
    a: "لا. ملفات الأدلة خاصة بالكامل ولا توجد لها روابط عامة. التحميل يتم فقط من حسابك بعد تفعيل الوصول، عبر رابط موقّع قصير الصلاحية.",
  },
  {
    q: "متى يُفعّل الدفع الحقيقي؟",
    a: "الدفع يعمل حاليًا في وضع تجريبي آمن ولا يمنح أي وصول إلا عبر المسار الآمن، إلى حين ربط مزوّد دفع سعودي معتمد.",
  },
];

export default async function HomePage() {
  const products = await getPublicProducts();
  const latest = products.slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-navy/10 bg-offwhite">
        <div className="guidance-grid absolute inset-0 opacity-60" />
        <div className="brand-wash absolute inset-0" />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-teal-50 blur-3xl"
        />
        <div className="container relative py-16 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Copy */}
            <div className="animate-rise-in text-center lg:text-start">
              <span className="eyebrow">منصة وطنية للتوجيه المهني</span>
              <h1 className="mt-6 text-balance font-display text-[2.6rem] font-extrabold leading-[1.12] text-navy sm:text-5xl lg:text-[3.4rem]">
                افهم مسار تخصصك
                <br />
                <span className="text-teal-700">قبل أن تختار خطوتك التالية</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-8 text-navy/70 lg:mx-0 lg:text-lg">
                مركز توجيه يجمع لك وظائف تخصصك من مكان واحد، مع أدلة مهنية
                وتوجيه ذكي للمهارات والدورات والشهادات — اختر تخصصك، وشاهد فرصك
                المناسبة اليوم.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <ButtonLink href="/majors" size="lg" variant="primary">
                  اختر تخصصك وشاهد وظائفك
                </ButtonLink>
                <ButtonLink href="/products" size="lg" variant="outline">
                  استعرض الأدلة المهنية
                </ButtonLink>
              </div>
              <p className="mt-4 text-sm text-navy/55">
                مناسب للطلاب والخريجين والباحثين عن مسار — لا يلزم خبرة سابقة لفهم
                الدليل.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm font-semibold text-navy/55 lg:justify-start">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-teal-700" /> معلومات موثقة
                </span>
                <span className="inline-flex items-center gap-2">
                  <Layers className="h-4 w-4 text-teal-700" /> بنية منظمة
                </span>
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-teal-700" /> تركيز سعودي
                </span>
              </div>
            </div>

            {/* Product scene — a guide booklet behind a professional card */}
            <div className="relative mx-auto mt-4 w-full max-w-md lg:mr-0 lg:mt-0">
              <ChevronMotif className="pointer-events-none absolute -left-16 -top-12 hidden h-44 w-44 text-teal/15 lg:block" />
              <div
                aria-hidden
                className="pointer-events-none absolute -left-6 bottom-6 hidden h-40 w-40 rounded-full bg-plum-50 blur-3xl sm:block"
              />
              <div className="relative min-h-[440px] sm:min-h-[480px]">
                {/* guide booklet, clearly behind & up-right (short label, no clutter) */}
                <div className="absolute -top-3 right-0 hidden w-36 rotate-[7deg] sm:block">
                  <GuideCover
                    title="الشريعة والدراسات الإسلامية"
                    category="دليل ٠١"
                    categoryKey="sharia"
                    index="٠١"
                  />
                </div>
                {/* professional card in front, lowered to reveal the booklet top */}
                <div className="relative z-10 ms-auto w-full pt-0 sm:w-[80%] sm:pt-20">
                  <SampleGuideCard className="animate-rise-in" />
                </div>
                {/* marks */}
                <Stamp
                  label="تحميل آمن"
                  tone="teal"
                  className="absolute bottom-12 left-0 z-20 rotate-[-7deg] bg-white shadow-soft sm:bottom-8 sm:left-2"
                />
                <div className="absolute -bottom-4 right-2 z-20 flex items-center gap-2 rounded-full border border-navy/10 bg-white px-4 py-2 text-xs font-bold text-navy shadow-soft">
                  <Award className="h-4 w-4 text-teal-700" />
                  مبنيّ على التصنيف السعودي للمهن
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* مركز توجيه: pick your major → jobs → guidance */}
      <CareerHubSection />

      {/* 1. Problem — the research pain */}
      <Section>
        <SectionHeading
          index="٠١"
          eyebrow="المشكلة التي نحلّها"
          title="تبحث عن مسارك المهني… وحدك"
          subtitle="كل تخصص له مساراته وجهاته وشروطه، والبحث عنها من الصفر بين عشرات المصادر رحلة مرهقة ومشتّتة — خصوصًا لمن لا يعرف من أين يبدأ."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PROBLEMS.map((item) => (
            <div key={item.title} className="surface p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-plum-50 text-plum-700">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-navy">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-navy/65">{item.body}</p>
            </div>
          ))}
        </div>

        {/* Solution bridge */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-navy/10 bg-navy-sheen">
          <div className="relative grid items-center gap-6 p-8 md:grid-cols-[1.4fr_1fr] md:p-10">
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.1] [background-image:radial-gradient(rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:16px_16px]"
            />
            <div className="relative">
              <Stamp label="الفكرة باختصار" tone="teal" className="border-white/25 text-teal-100" />
              <p className="mt-4 font-display text-xl font-extrabold leading-snug text-white md:text-2xl">
                بدل أن تبحث عن مسارك المهني من عشرات المصادر، ابدأ من دليل واحد
                منظّم.
              </p>
              <p className="mt-3 max-w-lg text-sm leading-7 text-white/70">
                نحن لا نَعِدك بوظيفة — بل نرتّب لك الصورة المهنية التي كنت ستبحث
                عنها وحدك: المسميات، الجهات، الشهادات، المهارات، والمسار، في ملف
                واحد واضح لكل تخصص.
              </p>
            </div>
            <ul className="relative space-y-3">
              {[
                "دليل متخصص لكل مجال، لا نصائح عامة",
                "معلومات مرتبة حسب عناصر مهنية واضحة",
                "مسار مفهوم بدل بحث عشوائي مشتّت",
              ].map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-3 rounded-xl bg-white/[0.06] p-3.5 text-sm leading-6 text-white/90"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-200" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* 2. What each guide contains */}
      <Section muted bordered>
        <SectionHeading
          index="٠٢"
          eyebrow="ماذا يحتوي كل دليل؟"
          title="بطاقات مهنية مبنية عنصرًا بعنصر"
          subtitle="كل مهنة تُعرض كبطاقة مستقلة تغطي كل ما تحتاج معرفته قبل اتخاذ القرار."
        />
        <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
          {FILE_CONTENTS.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 rounded-xl border border-navy/10 bg-white p-5"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-navy">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* 3. Who is it for */}
      <Section>
        <SectionHeading
          index="٠٣"
          eyebrow="لمن صُممت المنصة؟"
          title="مصمّمة لكل مرحلة من رحلتك المهنية"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {AUDIENCE.map((item) => (
            <div key={item.title} className="surface p-7 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white">
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-navy">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-navy/65">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 4. Why different from generic content */}
      <Section muted bordered>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <SectionHeading
            align="start"
            index="٠٤"
            eyebrow="لماذا نختلف؟"
            title="ليست محتوى عامًّا منقولًا من الإنترنت"
            subtitle="الفرق ليس في كمية المعلومات، بل في دقتها وتنظيمها وارتباطها بسوق العمل السعودي."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            {DIFFERENTIATORS.map((d) => (
              <div key={d.title} className="rounded-xl border border-navy/10 bg-white p-6">
                <CheckCircle2 className="h-5 w-5 text-teal-600" />
                <h3 className="mt-3 font-bold text-navy">{d.title}</h3>
                <p className="mt-1.5 text-sm leading-7 text-navy/65">{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 5. Latest products */}
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            align="start"
            eyebrow="المنتجات الأحدث"
            title="أحدث الأدلة المهنية"
          />
          <ButtonLink href="/products" variant="subtle" size="sm">
            عرض جميع الأدلة
          </ButtonLink>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {latest.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Section>

      {/* 6. How the platform works */}
      <Section muted bordered>
        <div id="how" className="scroll-mt-24" />
        <SectionHeading
          index="٠٥"
          eyebrow="كيف تعمل المنصة؟"
          title="من اختيار الدليل إلى تحميله بأمان"
          subtitle="أربع خطوات واضحة، دون تعقيد."
        />
        <div className="relative mt-14">
          {/* connecting career path line (desktop) */}
          <div
            aria-hidden
            className="absolute right-[12%] left-[12%] top-6 hidden h-px bg-gradient-to-l from-teal/40 via-navy/15 to-plum/40 lg:block"
          />
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_STEPS.map((s) => (
              <li key={s.step} className="relative">
                {/* node on the path */}
                <span className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-sheen font-display text-lg font-extrabold text-white shadow-soft ring-4 ring-offwhite lg:mx-0">
                  {s.step}
                </span>
                <div className="surface mt-5 h-full p-6">
                  <s.icon className="h-6 w-6 text-teal-700" />
                  <h3 className="mt-4 text-lg font-bold text-navy">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-navy/65">
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* 7. Trust & security */}
      <Section>
        <SectionHeading
          index="٠٦"
          eyebrow="الثقة والأمان"
          title="ملفاتك خاصة ومحميّة"
          subtitle="بنينا المنصة بحيث تكون الملفات آمنة من البداية، لا كإضافة لاحقة."
        />
        <div className="mt-7 flex justify-center">
          <SecureDownloadMark />
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((t) => (
            <div key={t.title} className="surface lift p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <t.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-base font-bold text-navy">{t.title}</h3>
              <p className="mt-2 text-sm leading-7 text-navy/65">{t.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 8. FAQ */}
      <Section muted bordered>
        <div id="faq" className="scroll-mt-24" />
        <SectionHeading
          eyebrow="الأسئلة الشائعة"
          title="أسئلة قد تدور في ذهنك"
        />
        <Faq items={FAQ_ITEMS} />
      </Section>

      {/* Closing CTA band */}
      <section className="bg-navy">
        <div className="container relative overflow-hidden py-16 text-center">
          <ChevronMotif className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 text-white/5" />
          <h2 className="text-balance text-2xl font-extrabold text-white md:text-3xl">
            ابدأ رحلتك المهنية بمعلومة موثوقة
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-8 text-white/70">
            استعرض الأدلة المهنية المتاحة واختر ما يناسب تخصصك ومرحلتك.
          </p>
          <div className="mt-7">
            <ButtonLink href="/products" size="lg" variant="teal">
              استعرض الأدلة المهنية
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
