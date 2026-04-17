import { Skeleton } from "@/components/ui/skeleton";

export default function BriefingLoading() {
  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      <Skeleton className="h-12 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-3">
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}
