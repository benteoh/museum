// hooks/useMediaQuery.ts
'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * SSR-safe media query. Server (and first client paint) resolves false, then
 * the real match applies after hydration — same upgrade pattern as
 * `useDeviceTier`, so layout-branching consumers never mismatch markup.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}
