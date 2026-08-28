import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <div className="bg-primary/90 px-6 py-28 text-center sm:py-36">
        <Skeleton className="mx-auto h-10 w-full max-w-2xl bg-primary-foreground/20" />
        <Skeleton className="mx-auto mt-4 h-5 w-full max-w-xl bg-primary-foreground/20" />
      </div>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-14 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
