'use client'

import { Badge } from '@/components/ui/badge'
import type { Category } from '@/lib/types/database.types'
import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
  className?: string
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  className,
}: CategoryFilterProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-sm font-medium text-text-secondary">Filter by Category</h3>
      {/* Wrapped flex container - shows all badges without horizontal scrolling */}
      <div className="flex flex-wrap gap-2">
        {/* All categories option */}
        <Badge
          variant={selectedCategory === null ? 'default' : 'outline'}
          className={cn(
            'cursor-pointer transition-all hover:scale-105 touch-target',
            selectedCategory === null && 'ring-2 ring-stone-900 ring-offset-2'
          )}
          onClick={() => onSelectCategory(null)}
        >
          All
        </Badge>

        {/* Individual categories */}
        {categories.map((category) => (
          <Badge
            key={category.id}
            variant={selectedCategory === category.name ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer transition-all hover:scale-105 touch-target',
              selectedCategory === category.name &&
                'ring-2 ring-stone-900 ring-offset-2'
            )}
            onClick={() => onSelectCategory(category.name)}
          >
            {category.emoji && <span className="mr-1">{category.emoji}</span>}
            {category.name}
          </Badge>
        ))}
      </div>
    </div>
  )
}
