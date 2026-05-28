import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="h-9 w-48 rounded-full" />
      <Skeleton className="h-4 w-72 max-w-full rounded-full" />
    </div>
  );
}

export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8", className)}>
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-3xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Skeleton className="h-72 rounded-3xl xl:col-span-2" />
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    </div>
  );
}

export function ListPageSkeleton({
  rows = 4,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-2xl space-y-6 px-4 py-8", className)}>
      <PageHeaderSkeleton />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Card key={index} className="border-none shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3 rounded-full" />
                <Skeleton className="h-3 w-full rounded-full" />
              </div>
              <Skeleton className="h-9 w-20 rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="min-h-dvh bg-background pb-10">
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-8 w-40 rounded-full" />
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="border-none shadow-sm">
            <CardContent className="flex gap-4 p-4">
              <Skeleton className="h-20 w-20 shrink-0 rounded-xl" />
              <div className="flex flex-1 flex-col justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-2/3 rounded-full" />
                  <Skeleton className="h-3 w-1/2 rounded-full" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <Skeleton className="h-40 rounded-3xl" />
      </div>
    </div>
  );
}

export function CatalogSkeleton() {
  return (
    <div className="min-h-dvh bg-background pb-20">
      <Skeleton className="h-64 w-full rounded-none" />
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <Card className="-mt-24 border-none shadow-xl">
          <CardContent className="space-y-6 p-6 md:p-8">
            <PageHeaderSkeleton />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-24 shrink-0 rounded-full" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-4 rounded-2xl bg-muted/30 p-3">
                  <Skeleton className="h-24 w-24 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-3 py-1">
                    <Skeleton className="h-4 w-3/4 rounded-full" />
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-3 w-full rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
