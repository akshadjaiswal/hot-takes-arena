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
          'w-full h-12 touch-target relative transition-all',
          isSelectedVote && 'ring-2 ring-stone-900 ring-offset-2',
          isDisabled && 'cursor-not-allowed',
          isPressed && 'scale-95'
        )}
        onClick={handleClick}
        disabled={isDisabled}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <Icon className={cn('h-5 w-5 mr-2', isSelectedVote && 'fill-current')} />
            <span className="font-semibold">{label}</span>
            {hasVoted && percentage !== undefined && (
              <motion.span
                className="ml-auto font-bold text-lg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
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
