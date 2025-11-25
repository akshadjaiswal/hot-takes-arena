'use client'

import { Flame } from 'lucide-react'
import { motion } from 'framer-motion'

export function Header() {
  const sparks = [
    {
      className: 'absolute -right-3 bottom-1 h-2 w-2 rounded-full bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.6)]',
      animate: {
        x: [0, 5, -2, 4, 0],
        y: [0, -6, -3, -1, 0],
        opacity: [0.5, 1, 0.7, 1, 0.5],
        scale: [0.9, 1.1, 0.95, 1.1, 0.9],
      },
      transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 },
    },
    {
      className: 'absolute -left-2 top-0 h-1.5 w-1.5 rounded-full bg-amber-100/90 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
      animate: {
        x: [0, -4, 2, -3, 0],
        y: [0, -4, -6, -3, 0],
        opacity: [0.4, 0.9, 0.6, 0.9, 0.4],
        scale: [0.8, 1.05, 0.9, 1.05, 0.8],
      },
      transition: { duration: 2.9, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
    },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-4">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <span className="absolute inset-[-8px] rounded-full bg-gradient-to-br from-amber-200/50 via-orange-200/40 to-red-200/30 blur-lg animate-pulse-slow" aria-hidden="true" />
            <span className="absolute -right-2 -top-1 h-3 w-3 rounded-full bg-amber-300/80 blur-[2px] animate-ping" aria-hidden="true" />
            {sparks.map((spark, index) => (
              <motion.span
                key={index}
                className={spark.className}
                animate={spark.animate}
                transition={spark.transition}
                aria-hidden="true"
              />
            ))}
            <motion.div
              className="relative flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 shadow-sm"
              animate={{
                rotate: [-4, 3, -2, 4, -4],
                scale: [1, 1.05, 1],
                y: [0, -1.5, 0.5, -1, 0],
              }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                  rotate: [-6, 0, 6, 0],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  repeatDelay: 0.1,
                }}
              >
                <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow" />
              </motion.div>
            </motion.div>
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold tracking-tight">
              Hot Takes Arena
            </h1>
            <p className="text-xs text-text-secondary hidden xs:block">
              Where opinions collide
            </p>
          </div>
        </motion.div>

        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium">Anonymous Voting</p>
            <p className="text-xs text-text-secondary">No login required</p>
          </div>
        </motion.div>
      </div>
    </header>
  )
}
