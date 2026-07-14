'use client'

import { useMemo } from 'react'
import { useDeviceTier } from '@/hooks/useDeviceTier'
import { hashSeed, mulberry32 } from '@/components/paper/tornEdge'
import { mirrorWritingLines, strokeDrawProps, STUDY_INKS, type StudyWorld } from './studyKit'
import * as styles from './PreviewStudy.css'

type Props = {
  slug: string
  heroColour?: string
  world: StudyWorld
}

function polygonStudy(seed: string) {
  const random = mulberry32(hashSeed(seed))
  const sides = 5 + Math.floor(random() * 3)
  const radius = 18 + random() * 5
  const rotation = random() * Math.PI
  return Array.from({ length: sides }, (_, index) => {
    const angle = rotation + (index / sides) * Math.PI * 2
    return `${80 + Math.cos(angle) * radius},${61 + Math.sin(angle) * radius}`
  }).join(' ')
}

export function DefaultPreview({ slug, heroColour, world }: Props) {
  const tier = useDeviceTier()
  const fullyDrawn = tier !== 'full'
  const inks = STUDY_INKS[world]
  const seed = `${slug}:${heroColour ?? 'uncoloured'}`
  const writing = useMemo(
    () => mirrorWritingLines(seed, { count: 4, top: 18, lineGap: 6, left: 20, right: 136, minWidth: 42, maxWidth: 82, wobble: 1.1 }),
    [seed],
  )
  const polygon = useMemo(() => polygonStudy(seed), [seed])

  const draw = (length: number, delay: number) => ({
    ...strokeDrawProps(length, fullyDrawn),
    className: fullyDrawn ? styles.drawnStroke : styles.drawOn,
    style: {
      '--stroke-length': length,
      animationDelay: `${delay}ms`,
    } as React.CSSProperties,
  })

  return (
    <svg
      className={`${styles.root} ${world === 'glass' ? styles.glass : ''}`}
      viewBox="0 0 160 100"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      data-study="default"
      data-study-world={world}
      data-drawn={String(fullyDrawn)}
      style={{ color: inks.primary, '--study-accent': inks.accent } as React.CSSProperties}
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <g opacity="0.25" strokeWidth="0.35">
          {Array.from({ length: 5 }, (_, index) => (
            <path key={index} data-geometry d={`M 16 ${15 + index * 7} H 144`} {...draw(130, index * 35)} />
          ))}
        </g>
        <g stroke={inks.annotation} strokeWidth="0.5" opacity="0.8">
          {writing.map((path, index) => (
            <path key={path} data-geometry d={path} {...draw(100, 170 + index * 55)} />
          ))}
        </g>
        <g stroke="var(--study-accent)">
          <rect data-geometry x="54" y="38" width="52" height="46" strokeWidth="0.65" {...draw(200, 400)} />
          <circle cx="80" cy="61" r="23" strokeWidth="0.65" {...draw(150, 480)} />
          <polygon data-geometry points={polygon} strokeWidth="0.9" {...draw(150, 560)} />
          <path data-geometry d="M 48 61 H 112 M 80 32 V 90" opacity="0.48" strokeWidth="0.4" {...draw(125, 620)} />
        </g>
      </g>
    </svg>
  )
}
