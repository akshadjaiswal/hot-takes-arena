'use client'

import { useState, useEffect, memo } from 'react'
import { motion } from 'framer-motion'
import { Flag, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { VoteButton } from './VoteButton'
import { HeatMeter } from './HeatMeter'
import { ControversyBadge } from './ControversyBadge'
import { formatRelativeTime } from '@/lib/utils/date'
import { calculateVotePercentages } from '@/lib/utils/controversy'
import type { TakeWithVoteCheck } from '@/lib/types/database.types'
import { cn } from '@/lib/utils'

interface TakeCardProps {
  take: TakeWithVoteCheck
  onVote: (takeId: string, voteType: 'agree' | 'disagree') => Promise<void>
  onReport?: (takeId: string) => void
  className?: string
}

export const TakeCard = memo(function TakeCard({ take, onVote, onReport, className }: TakeCardProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [userVote, setUserVote] = useState(take.userVote)
  const [localAgreeCount, setLocalAgreeCount] = useState(take.agree_count)
  const [localDisagreeCount, setLocalDisagreeCount] = useState(take.disagree_count)

  // Sync local userVote state when prop changes (e.g., when vote data loads)
  useEffect(() => {
    // Only update if the vote status actually changed
    if (take.userVote !== userVote) {
      console.log('[TakeCard] Vote status changed for take:', take.id.substring(0, 8), 'userVote:', take.userVote)
      setUserVote(take.userVote)
    }
  }, [take.userVote]) // Remove take.id to prevent unnecessary runs

  // Show "Content Removed" placeholder for hidden takes
  if (take.is_hidden) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        <Card className="relative">
          <CardContent className="p-6 text-center space-y-2">
            <p className="text-stone-500 font-medium">🚫 This take was removed</p>
            {take.hidden_reason && (
              <p className="text-xs text-stone-400">{take.hidden_reason}</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const { agreePercentage, disagreePercentage } = calculateVotePercentages(
    localAgreeCount,
    localDisagreeCount
  )

  const hasVoted = !!userVote

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/?take=${take.id}`
      await navigator.clipboard.writeText(url)
      toast.success('Link copied', {
        description: 'Share this take and spark a debate',
      })
    } catch (error) {
      console.error('Failed to copy take link', error)
      toast.error('Copy failed', {
        description: 'Try again or copy the URL manually',
      })
    }
  }

  const handleVote = async (voteType: 'agree' | 'disagree') => {
    if (hasVoted || isVoting) {
      if (hasVoted) {
        toast.error('Already Voted', {
          description: `You've already ${userVote}d on this take`,
        })
      }
      return
    }

    setIsVoting(true)
    try {
      await onVote(take.id, voteType)

      // Optimistically update local state
      setUserVote(voteType)

      if (voteType === 'agree') {
        setLocalAgreeCount(prev => prev + 1)
      } else {
        setLocalDisagreeCount(prev => prev + 1)
      }

      // Success toast with haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50) // Light haptic feedback
      }

      toast.success('Vote Submitted!', {
        description: `You ${voteType}d with this take`,
      })
    } catch (error: any) {
      console.error('Error voting:', error)

      // User-friendly error messages
      const errorMessage = error?.message || 'Failed to submit vote'

      if (errorMessage.includes('already voted')) {
        toast.error('Already Voted', {
          description: 'You have already voted on this take',
        })
      } else if (errorMessage.includes('Rate limit')) {
        toast.error('Slow Down!', {
          description: errorMessage,
        })
      } else {
        toast.error('Vote Failed', {
          description: errorMessage,
        })
      }
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="relative">
        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Header with category and actions */}
          <div className="flex items-start justify-between gap-2">
            <Badge variant="category" className="text-xs">
              {take.category}
            </Badge>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleCopyLink}
              >
                <Link2 className="h-4 w-4" />
                <span className="sr-only">Copy take link</span>
              </Button>

              {/* Controversy badge */}
              <ControversyBadge
                agreeCount={take.agree_count}
                disagreeCount={take.disagree_count}
                controversyScore={take.controversy_score}
              />

              {/* Report button */}
              {onReport && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onReport(take.id)}
                >
                  <Flag className="h-4 w-4" />
                  <span className="sr-only">Report</span>
                </Button>
              )}
            </div>
          </div>

          {/* Take content */}
          <div className="py-2">
            <p className="text-base sm:text-lg leading-relaxed text-text-primary">
              {take.content}
            </p>
          </div>

          {/* Voting buttons */}
          <div className="flex gap-2 sm:gap-3">
            <VoteButton
              voteType="agree"
              percentage={hasVoted ? agreePercentage : undefined}
              hasVoted={hasVoted}
              userVote={userVote}
              isLoading={isVoting}
              onVote={() => handleVote('agree')}
            />

            <VoteButton
              voteType="disagree"
              percentage={hasVoted ? disagreePercentage : undefined}
              hasVoted={hasVoted}
              userVote={userVote}
              isLoading={isVoting}
              onVote={() => handleVote('disagree')}
            />
          </div>

          {/* Heat meter (shown after voting) */}
          {hasVoted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <HeatMeter
                agreePercentage={agreePercentage}
                disagreePercentage={disagreePercentage}
                totalVotes={localAgreeCount + localDisagreeCount}
              />
            </motion.div>
          )}

          {/* Footer with timestamp */}
          <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-stone-200">
            <span>{formatRelativeTime(take.created_at)}</span>
            {take.total_votes > 0 && !hasVoted && (
              <span>{take.total_votes} votes</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
})
