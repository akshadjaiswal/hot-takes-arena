import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24">
      {/* Category filter skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>

      {/* Sort selector skeleton */}
      <Skeleton className="h-10 w-48 rounded-lg" />

      {/* Stat pills skeleton */}
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-card border bg-surface/80 p-3 shadow-sm">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-3 h-7 w-16" />
          </div>
        ))}
      </div>

      {/* Take card skeletons */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-card border bg-surface p-4 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-10/12" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-11 flex-1" />
            <Skeleton className="h-11 flex-1" />
          </div>
        </div>
      ))}
    </div>
  )
}
