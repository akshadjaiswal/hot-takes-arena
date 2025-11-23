'use client'

import { useEffect, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { TakeCard } from './TakeCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { TakeWithVoteCheck, SortOption } from '@/lib/types/database.types'

interface TakeFeedProps {
  sort: SortOption
  category: string | null
  onVote: (takeId: string, voteType: 'agree' | 'disagree') => Promise<void>
  onReport: (takeId: string) => void
  fetchTakes: (params: {
    sort: SortOption
    category?: string
    cursor?: string
  }) => Promise<{
    data: TakeWithVoteCheck[]
    hasMore: boolean
    nextCursor?: string
  }>
}

export function TakeFeed({
  sort,
  category,
  onVote,
  onReport,
  fetchTakes,
}: TakeFeedProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['takes', sort, category],
    queryFn: ({ pageParam }) =>
      fetchTakes({
        sort,
        category: category || undefined,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
  })

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-card border bg-surface p-4 space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-3">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 flex-1" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-card border bg-surface p-8 text-center">
        <p className="text-text-secondary">
          {error instanceof Error ? error.message : 'Failed to load takes'}
        </p>
      </div>
    )
  }

  const takes = data?.pages.flatMap((page) => page.data) ?? []

  // Empty state
  if (takes.length === 0) {
    return (
      <div className="rounded-card border bg-surface p-8 text-center space-y-2">
        <p className="text-lg font-medium">No takes found</p>
        <p className="text-text-secondary">
          Be the first to share a hot take in this category!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {takes.map((take, index) => (
        <div
          key={take.id}
          className="animate-fade-in"
          style={{
            animationDelay: `${index * 50}ms`,
          }}
        >
          <TakeCard
            take={take}
            onVote={onVote}
            onReport={onReport}
          />
        </div>
      ))}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="flex justify-center py-4">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-text-secondary">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading more takes...</span>
          </div>
        )}
      </div>

      {!hasNextPage && takes.length > 0 && (
        <div className="text-center py-4 text-text-secondary text-sm">
          You've reached the end!
        </div>
      )}
    </div>
  )
}
