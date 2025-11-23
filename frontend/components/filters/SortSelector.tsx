'use client'

import { Button } from '@/components/ui/button'
import { Flame, Clock, TrendingUp, ThumbsUp, ThumbsDown } from 'lucide-react'
import type { SortOption } from '@/lib/types/database.types'
import { cn } from '@/lib/utils'

const SORT_OPTIONS: {
  value: SortOption
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}[] = [
  {
    value: 'controversial',
    label: 'Most Controversial',
    icon: Flame,
    description: 'Closest to 50/50 split',
  },
  {
    value: 'fresh',
    label: 'Fresh',
    icon: Clock,
    description: 'Most recent takes',
  },
  {
    value: 'trending',
    label: 'Trending',
    icon: TrendingUp,
    description: 'Popular right now',
  },
  {
    value: 'top_agreed',
    label: 'Top Agreed',
    icon: ThumbsUp,
    description: 'Highest agree votes',
  },
  {
    value: 'top_disagreed',
    label: 'Top Disagreed',
    icon: ThumbsDown,
    description: 'Highest disagree votes',
  },
]

interface SortSelectorProps {
  selectedSort: SortOption
  onSelectSort: (sort: SortOption) => void
  className?: string
}

export function SortSelector({
  selectedSort,
  onSelectSort,
  className,
}: SortSelectorProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-sm font-medium text-text-secondary">Sort by</h3>
      {/* Wrapped flex container - shows all buttons without horizontal scrolling */}
      <div className="flex flex-wrap gap-2">
        {SORT_OPTIONS.map((option) => {
          const Icon = option.icon
          const isSelected = selectedSort === option.value

          return (
            <Button
              key={option.value}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'gap-2 transition-all touch-target',
                isSelected && 'ring-2 ring-stone-900 ring-offset-2'
              )}
              onClick={() => onSelectSort(option.value)}
            >
              <Icon className="h-4 w-4" />
              <span className="whitespace-nowrap">{option.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
