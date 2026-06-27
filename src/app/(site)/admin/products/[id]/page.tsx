import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { adminGetProduct } from "@/lib/data/admin";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await adminGetProduct(params.id);
  if (!product) notFound();

  return (
    <div>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-navy/60 hover:text-navy"
      >
        <ArrowRight className="h-4 w-4" />
        العودة للمنتجات
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold text-navy">
        تعديل: {product.title}
      </h1>

      <div className="mt-6 rounded-2xl border border-navy/10 bg-white p-7">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
