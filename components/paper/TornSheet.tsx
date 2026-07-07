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
}

export function TornSheet({ seed, className, children }: Props) {
  const rawId = useId()
  const clipId = `torn-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const d = useMemo(() => tornEdgePath({ width: 1, height: 1, seed: hashSeed(seed) }), [seed])

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={{ clipPath: `url(#${clipId})` }}
    >
      <svg aria-hidden className={styles.defs}>
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={d} />
          </clipPath>
        </defs>
      </svg>
      {children}
    </div>
  )
}
