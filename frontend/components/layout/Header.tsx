'use client'

import { Flame } from 'lucide-react'
import { motion } from 'framer-motion'

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-4">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-amber-300 to-orange-500">
            <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
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
