#!/usr/bin/env node
// Unit guard for product lifecycle rules: status validation and public
// visibility. Requires Node 22+ (native type-stripping). No server, no keys.
// Usage: node scripts/test-product-rules.mjs
import {
  productUpsertSchema,
  productStatusChangeSchema,
} from "../src/lib/validations.ts";
import { isPubliclyVisible, PUBLIC_PRODUCT_STATUSES } from "../src/lib/types.ts";

let fail = 0;
const check = (name, cond) => {
  if (!cond) fail += 1;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
};

const base = {
  slug: "valid-slug",
  title: "عنوان كافٍ",
  description:
    "وصف طويل بما يكفي للنشر العام بحيث يتجاوز الحد الأدنى المطلوب للظهور.",
  category: "sharia",
  contents: ["a"],
  audience: ["b"],
  cover_url: "",
  file_path: "",
};

// 1) available requires price > 0
check(
  "available with price 0 is rejected",
  !productUpsertSchema.safeParse({ ...base, status: "available", price_sar: 0 })
    .success,
);
check(
  "available with price > 0 is accepted",
  productUpsertSchema.safeParse({ ...base, status: "available", price_sar: 89 })
    .success,
);

// 2) public statuses require a sufficient description
check(
  "coming_soon with short description is rejected",
  !productUpsertSchema.safeParse({
    ...base,
    description: "وصف مختصر نسبيًا للمسودة الداخلية",
    status: "coming_soon",
    price_sar: 0,
  }).success,
);

// 3) draft/archived may be saved incomplete (no price, short description)
check(
  "draft with price 0 and short description is accepted",
  productUpsertSchema.safeParse({
    ...base,
    description: "وصف مختصر نسبيًا للمسودة الداخلية",
    status: "draft",
    price_sar: 0,
  }).success,
);
check(
  "archived with price 0 and short description is accepted",
  productUpsertSchema.safeParse({
    ...base,
    description: "وصف مختصر نسبيًا للمسودة الداخلية",
    status: "archived",
    price_sar: 0,
  }).success,
);

// 4) status enum boundaries
check(
  "invalid status is rejected",
  !productUpsertSchema.safeParse({ ...base, status: "live", price_sar: 1 })
    .success,
);
check(
  "bad slug (spaces/uppercase) is rejected",
  !productUpsertSchema.safeParse({
    ...base,
    slug: "Bad Slug",
    status: "available",
    price_sar: 1,
  }).success,
);

// 5) status-change schema requires a uuid + valid status
check(
  "status change with non-uuid id is rejected",
  !productStatusChangeSchema.safeParse({ id: "x", status: "archived" }).success,
);
check(
  "status change with valid uuid + status is accepted",
  productStatusChangeSchema.safeParse({
    id: "11111111-1111-4111-8111-111111111111",
    status: "archived",
  }).success,
);

// 6) public visibility map
check("available is public", isPubliclyVisible("available"));
check("coming_soon is public", isPubliclyVisible("coming_soon"));
check("draft is NOT public", !isPubliclyVisible("draft"));
check("archived is NOT public", !isPubliclyVisible("archived"));
check(
  "PUBLIC_PRODUCT_STATUSES is exactly available + coming_soon",
  PUBLIC_PRODUCT_STATUSES.length === 2 &&
    PUBLIC_PRODUCT_STATUSES.includes("available") &&
    PUBLIC_PRODUCT_STATUSES.includes("coming_soon"),
);

console.log(
  fail === 0 ? "\nALL PASS — product lifecycle rules hold" : `\n${fail} FAILURE(S)`,
);
process.exit(fail === 0 ? 0 : 1);
