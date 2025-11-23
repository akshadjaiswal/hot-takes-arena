'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HeatMeterProps {
  agreePercentage: number
  disagreePercentage: number
  totalVotes: number
  className?: string
}

export function HeatMeter({
  agreePercentage,
  disagreePercentage,
  totalVotes,
  className,
}: HeatMeterProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Percentage labels */}
      <div className="flex justify-between items-center text-xs font-medium">
        <span className="text-agree-dark">{agreePercentage}% Agree</span>
        <span className="text-text-secondary">{totalVotes} votes</span>
        <span className="text-disagree-dark">{disagreePercentage}% Disagree</span>
      </div>

      {/* Heat meter bar */}
      <div className="relative h-2 w-full bg-stone-200 rounded-full overflow-hidden">
        {/* Agree side (left) */}
        <motion.div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-agree-light to-agree-dark"
          initial={{ width: '50%' }}
          animate={{ width: `${agreePercentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />

        {/* Disagree side (right) */}
        <motion.div
          className="absolute right-0 top-0 h-full bg-gradient-to-l from-disagree-light to-disagree-dark"
          initial={{ width: '50%' }}
          animate={{ width: `${disagreePercentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />

        {/* Center line indicator (50/50 mark) */}
        {Math.abs(agreePercentage - 50) < 5 && (
          <div className="absolute left-1/2 top-0 h-full w-0.5 bg-white/50 -translate-x-1/2" />
        )}
      </div>
    </div>
  )
}
