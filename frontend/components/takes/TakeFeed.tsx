'use client'

import { useEffect, useRef, useMemo } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Loader2, Flame } from 'lucide-react'
import { TakeCard } from './TakeCard'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { checkUserVotes } from '@/lib/actions/votes'
import { useDeviceFingerprint, useSelectedCategory, useSelectedSort, useOpenPostModal } from '@/lib/stores/app-store'
import type { TakeWithVoteCheck, Take, SortOption} from '@/lib/types/database.types'

interface TakeFeedProps {
  onVote: (takeId: string, voteType: 'agree' | 'disagree') => Promise<void>
  onReport: (takeId: string) => void
  fetchTakes: (params: {
    sort: SortOption
    category?: string
    cursor?: string
  }) => Promise<{
    data: Take[]
    hasMore: boolean
    nextCursor?: string
  }>
}

export function TakeFeed({
  onVote,
  onReport,
  fetchTakes,
}: TakeFeedProps) {
  // Get state from Zustand store
  const sort = useSelectedSort()
  const category = useSelectedCategory()
  const deviceFingerprint = useDeviceFingerprint()
  const openPostModal = useOpenPostModal()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Fetch takes
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
    staleTime: 30 * 1000, // 30 seconds
  })

  // Get all take IDs from all pages
  const takeIds = useMemo(() => {
    if (!data?.pages) return []
    const ids = data.pages.flatMap(page => page.data.map(take => take.id))
    console.log('[TakeFeed] Computed takeIds:', ids.length, 'takes')
    return ids
  }, [data])

  // Create stable query key from takeIds by sorting and joining
  const takeIdsKey = useMemo(() => {
    return takeIds.sort().join(',')
  }, [takeIds])

  // Batch check user votes for all visible takes
  const { data: userVotes = {}, isLoading: isLoadingVotes } = useQuery({
    queryKey: ['user-votes', takeIdsKey, deviceFingerprint],
    queryFn: async () => {
      console.log('[TakeFeed] Fetching votes for', takeIds.length, 'takes with fingerprint:', deviceFingerprint?.substring(0, 8))

      if (!deviceFingerprint || !takeIds.length) {
        console.log('[TakeFeed] Skipping vote check - missing fingerprint or no takes')
        return {}
      }

      const result = await checkUserVotes(takeIds, deviceFingerprint)
      if ('error' in result) {
        console.error('[TakeFeed] Failed to check votes:', result.error)
        return {}
      }

      console.log('[TakeFeed] Vote check result:', Object.keys(result.data).length, 'votes found')
      return result.data
    },
    enabled: !!deviceFingerprint && takeIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes - balance between freshness and performance
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  })

  // Merge takes with vote data
  const takesWithVotes = useMemo<TakeWithVoteCheck[]>(() => {
    if (!data?.pages) return []

    const merged = data.pages.flatMap(page =>
      page.data.map(take => ({
        ...take,
        userVote: userVotes[take.id] || null,
        agreePercentage: take.total_votes > 0
          ? Math.round((take.agree_count / take.total_votes) * 100)
          : 50,
        disagreePercentage: take.total_votes > 0
          ? Math.round((take.disagree_count / take.total_votes) * 100)
          : 50,
      }))
    )

    const votedCount = merged.filter(t => t.userVote).length
    console.log('[TakeFeed] Merged data:', merged.length, 'takes,', votedCount, 'with user votes')

    return merged
  }, [data, userVotes])

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

  // Empty state
  if (takesWithVotes.length === 0 && !isLoading) {
    return (
      <EmptyState
        icon="🤷"
        title="No takes found"
        description="Be the first to share a hot take in this category!"
        action={{
          label: 'Drop a Take',
          onClick: openPostModal,
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      {takesWithVotes.map((take, index) => (
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

      {!hasNextPage && takesWithVotes.length > 0 && (
        <EmptyState
          icon="🎉"
          title="You've seen it all!"
          description="Drop your own hot take to keep the fire burning"
          action={{
            label: 'Drop a Take',
            onClick: openPostModal,
          }}
          className="pt-8 pb-32"
        />
      )}
    </div>
  )
}
