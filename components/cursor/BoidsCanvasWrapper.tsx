// components/cursor/BoidsCanvasWrapper.tsx
'use client'

import { useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionValue, animate } from 'framer-motion'
import { BoidsCanvas } from './BoidsCanvas'
import { tokens } from '@/lib/motion'

export function BoidsCanvasWrapper() {
  const { scrollY } = useScroll()
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800

  // Load progress: animates 0→1 on mount over 2s (drift token)
  const loadProgress = useMotionValue(0)

  // Scroll-linked opacity: 1 at top, 0 at 40% scroll
  const scrollOpacity = useTransform(scrollY, [0, vh * 0.4], [1, 0])

  // Final opacity = loadProgress × scrollOpacity
  const finalOpacity = useTransform(
    [loadProgress, scrollOpacity],
    ([l, s]) => (l as number) * (s as number)
  )

  useEffect(() => {
    animate(loadProgress, 1, {
      duration: tokens.drift.duration,
      ease: [...tokens.drift.ease],
    })
  }, [loadProgress])

  return (
    <motion.div style={{ opacity: finalOpacity }}>
      <BoidsCanvas />
    </motion.div>
  )
}
