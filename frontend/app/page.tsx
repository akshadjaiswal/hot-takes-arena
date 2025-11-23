'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CategoryFilter } from '@/components/filters/CategoryFilter'
import { SortSelector } from '@/components/filters/SortSelector'
import { TakeFeed } from '@/components/takes/TakeFeed'
import { PostTakeModal } from '@/components/takes/PostTakeModal'
import { ReportModal } from '@/components/takes/ReportModal'
import { FloatingActionButton } from '@/components/layout/FloatingActionButton'
import { getCategories } from '@/lib/actions/categories'
import { getTakes, getHashedClientIP, createTake } from '@/lib/actions/takes'
import { createVote, checkUserVotes } from '@/lib/actions/votes'
import { createReport } from '@/lib/actions/reports'
import { getDeviceFingerprint } from '@/lib/utils/fingerprint'
import type { Category, SortOption, TakeWithVoteCheck } from '@/lib/types/database.types'

export default function Home() {
  const queryClient = useQueryClient()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSort, setSelectedSort] = useState<SortOption>('controversial')
  const [postModalOpen, setPostModalOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportingTakeId, setReportingTakeId] = useState<string | null>(null)
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('')
  const [ipHash, setIpHash] = useState<string>('')

  // Get device fingerprint and IP hash on mount
  useEffect(() => {
    const initIdentifiers = async () => {
      console.log('[Home] Initializing device identifiers...')

      const fp = await getDeviceFingerprint()
      console.log('[Home] Device fingerprint:', fp?.substring(0, 8))
      setDeviceFingerprint(fp)

      const hash = await getHashedClientIP()
      console.log('[Home] IP hash:', hash?.substring(0, 8))
      setIpHash(hash)

      console.log('[Home] Device identifiers ready')
    }

    initIdentifiers()
  }, [])

  // Query for categories (cached for 1 hour)
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('[Home] Fetching categories...')
      const result = await getCategories()
      if ('error' in result) throw new Error(result.error)
      console.log('[Home] Categories loaded:', result.data.length)
      return result.data
    },
    staleTime: 60 * 60 * 1000, // 1 hour - categories rarely change
    gcTime: 60 * 60 * 1000, // Keep in cache
  })

  // Simplified fetchTakes - just returns takes without vote checking
  const fetchTakes = async (params: {
    sort: SortOption
    category?: string
    cursor?: string
  }) => {
    const result = await getTakes({
      sort: params.sort,
      category: params.category,
      limit: 20,
      cursor: params.cursor,
    })

    if ('error' in result) {
      throw new Error(result.error)
    }

    return {
      data: result.data.data,
      hasMore: result.data.hasMore,
      nextCursor: result.data.nextCursor,
    }
  }

  const handleVote = async (takeId: string, voteType: 'agree' | 'disagree') => {
    if (!deviceFingerprint || !ipHash) {
      toast.error('Error', { description: 'Device identification failed' })
      throw new Error('Device identification failed')
    }

    const result = await createVote({
      takeId,
      voteType,
      deviceFingerprint,
      ipHash,
    })

    if ('error' in result) {
      // Throw error so TakeCard can catch it and display toast
      throw new Error(result.error)
    }

    // Invalidate queries to refetch data
    queryClient.invalidateQueries({ queryKey: ['takes'] })
    queryClient.invalidateQueries({ queryKey: ['user-votes'] })
  }

  const handlePostTake = async (content: string, category: string) => {
    if (!deviceFingerprint || !ipHash) {
      toast.error('Error', { description: 'Device identification failed' })
      throw new Error('Device identification failed')
    }

    const result = await createTake({
      content,
      category,
      deviceFingerprint,
      ipHash,
    })

    if ('error' in result) {
      throw new Error(result.error)
    }

    // Invalidate takes query to show new take
    queryClient.invalidateQueries({ queryKey: ['takes'] })

    setPostModalOpen(false)
  }

  const handleReport = (takeId: string) => {
    setReportingTakeId(takeId)
    setReportModalOpen(true)
  }

  const handleSubmitReport = async (reason: string, additionalInfo?: string) => {
    if (!reportingTakeId || !deviceFingerprint || !ipHash) {
      throw new Error('Missing required information')
    }

    const result = await createReport({
      takeId: reportingTakeId,
      reason: reason as any,
      additionalInfo,
      deviceFingerprint,
      ipHash,
    })

    if ('error' in result) {
      throw new Error(result.error)
    }

    setReportModalOpen(false)
    setReportingTakeId(null)
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24">
      {/* Filters Section */}
      <div className="space-y-5 sm:space-y-6">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <SortSelector
          selectedSort={selectedSort}
          onSelectSort={setSelectedSort}
        />
      </div>

      {/* Feed Section */}
      <TakeFeed
        sort={selectedSort}
        category={selectedCategory}
        deviceFingerprint={deviceFingerprint}
        onVote={handleVote}
        onReport={handleReport}
        fetchTakes={fetchTakes}
      />

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setPostModalOpen(true)} />

      {/* Modals */}
      <PostTakeModal
        open={postModalOpen}
        onOpenChange={setPostModalOpen}
        categories={categories}
        onSubmit={handlePostTake}
      />

      <ReportModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        takeId={reportingTakeId || ''}
        onSubmit={handleSubmitReport}
      />
    </div>
  )
}
