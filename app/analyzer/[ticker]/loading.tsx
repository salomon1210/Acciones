import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyzerLoading() {
  return (
    <div className="p-3 md:p-4 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="ml-auto h-8 w-32" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-96 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  );
}
