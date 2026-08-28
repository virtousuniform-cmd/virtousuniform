import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <div className="bg-primary py-16">
        <div className="mx-auto max-w-7xl px-6">
          <Skeleton className="mb-2 h-4 w-20 bg-primary-foreground/20" />
          <Skeleton className="mb-3 h-9 w-96 max-w-full bg-primary-foreground/20" />
          <Skeleton className="h-5 w-full max-w-lg bg-primary-foreground/20" />
        </div>
      </div>

      <div className="border-b border-border bg-card py-4">
        <div className="mx-auto flex max-w-7xl gap-2 px-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
