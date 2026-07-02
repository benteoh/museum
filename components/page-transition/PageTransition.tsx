'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { tokens } from '@/lib/motion'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence>
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: tokens.cinematic.duration, ease: tokens.cinematic.ease },
        }}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  )
}
