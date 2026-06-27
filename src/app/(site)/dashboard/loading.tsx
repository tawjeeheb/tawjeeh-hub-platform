import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="container py-10 md:py-12">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="mt-10 h-6 w-28" />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="mt-12 h-6 w-28" />
      <Skeleton className="mt-5 h-40 w-full rounded-2xl" />
    </div>
  );
}
