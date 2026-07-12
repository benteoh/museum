'use client'

// components/vision/VisionScene.tsx
// The Vision — projects as glassy frames floating over the golden-hour
// Florence vista, as da Vinci might have imagined them. A horizontal rail on
// vertical scroll at desktop; a vertical stack below 640px. Cursor movement
// feeds a water ripple across each pane — the scene's one signature
// interaction. Every frame links to its project's detail page; the curator's
// hand-note lives here, over the vista.
import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useGallery } from '@/hooks/useGallery'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { mulberry32, hashSeed } from '@/components/paper/tornEdge'
import { ProjectPreview } from '@/components/projects/ProjectPreview'
import type { ProjectCardData } from '@/components/projects/ProjectCard'
import { useDeviceTier } from '@/hooks/useDeviceTier'
import * as styles from './VisionScene.css'

const MOBILE_QUERY = '(max-width: 640px)'
// A tap injects the ripple energy of a brisk cursor pass, so touch gets the
// signature interaction as activation feedback rather than losing it.
const TAP_RIPPLE_ENERGY = 7

function GlassFrame({
  project,
  isActive,
  animate,
  tilt,
  float,
  onHoverChange,
}: {
  project: ProjectCardData
  isActive: boolean
  /** ripple + hover/tap response (full tier only) */
  animate: boolean
  /** cursor tilt — off for touch layouts */
  tilt: boolean
  /** rest-height offset + idle bobble — off when the scene must sit still */
  float: boolean
  onHoverChange?: (hovered: boolean) => void
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
  const baseY = float ? restY : 0

  // Cursor tilt: the pane leans a few degrees toward the pointer; the
  // specular highlight leans the opposite way, as if the sun stayed put.
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const tiltSpring = { stiffness: 140, damping: 18 }
  const rotateY = useSpring(useTransform(px, [0, 1], [-3, 3]), tiltSpring)
  const rotateX = useSpring(useTransform(py, [0, 1], [2.4, -2.4]), tiltSpring)

  const onPaneMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!animate) return
    if (tilt) {
      const rect = e.currentTarget.getBoundingClientRect()
      px.set((e.clientX - rect.left) / rect.width)
      py.set((e.clientY - rect.top) / rect.height)
    }
    stir(e.clientX, e.clientY)
  }
  const onPaneLeave = () => {
    px.set(0.5)
    py.set(0.5)
    lastPosRef.current = null
  }
  // Tap feedback: the ripple washes the pane as the link activates — it must
  // never block or delay the navigation itself.
  const onPaneDown = () => {
    if (!animate) return
    energyRef.current = Math.min(14, energyRef.current + TAP_RIPPLE_ENERGY)
    pump()
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
      style={{ y: `${baseY}vh` }}
      animate={
        float
          ? {
              y: [`${baseY}vh`, `${baseY - floatAmp}vh`, `${baseY}vh`],
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
      whileTap={animate ? { scale: 0.97 } : undefined}
    >
      <svg aria-hidden className={styles.defs}>
        <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="turbulence" baseFrequency="0.012 0.02" numOctaves="2" seed={hashSeed(project.slug) % 100} result="noise">
            <animate attributeName="baseFrequency" values="0.012 0.02;0.017 0.027;0.012 0.02" dur="9s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap ref={dispRef} in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <Link
        href={`/projects/${project.slug}`}
        className={styles.paneLink}
        style={{ viewTransitionName: `panel-${project.slug}` } as React.CSSProperties}
        onPointerEnter={() => onHoverChange?.(true)}
        onPointerLeave={() => onHoverChange?.(false)}
        onFocus={() => onHoverChange?.(true)}
        onBlur={() => onHoverChange?.(false)}
      >
        <motion.div
          className={styles.glass}
          style={
            tilt
              ? { filter: `url(#${filterId})`, rotateX, rotateY, transformPerspective: 900 }
              : { filter: `url(#${filterId})` }
          }
          onPointerMove={onPaneMove}
          onPointerLeave={onPaneLeave}
          onPointerDown={onPaneDown}
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
      </Link>
    </motion.div>
  )
}

function Backdrop({ src }: { src?: string }) {
  return (
    <div className={styles.backdrop}>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element -- full-bleed generated vista
        <img className={styles.backdropImage} src={src} alt="" />
      )}
    </div>
  )
}

function CuratorNote({ note, dimmed }: { note: string; dimmed: boolean }) {
  return (
    <motion.p
      className={styles.curatorNote}
      animate={{ opacity: dimmed ? 0.3 : 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {note}
    </motion.p>
  )
}

export function VisionScene({
  projects,
  curatorNote,
  backdropSrc,
}: {
  projects: ProjectCardData[]
  curatorNote: string
  backdropSrc?: string
}) {
  const tier = useDeviceTier()
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const { sectionRef, trackRef, x, activeIndex } = useGallery(projects.length)
  const [paneHovered, setPaneHovered] = useState(false)
  const animate = tier === 'full'

  // Settled end state: the vista with a quiet grid of panes. No pin, no
  // motion — the composition the rail would come to rest on.
  if (tier === 'static') {
    return (
      <section className={styles.staticSection}>
        <Backdrop src={backdropSrc} />
        <div className={styles.grounding} />
        <div className={styles.staticGrid}>
          {projects.map((project) => (
            <GlassFrame key={project.slug} project={project} isActive={false} animate={false} tilt={false} float={false} />
          ))}
        </div>
        <CuratorNote note={curatorNote} dimmed={false} />
      </section>
    )
  }

  // Adapted, not reduced: below 640px the rail becomes a vertical stack on
  // native scroll — the vista holds behind it, tap feeds the ripple, no tilt.
  if (isMobile) {
    return (
      <section className={styles.stackSection}>
        <div className={styles.stackBackdropHolder}>
          <div className={styles.stackBackdrop}>
            <Backdrop src={backdropSrc} />
            <div className={styles.grounding} />
          </div>
        </div>
        <div className={styles.stackContent}>
          <p className={styles.curatorNoteStack}>{curatorNote}</p>
          {projects.map((project) => (
            <GlassFrame
              key={project.slug}
              project={project}
              isActive={false}
              animate={animate}
              tilt={false}
              float={animate}
            />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      style={{ height: `${(projects.length + 1) * 100}vh` }}
    >
      <div className={styles.sticky}>
        <Backdrop src={backdropSrc} />
        <div className={styles.grounding} />
        <motion.div ref={trackRef} className={styles.track} style={{ x }}>
          {projects.map((project, i) => (
            <GlassFrame
              key={project.slug}
              project={project}
              isActive={i === activeIndex}
              animate={animate}
              tilt={animate}
              float={animate}
              onHoverChange={setPaneHovered}
            />
          ))}
        </motion.div>
        <CuratorNote note={curatorNote} dimmed={paneHovered} />
      </div>
    </section>
  )
}
