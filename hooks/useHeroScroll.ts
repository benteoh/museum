// hooks/useHeroScroll.ts
'use client'

import { useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useViewportHeight } from './useViewportHeight'

// Hero fades and recedes over the first fraction of a viewport of scroll.
const FADE_END_FRACTION = 0.2
const MIN_SCALE = 0.97

/**
 * Scroll-linked opacity + scale for the hero title.
 * Keeps the imperative Framer Motion wiring out of the component.
 */
export function useHeroScroll(): {
  opacity: MotionValue<number>
  scale: MotionValue<number>
} {
  const { scrollY } = useScroll()
  const vh = useViewportHeight()
  const fadeEnd = vh * FADE_END_FRACTION

  const opacity = useTransform(scrollY, [0, fadeEnd], [1, 0])
  const scale = useTransform(scrollY, [0, fadeEnd], [1, MIN_SCALE])

  return { opacity, scale }
}
