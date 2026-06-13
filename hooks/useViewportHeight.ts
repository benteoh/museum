// hooks/useViewportHeight.ts
'use client'

import { useState, useEffect } from 'react'

/**
 * SSR-safe viewport height that stays in sync with resize.
 *
 * Returns `fallback` on the server and the first client render (so markup
 * matches and hydration is stable), then settles to the real `innerHeight`
 * and updates on every resize. Use this instead of reading `window.innerHeight`
 * inline, which freezes at first paint and never tracks resizes.
 */
export function useViewportHeight(fallback = 800): number {
  const [height, setHeight] = useState(fallback)

  useEffect(() => {
    const update = () => setHeight(window.innerHeight)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return height
}
