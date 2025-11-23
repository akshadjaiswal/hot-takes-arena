import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-stone-900 text-white',
        secondary: 'border-transparent bg-stone-100 text-stone-900',
        controversy: 'border-transparent bg-controversy text-stone-900 animate-pulse-slow',
        outline: 'text-stone-900',
        category: 'border-transparent bg-stone-200 text-stone-700 hover:bg-stone-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
