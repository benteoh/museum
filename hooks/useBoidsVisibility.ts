// hooks/useBoidsVisibility.ts
'use client'

import { useEffect } from 'react'
import {
  useScroll,
  useTransform,
  useMotionValue,
  animate,
  type MotionValue,
} from 'framer-motion'
import { tokens } from '@/lib/motion'
import { useViewportHeight } from './useViewportHeight'

// Canvas fades out over the first 40% of a viewport of scroll.
const FADE_END_FRACTION = 0.4

/**
 * Opacity for the boids canvas: a one-shot load-in (0→1 on mount) multiplied
 * by a scroll-linked fade (1→0 as the hero scrolls away). Returns a single
 * MotionValue so the component stays purely presentational.
 */
export function useBoidsVisibility(): MotionValue<number> {
  const { scrollY } = useScroll()
  const vh = useViewportHeight()

  const loadProgress = useMotionValue(0)
  const scrollOpacity = useTransform(scrollY, [0, vh * FADE_END_FRACTION], [1, 0])

  const opacity = useTransform(
    [loadProgress, scrollOpacity],
    ([load, scroll]) => (load as number) * (scroll as number)
  )

  useEffect(() => {
    const controls = animate(loadProgress, 1, {
      duration: tokens.drift.duration,
      ease: [...tokens.drift.ease],
    })
    return () => controls.stop()
  }, [loadProgress])

  return opacity
}
