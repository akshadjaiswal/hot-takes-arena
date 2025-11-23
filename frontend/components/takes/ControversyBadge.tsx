'use client'

import { Flame } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { isControversial } from '@/lib/utils/controversy'

interface ControversyBadgeProps {
  agreeCount: number
  disagreeCount: number
  controversyScore: number | null
  className?: string
}

export function ControversyBadge({
  agreeCount,
  disagreeCount,
  controversyScore,
  className,
}: ControversyBadgeProps) {
  const controversial = isControversial(agreeCount, disagreeCount, 50)

  if (!controversial || !controversyScore) {
    return null
  }

  return (
    <Badge
      variant="controversy"
      className={cn('gap-1', className)}
    >
      <Flame className="h-3 w-3" />
      <span>Controversial</span>
    </Badge>
  )
}
