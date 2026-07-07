// lib/deviceTier.ts
// The performance floor, made executable. A performance budget is a
// pre-committed hard limit, not a post-hoc audit: every animation consumer
// (settle choreography, boids, paper physics, tear shader, R3F hall) reads
// this one tested decision instead of improvising its own navigator sniffs.

/**
 * - `full` — every effect at full fidelity (60fps-class hardware).
 * - `reduced` — user asked for reduced motion; keep the world, drop the choreography.
 * - `static` — weak hardware; no animation at all, render the settled end state.
 */
export type Tier = 'full' | 'reduced' | 'static'

export type DeviceCapabilities = {
  reducedMotion: boolean
  /** `navigator.hardwareConcurrency` — undefined when the browser hides it. */
  hardwareConcurrency?: number
  /** `navigator.deviceMemory` (GB) — non-standard, Chromium-only; undefined elsewhere. */
  deviceMemory?: number
}

/**
 * Tier rules from the visual brief's performance floor:
 * `hardwareConcurrency ≤ 2` or `deviceMemory < 4GB` → `static` — weak
 * hardware wins over everything, including a reduced-motion preference.
 * Otherwise `reducedMotion` → `reduced`, else `full`. Missing capability
 * values are treated as capable (no penalty for browsers that hide them).
 */
export function resolveTier({ reducedMotion, hardwareConcurrency, deviceMemory }: DeviceCapabilities): Tier {
  const weakCpu = hardwareConcurrency !== undefined && hardwareConcurrency <= 2
  const weakMemory = deviceMemory !== undefined && deviceMemory < 4
  if (weakCpu || weakMemory) return 'static'
  if (reducedMotion) return 'reduced'
  return 'full'
}
