// hooks/useDeviceTier.ts
'use client'

import { useEffect, useState } from 'react'
import { resolveTier, type Tier } from '@/lib/deviceTier'

/**
 * Client-side device tier. SSR-safe: the static export renders with no JS on
 * first paint, so we default to `reduced` until mounted — nothing animates
 * before capabilities are known — then upgrade (or downgrade) once measured.
 *
 * Usage: `const tier = useDeviceTier()` — consumers branch on it:
 * `static` → render the settled end state, `reduced` → keep the world but
 * drop choreography, `full` → everything.
 */
export function useDeviceTier(): Tier {
  const [tier, setTier] = useState<Tier>('reduced')

  useEffect(() => {
    setTier(
      resolveTier({
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
      }),
    )
  }, [])

  return tier
}
