import { ProductCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <>
      <section className="border-b border-navy/10 bg-offwhite">
        <div className="container py-14 md:py-16">
          <div className="max-w-2xl space-y-4">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        </div>
      </section>
      <div className="container py-12">
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </>
  );
}
