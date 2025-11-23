'use client'

import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FloatingActionButtonProps {
  onClick: () => void
  className?: string
}

export function FloatingActionButton({
  onClick,
  className,
}: FloatingActionButtonProps) {
  return (
    <motion.div
      className={cn(
        'fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50',
        className
      )}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        size="lg"
        className="h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-amber-300 to-orange-500 hover:from-amber-400 hover:to-orange-600 text-white touch-target"
        onClick={onClick}
      >
        <Plus className="h-6 w-6 sm:h-7 sm:w-7" />
        <span className="sr-only">Post new take</span>
      </Button>
    </motion.div>
  )
}
