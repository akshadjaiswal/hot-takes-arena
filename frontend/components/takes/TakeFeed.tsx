'use client'

import { useEffect, useRef, useMemo } from 'react'
import type { ComponentType, SVGProps } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Loader2, Flame, Sparkles, BarChart3, Activity, TrendingUp } from 'lucide-react'
import { TakeCard } from './TakeCard'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { checkUserVotes } from '@/lib/actions/votes'
import { useDeviceFingerprint, useSelectedCategory, useSelectedSort, useOpenPostModal, useAppStore } from '@/lib/stores/app-store'
import type { TakeWithVoteCheck, Take, SortOption, Category} from '@/lib/types/database.types'
import { cn } from '@/lib/utils'

interface TakeFeedProps {
  onVote: (takeId: string, voteType: 'agree' | 'disagree') => Promise<void>
  onReport: (takeId: string) => void
  categories: Category[]
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
  categories,
  fetchTakes,
}: TakeFeedProps) {
  // Get state from Zustand store
  const sort = useSelectedSort()
  const category = useSelectedCategory()
  const deviceFingerprint = useDeviceFingerprint()
  const openPostModal = useOpenPostModal()
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const setCategory = useAppStore((state) => state.setCategory)

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

  // Quick arena stats based on visible data
  const visibleStats = useMemo(() => {
    if (!data?.pages) {
      return { takes: 0, votes: 0, averageControversy: 0 }
    }

    let takes = 0
    let votes = 0
    let controversyTotal = 0

    data.pages.forEach((page) => {
      page.data.forEach((take) => {
        takes += 1
        votes += take.total_votes || 0
        controversyTotal += take.controversy_score || 0
      })
    })

    return {
      takes,
      votes,
      averageControversy: takes > 0 ? controversyTotal / takes : 0,
    }
  }, [data])

  // Trending categories from the currently loaded takes (lightweight, no extra queries)
  const trendingCategories = useMemo(() => {
    if (!data?.pages) return []

    const counts = new Map<string, { count: number; latest?: number }>()

    data.pages.forEach((page) => {
      page.data.forEach((take) => {
        const existing = counts.get(take.category) || { count: 0, latest: 0 }
        counts.set(take.category, {
          count: existing.count + 1,
          latest: Math.max(existing.latest || 0, new Date(take.created_at).getTime()),
        })
      })
    })

    const categoryMeta = new Map(categories.map((c) => [c.name, c]))

    return Array.from(counts.entries())
      .sort((a, b) => {
        if (a[1].count === b[1].count) {
          return (b[1].latest || 0) - (a[1].latest || 0)
        }
        return b[1].count - a[1].count
      })
      .slice(0, 8)
      .map(([name, info]) => ({
        name,
        count: info.count,
        emoji: categoryMeta.get(name)?.emoji || undefined,
      }))
  }, [data, categories])

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

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('en', { notation: 'compact' }).format(Math.max(0, Math.round(value)))

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
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-card border bg-surface/80 p-3 shadow-sm">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-3 h-7 w-16" />
            </div>
          ))}
        </div>
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
        icon="🤔"
        title="No fresh takes here"
        description="Be the one to ignite this category with a brand new opinion."
        action={{
          label: 'Drop a take',
          onClick: openPostModal,
        }}
        className="bg-surface shadow-sm"
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-3 overflow-x-auto pb-1 snap-x sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
        <div className="min-w-[220px] snap-start sm:min-w-0">
          <StatPill
            icon={Sparkles}
            label="Arena energy"
            value={`${formatNumber(visibleStats.votes)} votes`}
            caption="Visible in this session"
          />
        </div>
        <div className="min-w-[220px] snap-start sm:min-w-0">
          <StatPill
            icon={Activity}
            label="Takes live"
            value={`${formatNumber(visibleStats.takes)} takes`}
            caption={category ? `In ${category}` : 'All categories'}
          />
        </div>
        <div className="min-w-[220px] snap-start sm:min-w-0">
          <StatPill
            icon={BarChart3}
            label="Avg controversy"
            value={`${Math.round(visibleStats.averageControversy || 0)} pts`}
            caption="Closer to 50 is spicier"
          />
        </div>
      </div>

      {trendingCategories.length > 0 && (
        <div className="overflow-x-auto rounded-card border bg-surface px-3 py-3 shadow-sm">
          <div className="flex items-center gap-2 pb-2 text-sm font-semibold text-text-primary">
            <TrendingUp className="h-4 w-4 text-amber-600" />
            <span>Trending tags</span>
          </div>
          <div className="flex items-center gap-2 pr-1">
            {trendingCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setCategory(cat.name)}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-all whitespace-nowrap',
                  category === cat.name
                    ? 'border-amber-300 bg-amber-50 text-amber-800 shadow-sm'
                    : 'border-stone-200 bg-white text-text-primary hover:border-amber-200 hover:text-amber-800'
                )}
              >
                <span>{cat.emoji || '🔥'}</span>
                <span>{cat.name}</span>
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-text-secondary">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

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
          className="pt-8 pb-24"
        />
      )}

      <div className="rounded-card border bg-gradient-to-br from-stone-50 via-white to-amber-50 px-4 py-3 text-xs text-text-secondary shadow-sm">
        <div className="flex items-center gap-2 font-semibold text-text-primary">
          <Flame className="h-4 w-4 text-amber-600" />
          <span>How the heat works</span>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-stone-200 bg-white px-3 py-2">
            <p className="text-[0.8rem] font-semibold text-text-primary">Agree vs. Disagree</p>
            <p className="text-[0.75rem] text-text-secondary">Bars show the vote split. 50/50 means maximum controversy.</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white px-3 py-2">
            <p className="text-[0.8rem] font-semibold text-text-primary">Controversy score</p>
            <p className="text-[0.75rem] text-text-secondary">Higher scores mean closer battles. Score updates as votes roll in.</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white px-3 py-2">
            <p className="text-[0.8rem] font-semibold text-text-primary">Star a take</p>
            <p className="text-[0.75rem] text-text-secondary">Copy the link, share it, and watch the arena react in real-time.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatPillProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
  value: string
  caption: string
}

function StatPill({ icon: Icon, label, value, caption }: StatPillProps) {
  return (
    <div className="flex items-center gap-3 rounded-card border bg-surface/80 p-3 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-orange-300 text-amber-900 shadow-inner">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary leading-tight">{label}</p>
        <p className="text-sm font-semibold text-text-primary leading-tight">{value}</p>
        <p className="text-[0.75rem] text-text-secondary leading-tight">{caption}</p>
      </div>
    </div>
  )
}
