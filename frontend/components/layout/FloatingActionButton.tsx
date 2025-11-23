'use client'

import { Flame } from 'lucide-react'
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
        'fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50',
        className
      )}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Pulsing ring animation */}
      <motion.div
        className="absolute inset-0 rounded-full bg-red-500 opacity-20"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <Button
        size="lg"
        className="relative h-16 px-6 sm:h-18 sm:px-8 rounded-full shadow-2xl hover:shadow-3xl transition-all bg-gradient-to-br from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold group"
        onClick={onClick}
        title="Share your hot take"
      >
        <Flame className="h-6 w-6 sm:h-7 sm:w-7 group-hover:scale-110 transition-transform" />
        <span className="ml-2 hidden sm:inline">Drop a Take</span>
        <span className="sr-only">Post new hot take</span>
      </Button>
    </motion.div>
  )
}
