import { z } from "zod";

// All external input is validated through these Zod schemas before use.

export const emailSchema = z
  .string()
  .trim()
  .min(1, "البريد الإلكتروني مطلوب")
  .email("صيغة البريد الإلكتروني غير صحيحة")
  .max(254);

export const passwordSchema = z
  .string()
  .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
  .max(72, "كلمة المرور طويلة جدًا");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "كلمة المرور مطلوبة").max(72),
});

export const signupSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "الاسم مطلوب")
    .max(80, "الاسم طويل جدًا"),
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const checkoutSchema = z.object({
  product_id: z.string().uuid("معرّف المنتج غير صحيح"),
});

// Normalized payment webhook payload (validated AFTER signature verification).
export const webhookEventSchema = z.object({
  order_id: z.string().uuid(),
  payment_id: z.string().min(1).max(200),
  status: z.enum(["paid", "failed"]),
  amount_sar: z.coerce.number().int().min(0).max(100000).optional(),
});

export const productStatusSchema = z.enum([
  "available",
  "coming_soon",
  "draft",
  "archived",
]);

// Minimum description length a product must have before it can go PUBLIC
// (available/coming_soon). draft/archived may be saved with less while editing.
const PUBLIC_DESCRIPTION_MIN = 40;

export const productUpsertSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .regex(/^[a-z0-9-]+$/, "الـ slug يجب أن يكون أحرفًا لاتينية صغيرة وشرطات"),
    title: z.string().trim().min(3).max(200),
    subtitle: z.string().trim().max(200).optional().or(z.literal("")),
    description: z.string().trim().min(10).max(4000),
    contents: z.array(z.string().trim().min(1).max(300)).max(30).default([]),
    audience: z.array(z.string().trim().min(1).max(300)).max(30).default([]),
    category: z.string().trim().min(2).max(80),
    price_sar: z.coerce.number().int().min(0).max(100000),
    status: productStatusSchema,
    cover_url: z.string().url().max(2000).optional().or(z.literal("")),
    file_path: z.string().trim().max(400).optional().or(z.literal("")),
  })
  // A product cannot be published "available" without a real price and a
  // sufficient description — these gate the public buy experience.
  .superRefine((val, ctx) => {
    if (val.status === "available" && val.price_sar <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "المنتج المتاح يحتاج سعرًا أكبر من صفر.",
        path: ["price_sar"],
      });
    }
    const publiclyVisible =
      val.status === "available" || val.status === "coming_soon";
    if (publiclyVisible && val.description.trim().length < PUBLIC_DESCRIPTION_MIN) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `الوصف قصير جدًا للنشر العام (${PUBLIC_DESCRIPTION_MIN} حرفًا على الأقل).`,
        path: ["description"],
      });
    }
  });

// Status-only change (activate / archive / move to draft) — a narrow action that
// never touches price/description, so it is validated separately and tightly.
export const productStatusChangeSchema = z.object({
  id: z.string().uuid("معرّف المنتج غير صحيح"),
  status: productStatusSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ProductUpsertInput = z.infer<typeof productUpsertSchema>;
