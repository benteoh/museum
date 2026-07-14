'use client'

import { useDeviceTier } from '@/hooks/useDeviceTier'
import { forceArrowGeometry, strokeDrawProps, STUDY_INKS, type StudyWorld } from './studyKit'
import * as styles from './PreviewStudy.css'

type Cube = { cx: number; cy: number; size: number }

const CUBES: Cube[] = [
  { cx: 57, cy: 38, size: 14 },
  { cx: 85, cy: 52, size: 14 },
  { cx: 57, cy: 66, size: 14 },
  { cx: 113, cy: 38, size: 14 },
]

function cubeGeometry({ cx, cy, size }: Cube) {
  const half = size / 2
  return {
    top: `${cx},${cy - half} ${cx + size},${cy} ${cx},${cy + half} ${cx - size},${cy}`,
    left: `${cx - size},${cy} ${cx},${cy + half} ${cx},${cy + half + size} ${cx - size},${cy + size}`,
    right: `${cx + size},${cy} ${cx},${cy + half} ${cx},${cy + half + size} ${cx + size},${cy + size}`,
  }
}

const DIMENSION = forceArrowGeometry(36, 88, 132, 88, 2.5)

export function SkyhivePreview({ world }: { world: StudyWorld }) {
  const tier = useDeviceTier()
  const fullyDrawn = tier !== 'full'
  const inks = STUDY_INKS[world]

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
      data-study="skyhive"
      data-study-world={world}
      data-drawn={String(fullyDrawn)}
      style={{ color: inks.primary, '--study-accent': inks.accent } as React.CSSProperties}
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path data-geometry d="M 20 76 L 80 16 L 140 76 M 22 24 H 138 M 80 10 V 92" opacity="0.3" strokeWidth="0.4" {...draw(310, 0)} />
        {CUBES.map((cube, index) => {
          const paths = cubeGeometry(cube)
          const moving = tier === 'full' && index === 3
          return (
            <g key={paths.top} className={moving ? styles.assembling : undefined}>
              <polygon data-geometry points={paths.top} {...draw(65, 100 + index * 80)} />
              <polygon data-geometry points={paths.left} {...draw(70, 140 + index * 80)} />
              <polygon data-geometry points={paths.right} {...draw(70, 180 + index * 80)} />
            </g>
          )
        })}
        <g stroke="var(--study-accent)" strokeWidth="0.45" opacity="0.8">
          {Array.from({ length: 7 }, (_, index) => (
            <path key={index} data-geometry d={`M ${45 + index * 4} 72 L ${61 + index * 4} 80`} {...draw(25, 520 + index * 25)} />
          ))}
          <path data-geometry d={DIMENSION.shaftPath} {...draw(100, 620)} />
          <path data-geometry d={DIMENSION.headPath} fill="var(--study-accent)" {...draw(16, 650)} />
          <path data-geometry d="M 36 84 V 92 M 132 84 V 92" {...draw(20, 650)} />
        </g>
      </g>
    </svg>
  )
}
