'use client'

// components/overture/StudyDrawing.tsx
// Procedural fallback when a manuscript seed has no generated scan.
import { mulberry32, hashSeed } from '@/components/paper/tornEdge'
import * as styles from './StudyDrawing.css'

export type StudyVariant = 'wing' | 'vitruvian' | 'gear' | 'script' | 'force'

/** Sketchy pseudo-handwriting rows — deterministic squiggle per seed. */
function scriptRows(seed: string): string[] {
  const rand = mulberry32(hashSeed(seed))
  const rows: string[] = []
  for (let y = 22; y <= 82; y += 7) {
    let d = `M 10 ${y}`
    let x = 10
    const end = 55 + rand() * 35
    while (x < end) {
      const step = 2.5 + rand() * 3.5
      x += step
      d += ` q ${step / 2} ${(rand() * 2 - 1) * 2.2} ${step} 0`
    }
    rows.push(d)
  }
  return rows
}

export function StudyDrawing({ variant, seed }: { variant: StudyVariant; seed: string }) {
  return (
    <svg className={styles.drawing} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden>
      {/* ruled manuscript lines */}
      <g className={styles.ruled} opacity={0.45}>
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={8} y1={14 + i * 9} x2={92} y2={14 + i * 9} stroke="currentColor" strokeWidth={0.25} />
        ))}
      </g>
      <g stroke="currentColor" strokeWidth={0.6} fill="none" opacity={0.85}>
        {variant === 'wing' && (
          <>
            <path d="M 22 68 Q 40 24 82 46" />
            <path d="M 22 68 Q 42 34 80 54" />
            {Array.from({ length: 7 }, (_, i) => {
              const t = i / 6
              return <line key={i} x1={26 + t * 6} y1={66 - t * 4} x2={30 + t * 48} y2={30 + t * 22} strokeWidth={0.35} />
            })}
            <circle cx={22} cy={68} r={2.2} />
          </>
        )}
        {variant === 'vitruvian' && (
          <>
            <circle cx={50} cy={50} r={30} />
            <rect x={26} y={26} width={48} height={48} />
            <line x1={26} y1={26} x2={74} y2={74} strokeWidth={0.35} />
            <line x1={74} y1={26} x2={26} y2={74} strokeWidth={0.35} />
            <line x1={50} y1={20} x2={50} y2={80} strokeWidth={0.35} />
          </>
        )}
        {variant === 'gear' && (
          <>
            <circle cx={50} cy={52} r={22} />
            <circle cx={50} cy={52} r={8} />
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2
              return (
                <line
                  key={i}
                  x1={50 + Math.cos(a) * 22}
                  y1={52 + Math.sin(a) * 22}
                  x2={50 + Math.cos(a) * 28}
                  y2={52 + Math.sin(a) * 28}
                />
              )
            })}
          </>
        )}
        {variant === 'script' && scriptRows(seed).map((d, i) => <path key={i} d={d} strokeWidth={0.45} />)}
        {variant === 'force' && (
          <>
            <path d="M 18 76 L 82 76 L 82 38 Z" />
            <circle cx={58} cy={57} r={5} />
            <line x1={62} y1={61} x2={74} y2={70} />
            <path d="M 74 70 l -3 -1 l 1 3 Z" fill="currentColor" />
            <line x1={58} y1={62} x2={58} y2={74} strokeWidth={0.35} />
            <path d="M 58 74 l -1.5 -3 l 3 0 Z" fill="currentColor" />
          </>
        )}
      </g>
    </svg>
  )
}
