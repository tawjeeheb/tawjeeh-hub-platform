import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="container py-10">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <Skeleton className="hidden h-72 rounded-2xl lg:block" />
        <div>
          <Skeleton className="h-8 w-40" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
