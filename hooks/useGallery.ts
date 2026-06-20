// hooks/useGallery.ts
'use client'

import { useEffect, useRef, useState } from 'react'
import {
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion'
import { scrollDistance, activeIndexAt } from './galleryMath'

type GalleryControls = {
  sectionRef: React.RefObject<HTMLDivElement | null>
  trackRef: React.RefObject<HTMLDivElement | null>
  x: MotionValue<number>
  activeIndex: number
}

/**
 * Drives the horizontal gallery: maps vertical scroll over the sticky section
 * to a sprung horizontal translate, and tracks the centred panel index.
 */
export function useGallery(panelCount: number): GalleryControls {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [distance, setDistance] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current
      if (!track) return
      setDistance(scrollDistance(track.scrollWidth, window.innerWidth))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [panelCount])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  // Honour reduced-motion: skip the spring so the track tracks scroll directly
  // (no extra sprung overshoot/settle), consistent with the project's a11y pattern.
  const prefersReduced = useReducedMotion()
  const rawX = useTransform(scrollYProgress, [0, 1], [0, -distance])
  const sprungX = useSpring(rawX, { stiffness: 60, damping: 20 })
  const x = prefersReduced ? rawX : sprungX

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    setActiveIndex(activeIndexAt(progress, panelCount))
  })

  return { sectionRef, trackRef, x, activeIndex }
}
