"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  upsertProductAction,
  type AdminActionState,
} from "@/app/(site)/admin/actions";
import { SEED_CATEGORIES } from "@/lib/categories";
import type { Product } from "@/lib/types";

const initial: AdminActionState = {};

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg">
      {pending ? "جارٍ الحفظ…" : "حفظ المنتج"}
    </Button>
  );
}

export function ProductForm({ product }: { product?: Product }) {
  const [state, action] = useFormState(upsertProductAction, initial);

  return (
    <form action={action} className="space-y-5">
      {product && <input type="hidden" name="id" value={product.id} />}

      {state.error && (
        <p
          role="alert"
          className="rounded-xl bg-plum-50 px-4 py-3 text-sm font-medium text-plum-700"
        >
          {state.error}
        </p>
      )}
      {state.success && (
        <p
          role="status"
          className="rounded-xl bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700"
        >
          {state.success}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="title">العنوان</Label>
          <Input id="title" name="title" defaultValue={product?.title} required />
        </div>
        <div>
          <Label htmlFor="slug">الـ slug</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={product?.slug}
            placeholder="example-guide-slug"
            dir="ltr"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="subtitle">العنوان الفرعي</Label>
        <Input id="subtitle" name="subtitle" defaultValue={product?.subtitle ?? ""} />
      </div>

      <div>
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product?.description}
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="contents">ماذا يحتوي الملف؟ (سطر لكل عنصر)</Label>
          <Textarea
            id="contents"
            name="contents"
            rows={5}
            defaultValue={product?.contents?.join("\n")}
          />
        </div>
        <div>
          <Label htmlFor="audience">مناسب لمن؟ (سطر لكل عنصر)</Label>
          <Textarea
            id="audience"
            name="audience"
            rows={5}
            defaultValue={product?.audience?.join("\n")}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <Label htmlFor="category">المجال</Label>
          <Select
            id="category"
            name="category"
            defaultValue={product?.category ?? SEED_CATEGORIES[0]?.key}
          >
            {SEED_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="price_sar">السعر (ريال)</Label>
          <Input
            id="price_sar"
            name="price_sar"
            type="number"
            min={0}
            defaultValue={product?.price_sar ?? 0}
            required
            dir="ltr"
          />
        </div>
        <div>
          <Label htmlFor="status">الحالة</Label>
          <Select id="status" name="status" defaultValue={product?.status ?? "draft"}>
            <option value="available">متاح (يظهر ويُباع)</option>
            <option value="coming_soon">قريبًا (يظهر بلا شراء)</option>
            <option value="draft">مسودة (مخفي)</option>
            <option value="archived">مؤرشف (مخفي)</option>
          </Select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="cover_url">رابط الغلاف (اختياري)</Label>
          <Input id="cover_url" name="cover_url" defaultValue={product?.cover_url ?? ""} dir="ltr" />
        </div>
        <div>
          <Label htmlFor="file_path">مسار الملف في التخزين الخاص</Label>
          <Input
            id="file_path"
            name="file_path"
            defaultValue={product?.file_path ?? ""}
            placeholder="products/example.pdf"
            dir="ltr"
          />
          <p className="mt-1.5 text-xs text-navy/50">
            مسار الكائن داخل الـ bucket الخاص (مثال:{" "}
            <code className="rounded bg-navy-50 px-1 py-0.5">products/x.pdf</code>).
            لا يُعرض للعملاء أبدًا، والتحميل يتم عبر رابط موقّع قصير الأجل فقط.
            {product && (
              <>
                {" "}
                الحالة الحالية:{" "}
                <span className="font-semibold">
                  {product.file_path ? "ملف مرتبط" : "لا ملف مرتبط"}
                </span>
                .
              </>
            )}
          </p>
        </div>
      </div>

      <SaveButton />
    </form>
  );
}
