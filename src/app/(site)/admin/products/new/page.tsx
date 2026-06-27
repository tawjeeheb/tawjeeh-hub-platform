import Link from "next/link";
import { ArrowRight, UploadCloud } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-navy/60 hover:text-navy"
      >
        <ArrowRight className="h-4 w-4" />
        العودة للمنتجات
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold text-navy">منتج جديد</h1>

      {/* Private storage upload — integration placeholder. */}
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-navy/10 bg-offwhite p-5">
        <UploadCloud className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-700" />
        <p className="text-sm leading-7 text-navy/70">
          رفع الملف: ارفع ملف الـ PDF إلى الـ bucket الخاص في Supabase Storage
          (مثال: <code className="rounded bg-white px-1.5 py-0.5">product-files</code>)،
          ثم ضع مساره في حقل «مسار الملف» أدناه. الملفات الخاصة لا تكون عامة
          أبدًا، ويُحمّلها العميل فقط عبر روابط موقّعة قصيرة الأجل.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-navy/10 bg-white p-7">
        <ProductForm />
      </div>
    </div>
  );
}
