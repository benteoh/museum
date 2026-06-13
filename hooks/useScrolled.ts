// hooks/useScrolled.ts
'use client'

import { useState, useEffect } from 'react'

/**
 * Tracks whether the page has scrolled past `threshold` pixels.
 * Listens passively and syncs once on mount so it's correct after navigation.
 */
export function useScrolled(threshold = 20): boolean {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolled
}
