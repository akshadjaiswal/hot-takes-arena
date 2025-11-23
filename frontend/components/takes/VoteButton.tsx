'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { VoteType } from '@/lib/types/database.types'

interface VoteButtonProps {
  voteType: VoteType
  percentage?: number
  hasVoted: boolean
  userVote?: VoteType | null
  isLoading: boolean
  onVote: () => void
  className?: string
}

export function VoteButton({
  voteType,
  percentage,
  hasVoted,
  userVote,
  isLoading,
  onVote,
  className,
}: VoteButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const isAgree = voteType === 'agree'
  const Icon = isAgree ? ThumbsUp : ThumbsDown
  const label = isAgree ? 'Agree' : 'Disagree'
  const variant = isAgree ? 'agree' : 'disagree'

  const isSelectedVote = hasVoted && userVote === voteType
  const isDisabled = hasVoted || isLoading

  const handleClick = () => {
    if (isDisabled) return

    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 200)

    onVote()
  }

  return (
    <motion.div
      className={cn('flex-1', className)}
      whileTap={!isDisabled ? { scale: 0.95 } : undefined}
    >
      <Button
        variant={isDisabled ? 'outline' : variant}
        size="lg"
        className={cn(
          'w-full h-12 sm:h-14 touch-target relative transition-all flex items-center justify-between px-3 sm:px-4',
          isSelectedVote && 'ring-2 ring-stone-900 ring-offset-2',
          isDisabled && 'cursor-not-allowed opacity-100',
          !isSelectedVote && hasVoted && 'opacity-70',
          isPressed && 'scale-95'
        )}
        onClick={handleClick}
        disabled={isDisabled}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        ) : (
          <>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', isSelectedVote && 'fill-current')} />
              <span className="font-semibold text-sm sm:text-base">{label}</span>
            </div>
            {hasVoted && percentage !== undefined && (
              <motion.span
                className="font-bold text-base sm:text-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, type: 'spring' }}
              >
                {percentage}%
              </motion.span>
            )}
          </>
        )}
      </Button>
    </motion.div>
  )
}
