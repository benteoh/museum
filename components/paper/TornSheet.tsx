'use client'

// components/paper/TornSheet.tsx
import { useId, useMemo } from 'react'
import { tornEdgePath, hashSeed } from './tornEdge'
import * as styles from './TornSheet.css'

type Props = {
  /** Any stable string (e.g. project slug) — same seed, same tear. */
  seed: string
  className?: string
  children: React.ReactNode
  /**
   * Optional custom fibre layer filling the rim (e.g. a lightened copy of the
   * sheet's own image, so the exposed fibre matches the local paper colour).
   * Falls back to a solid raw-fibre tint.
   */
  rim?: React.ReactNode
}

/**
 * Clips children to a deterministic torn-paper outline. Two stacked clips
 * sell the tear: a rougher outer path filled with pale raw-fibre colour, and
 * a slightly inset, differently-seeded inner path clipping the content — so
 * the light fibre rim peeks through unevenly, the way a real tear exposes
 * the paper's core.
 */
export function TornSheet({ seed, className, children, rim }: Props) {
  const rawId = useId()
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '')
  const rimId = `torn-rim-${id}`
  const coreId = `torn-core-${id}`
  const base = hashSeed(seed)
  // High segment count + small amplitude: many fine tears, no big excursions.
  const rimD = useMemo(
    () => tornEdgePath({ width: 1, height: 1, seed: base, roughness: 0.009, segments: 110 }),
    [base],
  )
  const coreD = useMemo(
    () => tornEdgePath({ width: 1, height: 1, seed: base ^ 0x51ed270b, roughness: 0.006, segments: 90 }),
    [base],
  )

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <svg aria-hidden className={styles.defs}>
        <defs>
          <clipPath id={rimId} clipPathUnits="objectBoundingBox">
            <path d={rimD} />
          </clipPath>
          <clipPath id={coreId} clipPathUnits="objectBoundingBox">
            <path d={coreD} />
          </clipPath>
        </defs>
      </svg>
      <div className={styles.rim} style={{ clipPath: `url(#${rimId})` }}>
        {rim}
      </div>
      <div className={styles.content} style={{ clipPath: `url(#${coreId})` }}>
        {children}
      </div>
    </div>
  )
}
