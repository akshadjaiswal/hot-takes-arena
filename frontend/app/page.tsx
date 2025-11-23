'use client'

import { useState, useEffect } from 'react'
import { CategoryFilter } from '@/components/filters/CategoryFilter'
import { SortSelector } from '@/components/filters/SortSelector'
import { TakeFeed } from '@/components/takes/TakeFeed'
import { PostTakeModal } from '@/components/takes/PostTakeModal'
import { ReportModal } from '@/components/takes/ReportModal'
import { FloatingActionButton } from '@/components/layout/FloatingActionButton'
import { getCategories } from '@/lib/actions/categories'
import { getTakes, getHashedClientIP, createTake } from '@/lib/actions/takes'
import { createVote, checkUserVote } from '@/lib/actions/votes'
import { createReport } from '@/lib/actions/reports'
import { getDeviceFingerprint } from '@/lib/utils/fingerprint'
import type { Category, SortOption, TakeWithVoteCheck } from '@/lib/types/database.types'

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSort, setSelectedSort] = useState<SortOption>('controversial')
  const [postModalOpen, setPostModalOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportingTakeId, setReportingTakeId] = useState<string | null>(null)
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('')
  const [ipHash, setIpHash] = useState<string>('')

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      const result = await getCategories()
      if ('data' in result) {
        setCategories(result.data)
      }
    }

    loadCategories()
  }, [])

  // Get device fingerprint and IP hash on mount
  useEffect(() => {
    const initIdentifiers = async () => {
      const fp = await getDeviceFingerprint()
      setDeviceFingerprint(fp)

      const hash = await getHashedClientIP()
      setIpHash(hash)
    }

    initIdentifiers()
  }, [])

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

    // Check vote status for each take
    const takesWithVotes = await Promise.all(
      result.data.data.map(async (take) => {
        if (!deviceFingerprint) return take

        const voteResult = await checkUserVote({
          takeId: take.id,
          deviceFingerprint,
        })

        if ('data' in voteResult && voteResult.data.voted) {
          return {
            ...take,
            userVote: voteResult.data.voteType,
          }
        }

        return take
      })
    )

    return {
      data: takesWithVotes,
      hasMore: result.data.hasMore,
      nextCursor: result.data.nextCursor,
    }
  }

  const handleVote = async (takeId: string, voteType: 'agree' | 'disagree') => {
    if (!deviceFingerprint || !ipHash) {
      throw new Error('Device identification failed')
    }

    const result = await createVote({
      takeId,
      voteType,
      deviceFingerprint,
      ipHash,
    })

    if ('error' in result) {
      throw new Error(result.error)
    }
  }

  const handlePostTake = async (content: string, category: string) => {
    if (!deviceFingerprint || !ipHash) {
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

    // Close modal and refresh feed
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
