'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useDeviceTier } from '@/hooks/useDeviceTier'
import { hashSeed, mulberry32 } from '@/components/paper/tornEdge'
import { createParticles, tick, type Particle } from './boidsMath'
import { mirrorWritingLines, strokeDrawProps, STUDY_INKS, type StudyWorld } from './studyKit'
import * as styles from './PreviewStudy.css'

const VISITOR_COUNT = 6
const VISITOR_WIDTH = 100
const VISITOR_HEIGHT = 34
const VISITOR_OFFSET = { x: 30, y: 50 }
const ENTRANCE_SETTLE_MS = 1500

function seededExhibits() {
  const random = mulberry32(hashSeed('museum-of-little-things:exhibits'))
  return Array.from({ length: 5 }, (_, index) => ({
    x: 38 + index * 18 + (random() - 0.5) * 3,
    y: 55 + (random() - 0.5) * 5,
    radius: 1.5 + random() * 1.2,
  }))
}

const EXHIBITS = seededExhibits()
const CAPTIONS = mirrorWritingLines('museum-of-little-things:captions', {
  count: 3,
  top: 18,
  lineGap: 5,
  left: 94,
  right: 146,
  minWidth: 25,
  maxWidth: 45,
  wobble: 1.2,
})

export function MuseumOfLittleThingsPreview({ world }: { world: StudyWorld }) {
  const tier = useDeviceTier()
  const fullyDrawn = tier !== 'full'
  const inks = STUDY_INKS[world]
  const visitorRefs = useRef<Array<SVGCircleElement | null>>([])
  const initialVisitors = useMemo(
    () => createParticles(VISITOR_COUNT, VISITOR_WIDTH, VISITOR_HEIGHT, mulberry32(hashSeed('museum-visitors'))),
    [],
  )

  useEffect(() => {
    if (tier !== 'full') return

    let particles: Particle[] = initialVisitors.map((particle) => ({ ...particle }))
    let frame = 0
    let intersecting = false
    let entranceComplete = false
    let entranceTimer = 0

    const stop = () => {
      if (!frame) return
      cancelAnimationFrame(frame)
      frame = 0
    }
    const clearEntranceTimer = () => {
      if (!entranceTimer) return
      window.clearTimeout(entranceTimer)
      entranceTimer = 0
    }
    const paint = () => {
      particles = tick(particles, VISITOR_WIDTH, VISITOR_HEIGHT, {
        maxSpeed: 0.08,
        maxForce: 0.004,
      })
      particles.forEach((particle, index) => {
        visitorRefs.current[index]?.setAttribute('cx', String(particle.x + VISITOR_OFFSET.x))
        visitorRefs.current[index]?.setAttribute('cy', String(particle.y + VISITOR_OFFSET.y))
      })
      frame = requestAnimationFrame(paint)
    }
    const sync = () => {
      if (intersecting && !document.hidden) {
        if (frame || entranceTimer) return
        if (entranceComplete) {
          frame = requestAnimationFrame(paint)
          return
        }
        entranceTimer = window.setTimeout(() => {
          entranceTimer = 0
          entranceComplete = true
          if (intersecting && !document.hidden && !frame) {
            frame = requestAnimationFrame(paint)
          }
        }, ENTRANCE_SETTLE_MS)
      } else {
        clearEntranceTimer()
        stop()
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting
      sync()
    })
    const svg = visitorRefs.current[0]?.ownerSVGElement
    if (svg) observer.observe(svg)
    document.addEventListener('visibilitychange', sync)

    return () => {
      clearEntranceTimer()
      stop()
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [initialVisitors, tier])

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
      data-study="museum"
      data-study-world={world}
      data-drawn={String(fullyDrawn)}
      style={{ color: inks.primary, '--study-accent': inks.accent } as React.CSSProperties}
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path data-geometry d="M 22 76 H 138 M 30 76 V 45 H 130 V 76 M 38 45 V 34 H 122 V 45" strokeWidth="1.1" {...draw(240, 0)} />
        <path data-geometry d="M 48 45 V 39 Q 80 10 112 39 V 45 M 80 18 V 76" strokeWidth="0.7" {...draw(160, 90)} />
        <path data-geometry d="M 30 82 H 130 M 35 87 H 125" strokeWidth="0.45" opacity="0.55" {...draw(190, 180)} />
        {EXHIBITS.map((exhibit, index) => (
          <g key={index}>
            <path data-geometry d={`M ${exhibit.x - 4} 67 H ${exhibit.x + 4} V 72 H ${exhibit.x - 4} Z`} strokeWidth="0.55" {...draw(32, 230 + index * 35)} />
            <circle cx={exhibit.x} cy={exhibit.y} r={exhibit.radius} stroke="var(--study-accent)" strokeWidth="0.7" fill="none" />
          </g>
        ))}
        <path data-geometry d="M 112 34 L 139 24 M 107 56 L 143 45 M 103 68 L 140 68" stroke="var(--study-accent)" strokeWidth="0.45" {...draw(115, 400)} />
        <g stroke={inks.annotation} strokeWidth="0.5" opacity="0.82">
          {CAPTIONS.map((path, index) => (
            <path key={path} data-geometry d={path} {...draw(70, 470 + index * 50)} />
          ))}
        </g>
      </g>
      <g fill={inks.accent} opacity={world === 'glass' ? 0.72 : 0.52}>
        {initialVisitors.map((particle, index) => (
          <circle
            key={index}
            ref={(node) => { visitorRefs.current[index] = node }}
            cx={particle.x + VISITOR_OFFSET.x}
            cy={particle.y + VISITOR_OFFSET.y}
            r="1.05"
          />
        ))}
      </g>
    </svg>
  )
}
