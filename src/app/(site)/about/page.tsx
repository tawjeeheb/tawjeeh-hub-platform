import type { Metadata } from "next";
import { Target, ShieldCheck, ListChecks } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "فكرة المنصة",
  description:
    "تعرّف على فكرة منصة توجيه هاب ومنهجيتها في بناء الأدلة المهنية السعودية الموثقة.",
};

const PRINCIPLES = [
  {
    icon: Target,
    title: "هدف واضح",
    body: "تزويد الطالب والخريج والباحث عن عمل بفهم دقيق للمهنة داخل سوق العمل السعودي: المسمى، التصنيف، طبيعة العمل، الشروط، الشهادات، وجهات التوظيف، والمسار.",
  },
  {
    icon: ShieldCheck,
    title: "منهجية موثقة",
    body: "لا معلومة بلا دليل، ولا صياغة عامة، ولا تخمين، ولا خلط بين المهن المتقاربة. كل معلومة مرتبطة بمصدرها للتحقق والمراجعة.",
  },
  {
    icon: ListChecks,
    title: "بناء منظم",
    body: "كل ملف يمثل تخصصًا كاملًا، ويتكوّن من بطاقات مهنية مستقلة، وكل بطاقة تُبنى عنصرًا بعنصر وفق هيكل ثابت وواضح.",
  },
];

export default function AboutPage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-3xl text-center">
        <span className="eyebrow">فكرة المنصة</span>
        <h1 className="mt-5 text-3xl font-extrabold text-navy md:text-4xl">
          توجيه مهني سعودي مبني على الدقة والتوثيق
        </h1>
        <p className="mt-5 text-base leading-8 text-navy/70">
          توجيه هاب منصة وطنية متخصصة في إنتاج أدلة مهنية عالية الدقة. الملف
          الواحد يغطي تخصصًا كاملًا، ويحتوي على بطاقات مهنية تمثل كل منها مهنة أو
          مسارًا مهنيًا مستقلًا داخل سوق العمل السعودي.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
        {PRINCIPLES.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-navy/10 bg-white p-7 shadow-card"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <p.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-navy">{p.title}</h3>
            <p className="mt-2 text-sm leading-7 text-navy/65">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-navy/10 bg-offwhite p-8 text-center">
        <h2 className="text-xl font-bold text-navy">
          جاهز لاستكشاف مسارك المهني؟
        </h2>
        <p className="mt-2 text-sm leading-7 text-navy/65">
          استعرض الأدلة المهنية المتاحة واختر ما يناسب تخصصك.
        </p>
        <div className="mt-6">
          <ButtonLink href="/products" variant="primary" size="lg">
            استعرض الأدلة المهنية
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
