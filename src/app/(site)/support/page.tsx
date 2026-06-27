import type { Metadata } from "next";
import Link from "next/link";
import {
  LifeBuoy,
  HelpCircle,
  ShoppingBag,
  FolderLock,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Stamp } from "@/components/brand/studio";

export const metadata: Metadata = {
  title: "الدعم والمساعدة",
  description:
    "مركز مساعدة توجيه هاب — كيف تشتري، أين تجد ملفاتك، وأمان الملفات، وقنوات التواصل الرسمية.",
};

const TOPICS = [
  {
    icon: ShoppingBag,
    title: "كيف أشتري دليلًا؟",
    body: "اختر الدليل من المكتبة، افتح صفحته، ثم اضغط «اشترِ الآن». إن لم تكن مسجّلًا سيُطلب منك إنشاء حساب أو الدخول أولًا.",
  },
  {
    icon: FolderLock,
    title: "أين أجد ملفاتي بعد الشراء؟",
    body: "بعد تفعيل الوصول تظهر أدلتك في «مكتبتي» داخل حسابك، ويمكنك تحميلها بأمان والرجوع إليها لاحقًا في أي وقت.",
  },
  {
    icon: ShieldCheck,
    title: "هل ملفاتي آمنة؟",
    body: "نعم. الملفات خاصة بالكامل دون روابط عامة، والتحميل يتم عبر رابط موقّع قصير الصلاحية مرتبط بحسابك فقط.",
  },
  {
    icon: HelpCircle,
    title: "هل الدليل يضمن وظيفة؟",
    body: "لا. الدليل أداة توجيه ومرجع معلوماتي ينظّم لك الصورة المهنية، لكنه لا يَعِد بوظيفة ولا يضمن التوظيف.",
  },
];

export default function SupportPage() {
  return (
    <div className="container py-14">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <Stamp label="الدعم والمساعدة" tone="teal" className="bg-white shadow-card" />
          <h1 className="mt-5 font-display text-3xl font-extrabold text-navy md:text-4xl">
            كيف نساعدك؟
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-8 text-navy/65">
            إجابات سريعة لأكثر ما يهمّك حول الشراء، الوصول إلى ملفاتك، والأمان.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {TOPICS.map((t) => (
            <div key={t.title} className="surface p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <t.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-bold text-navy">{t.title}</h2>
              <p className="mt-2 text-sm leading-7 text-navy/65">{t.body}</p>
            </div>
          ))}
        </div>

        {/* More questions → FAQ */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-navy/10 bg-offwhite p-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <LifeBuoy className="h-6 w-6 text-teal-700" />
            <p className="text-sm font-semibold text-navy">
              لديك سؤال آخر؟ راجع الأسئلة الشائعة المفصّلة.
            </p>
          </div>
          <ButtonLink href="/#faq" variant="outline" size="sm">
            الأسئلة الشائعة
          </ButtonLink>
        </div>

        {/* Honest contact + reviews status — no fake data */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl border border-navy/10 bg-white p-6">
            <MessageSquare className="mt-0.5 h-5 w-5 flex-shrink-0 text-navy/45" />
            <div>
              <h3 className="text-sm font-bold text-navy">قنوات التواصل</h3>
              <p className="mt-1.5 text-sm leading-7 text-navy/60">
                قنوات التواصل الرسمية ستُضاف عند الإطلاق.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-navy/10 bg-white p-6">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-navy/45" />
            <div>
              <h3 className="text-sm font-bold text-navy">آراء العملاء</h3>
              <p className="mt-1.5 text-sm leading-7 text-navy/60">
                تُعرض آراء العملاء بعد عمليات شراء وتجارب فعلية. لا نعرض تقييمات
                غير موثّقة.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-navy/50">
          راجع أيضًا{" "}
          <Link href="/legal/refund" className="font-semibold text-teal-700 hover:text-teal-600">
            سياسة استرجاع المنتجات الرقمية
          </Link>{" "}
          و
          <Link href="/legal/terms" className="font-semibold text-teal-700 hover:text-teal-600">
            الشروط والأحكام
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
