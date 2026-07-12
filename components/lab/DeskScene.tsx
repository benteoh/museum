'use client'

// components/lab/DeskScene.tsx
// LAB SKETCH — the Overture: huge decorative da Vinci-style manuscripts
// layered over the desk, overflowing the viewport, pulling apart as you
// scroll to physically reveal the title inked beneath. The sheets are set
// dressing — they link to nothing.
//
// The project gallery that follows lives in VisionScene (glass frames over
// the Florence vista — see 2026-07-11-vision-gallery-design.md). The old
// pile-shuffle gallery this scene once contained is retired.
import { useRef } from 'react'
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { TornSheet } from '@/components/paper/TornSheet'
import { useDeviceTier } from '@/hooks/useDeviceTier'
import { InkSpots } from './InkSpots'
import { StudyDrawing, type StudyVariant } from './StudyDrawing'
import * as styles from './DeskScene.css'

// Viewports of scroll the parting occupies, plus one settled rest viewport.
const OVERTURE_UNITS = 2.5
const REST_UNITS = 1
// Locked spring range from the brief: stiffness 40-70, damping 18-24.
const SETTLE_SPRING = { type: 'spring', stiffness: 48, damping: 19 } as const
// All generated scans are 16:10 per the asset prompt pack.
const SHEET_ASPECT = '16 / 10'

export type OvertureAssets = Partial<Record<string, string>>

type OvertureConfig = {
  seed: string
  variant: StudyVariant
  /** Width with a vh clamp; height derives from the locked aspect so the
   * paper never stretches with the browser window. */
  w: string
  home: { dx: number; dy: number; rotate: number } // vw / vh / deg
  away: { dx: number; dy: number; rotate: number }
  /** progress range over which this sheet departs (top sheets leave first) */
  range: [number, number]
}

// Layered back-to-front; later entries render on top and depart earlier.
const OVERTURE_SHEETS: OvertureConfig[] = [
  { seed: 'codex-atlanticus', variant: 'script',    w: 'min(88vw, 141vh)', home: { dx: -4, dy: 5, rotate: -5 },  away: { dx: -95, dy: 25, rotate: -14 }, range: [0.42, 0.95] },
  { seed: 'codex-leicester',  variant: 'gear',      w: 'min(76vw, 134vh)', home: { dx: 7, dy: -3, rotate: 6 },   away: { dx: 90, dy: -40, rotate: 15 },  range: [0.32, 0.85] },
  { seed: 'codex-windsor',    variant: 'vitruvian', w: 'min(72vw, 125vh)', home: { dx: -6, dy: -5, rotate: 3 },  away: { dx: -80, dy: -55, rotate: -9 }, range: [0.2, 0.72] },
  { seed: 'codex-turin',      variant: 'force',     w: 'min(66vw, 115vh)', home: { dx: 8, dy: 6, rotate: -7 },   away: { dx: 85, dy: 60, rotate: -18 },  range: [0.1, 0.6] },
  { seed: 'codex-flight',     variant: 'wing',      w: 'min(64vw, 106vh)', home: { dx: 0, dy: 0, rotate: 4 },    away: { dx: 20, dy: -95, rotate: 12 },  range: [0.02, 0.48] },
]

function OvertureSheet({
  config,
  progress,
  src,
  settleDelay,
  animateEntrance,
}: {
  config: OvertureConfig
  progress: MotionValue<number>
  src?: string
  settleDelay: number
  animateEntrance: boolean
}) {
  const { home, away, range } = config
  const x = useTransform(progress, range, [`${home.dx}vw`, `${away.dx}vw`])
  const y = useTransform(progress, range, [`${home.dy}vh`, `${away.dy}vh`])
  const rotate = useTransform(progress, range, [home.rotate, away.rotate])

  return (
    <motion.div
      className={styles.sheetAnchor}
      style={{ width: config.w, aspectRatio: SHEET_ASPECT, x, y, rotate }}
    >
      {/* Entrance settle — separate layer so it composes with scroll transforms. */}
      <motion.div
        style={{ width: '100%', height: '100%' }}
        initial={animateEntrance ? { opacity: 0, y: '-4vh', scale: 1.04 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={animateEntrance ? { ...SETTLE_SPRING, delay: settleDelay } : { duration: 0 }}
      >
        <div className={styles.sheetCenter}>
          <TornSheet
            seed={config.seed}
            rim={
              src ? (
                // eslint-disable-next-line @next/next/no-img-element -- fibre layer reuses the already-loaded scan
                <img className={styles.rimImage} src={src} alt="" />
              ) : undefined
            }
          >
            <div className={styles.sheetBody}>
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element -- full-bleed scan under a clip path
                <img className={styles.sheetImage} src={src} alt="" />
              ) : (
                <StudyDrawing variant={config.variant} seed={config.seed} />
              )}
              <InkSpots seed={config.seed} count={5} />
            </div>
          </TornSheet>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function DeskScene({
  title,
  curatorNote,
  assets = {},
}: {
  title: string
  curatorNote: string
  assets?: OvertureAssets
}) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const tier = useDeviceTier()
  const units = OVERTURE_UNITS + REST_UNITS

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  // Sprung at full tier so the parting reads as paper with mass rather than
  // a scrubbed video. Scroll-linked motion is user-driven, so reduced tiers
  // keep the direct mapping rather than dropping the effect.
  const overtureRaw = useTransform(scrollYProgress, [0, OVERTURE_UNITS / units], [0, 1])
  const overtureSprung = useSpring(overtureRaw, { stiffness: 60, damping: 22 })
  const overtureProgress = tier === 'full' ? overtureSprung : overtureRaw

  const animateEntrance = tier === 'full'

  return (
    <section ref={sectionRef} className={styles.section} style={{ height: `${(units + 1) * 100}vh` }}>
      <div className={styles.sticky}>
        {/* Entrance breath: the whole desk eases in from a touch of extra zoom. */}
        <motion.div
          className={styles.desk}
          initial={animateEntrance ? { scale: 1.035 } : false}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Inked on the desk — physically revealed as the papers part. */}
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.curatorNote}>{curatorNote}</p>

          {OVERTURE_SHEETS.map((config, i) => (
            <div key={config.seed} className={styles.sheetLayer} style={{ zIndex: 10 + i }}>
              <OvertureSheet
                config={config}
                progress={overtureProgress}
                src={assets[config.seed]}
                settleDelay={0.12 + i * 0.13}
                animateEntrance={animateEntrance}
              />
            </div>
          ))}
        </motion.div>
      </div>

      <div className={styles.hint}>overture · {tier}</div>
    </section>
  )
}
