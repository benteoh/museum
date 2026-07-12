'use client'

// components/lab/VisionScene.tsx
// LAB SKETCH — the Vision: projects as glassy frames floating over the
// Florence vista, as da Vinci might have imagined them. Horizontal rail on
// vertical scroll, cloud-like bobble, water ripple on hover. Throwaway.
import { useEffect, useId, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useGallery } from '@/hooks/useGallery'
import { mulberry32, hashSeed } from '@/components/paper/tornEdge'
import { ProjectPreview } from '@/components/projects/ProjectPreview'
import type { ProjectCardData } from '@/components/projects/ProjectCard'
import { useDeviceTier } from '@/hooks/useDeviceTier'
import * as styles from './VisionScene.css'

function GlassFrame({
  project,
  isActive,
  animate,
}: {
  project: ProjectCardData
  isActive: boolean
  animate: boolean
}) {
  const rawId = useId()
  const filterId = `ripple-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const dispRef = useRef<SVGFEDisplacementMapElement>(null)
  const rafRef = useRef(0)

  // Deterministic float personality per project.
  const rand = mulberry32(hashSeed(project.slug))
  const restY = (rand() * 2 - 1) * 5 // vh — frames hover at differing heights
  const floatAmp = 1 + rand() * 1.2 // vh
  const floatDur = 5.5 + rand() * 3
  const tiltAmp = 0.5 + rand() * 0.5 // deg

  // Cursor tilt: the pane leans a few degrees toward the pointer; the
  // specular highlight leans the opposite way, as if the sun stayed put.
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const tiltSpring = { stiffness: 140, damping: 18 }
  const rotateY = useSpring(useTransform(px, [0, 1], [-3, 3]), tiltSpring)
  const rotateX = useSpring(useTransform(py, [0, 1], [2.4, -2.4]), tiltSpring)

  const onPaneMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!animate) return
    const rect = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - rect.left) / rect.width)
    py.set((e.clientY - rect.top) / rect.height)
    stir(e.clientX, e.clientY)
  }
  const onPaneLeave = () => {
    px.set(0.5)
    py.set(0.5)
    lastPosRef.current = null
  }

  // Water-ripple energy model: cursor movement inside the pane feeds the
  // displacement; it decays back to still water when the cursor rests.
  const energyRef = useRef(0)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)
  const runningRef = useRef(false)

  const pump = () => {
    if (runningRef.current) return
    runningRef.current = true
    const tick = () => {
      energyRef.current *= 0.93
      if (energyRef.current < 0.12) {
        energyRef.current = 0
        dispRef.current?.setAttribute('scale', '0')
        runningRef.current = false
        return
      }
      dispRef.current?.setAttribute('scale', energyRef.current.toFixed(2))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const stir = (x: number, y: number) => {
    const last = lastPosRef.current
    lastPosRef.current = { x, y }
    if (!last) return
    const dist = Math.hypot(x - last.x, y - last.y)
    energyRef.current = Math.min(14, energyRef.current + dist * 0.18)
    pump()
  }
  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  return (
    <motion.div
      className={styles.frameSlot}
      style={{ y: `${restY}vh` }}
      animate={
        animate
          ? {
              y: [`${restY}vh`, `${restY - floatAmp}vh`, `${restY}vh`],
              rotate: [0, tiltAmp, 0, -tiltAmp, 0],
              scale: isActive ? 1.04 : 1,
            }
          : { scale: isActive ? 1.04 : 1 }
      }
      transition={{
        y: { duration: floatDur, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: floatDur * 1.6, repeat: Infinity, ease: 'easeInOut' },
        scale: { type: 'spring', stiffness: 55, damping: 21 },
      }}
      whileHover={animate ? { scale: 1.05 } : undefined}
    >
      <svg aria-hidden className={styles.defs}>
        <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="turbulence" baseFrequency="0.012 0.02" numOctaves="2" seed={hashSeed(project.slug) % 100} result="noise">
            <animate attributeName="baseFrequency" values="0.012 0.02;0.017 0.027;0.012 0.02" dur="9s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap ref={dispRef} in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <motion.div
        className={styles.glass}
        style={{
          filter: `url(#${filterId})`,
          rotateX,
          rotateY,
          transformPerspective: 900,
        }}
        onPointerMove={onPaneMove}
        onPointerLeave={onPaneLeave}
      >
        <div className={styles.plate}>
          <ProjectPreview
            slug={project.slug}
            heroImage={project.heroImage}
            heroColour={project.heroColour}
            title={project.title}
          />
        </div>
        <div className={styles.caption}>
          <span className={styles.frameTitle}>{project.title}</span>
          <span className={styles.frameTags}>
            {project.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function VisionScene({
  sheets,
  backdropSrc,
}: {
  sheets: ProjectCardData[]
  backdropSrc?: string
}) {
  const tier = useDeviceTier()
  const { sectionRef, trackRef, x, activeIndex } = useGallery(sheets.length)
  const animate = tier === 'full'

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      style={{ height: `${(sheets.length + 1) * 100}vh` }}
    >
      <div className={styles.sticky}>
        <div className={styles.backdrop}>
          {backdropSrc && (
            // eslint-disable-next-line @next/next/no-img-element -- full-bleed generated vista
            <img className={styles.backdropImage} src={backdropSrc} alt="" />
          )}
        </div>
        <div className={styles.grounding} />
        <motion.div ref={trackRef} className={styles.track} style={{ x }}>
          {sheets.map((project, i) => (
            <GlassFrame key={project.slug} project={project} isActive={i === activeIndex} animate={animate} />
          ))}
        </motion.div>
      </div>
      <div className={styles.hint}>vision · {tier}</div>
    </section>
  )
}
