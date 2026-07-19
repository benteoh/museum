// components/cursor/BoidsCanvas.tsx
'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useBoids, type Boid } from '@/hooks/useBoids'
import { useCursorUpdater } from '@/hooks/useCursor'
import { useSceneStore, type SceneName } from '@/hooks/useScene'
import * as styles from './BoidsCanvas.css'

const BOID_COUNT = 120
const BOID_RADIUS = 3
const IDLE_MS = 3000
// Mirrors hooks/useBoids.ts's internal MAX_SPEED (not exported) — used only
// to normalize speed for the squash-and-stretch stretch factor below.
const MAX_SPEED = 2.8

// ——— Liquid-ink renderer ————————————————————————————————————————————————
// 'goo' renders soft ink droplets fused by an SVG goo filter; 'circles' is
// the legacy renderer, kept switchable for reference.
type RenderMode = 'circles' | 'goo'
const RENDER_MODE: RenderMode = 'goo'
// Pre-threshold blur, CSS px. Bigger = droplets reach further before fusing,
// but too big culls isolated droplets: blur must stay well under the sprite
// radius or a lone boid's peak alpha lands below the threshold cutoff.
const GOO_BLUR = 4.5
// Soft droplet sprite: larger than the legacy dot so gradients overlap and
// the threshold has something to fuse.
const SPRITE_RADIUS = BOID_RADIUS * 3.4
// Velocity squash-and-stretch: fast boids become ink flicks.
const STRETCH = 0.9

// One ink tone per scene for the goo pass — the alpha threshold fuses
// per-colour, so the three group hues collapse to a single ink (mirrors
// textPrimary on paper, the existing dusk glow tone on desk/vista). Groups
// keep depth via the alpha variance below, which the threshold turns into
// size variance.
const INK_TONES: Record<SceneName, string> = {
  paper: '56, 44, 25',
  desk: '230, 220, 196',
  vista: '230, 220, 196',
}
// Wider spread than the legacy palette variance: the threshold converts
// alpha into droplet size, so this is the flock's size diversity.
const GROUP_ALPHA = [1, 0.8, 0.62]

// Per-group RGB for the legacy circle renderer, keyed by scene (documented
// token-mirror exception — see INK_TONES above for the goo equivalent).
const SCENE_COLORS: Record<SceneName, string[]> = {
  paper: ['56, 44, 25', '140, 79, 50', '122, 95, 56'],
  desk: ['230, 220, 196', '216, 155, 84', '255, 236, 190'],
  vista: ['230, 220, 196', '216, 155, 84', '255, 236, 190'],
}

function buildCircleTargets(
  count: number,
  cx: number,
  cy: number,
  r: number
): Array<{ x: number; y: number }> {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r }
  })
}

// Soft radial droplet: opaque ink core feathering to nothing. The goo
// threshold re-hardens the union of these into liquid edges.
function makeDropletSprite(rgb: string): HTMLCanvasElement {
  const r = SPRITE_RADIUS
  const size = Math.ceil(r * 2)
  const sprite = document.createElement('canvas')
  sprite.width = size
  sprite.height = size
  const g = sprite.getContext('2d')!
  const grad = g.createRadialGradient(r, r, 0, r, r, r)
  grad.addColorStop(0, `rgba(${rgb}, 1)`)
  grad.addColorStop(0.55, `rgba(${rgb}, 0.8)`)
  grad.addColorStop(1, `rgba(${rgb}, 0)`)
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  return sprite
}

function drawGoo(ctx: CanvasRenderingContext2D, boids: Boid[], sprite: HTMLCanvasElement) {
  for (const boid of boids) {
    const speed = Math.hypot(boid.vx, boid.vy)
    const stretch = 1 + (speed / MAX_SPEED) * STRETCH
    // The threshold kills sub-cutoff alpha, so per-boid liveliness maps to
    // droplet size instead of transparency.
    const base = 0.55 + boid.opacity * 0.6

    ctx.save()
    ctx.translate(boid.x, boid.y)
    if (speed > 0.05) ctx.rotate(Math.atan2(boid.vy, boid.vx))
    ctx.scale(base * stretch, base / stretch)
    ctx.globalAlpha = GROUP_ALPHA[boid.group] ?? 1
    ctx.drawImage(sprite, -SPRITE_RADIUS, -SPRITE_RADIUS)
    ctx.restore()
  }
  ctx.globalAlpha = 1
}

function drawCircles(
  ctx: CanvasRenderingContext2D,
  boids: Boid[],
  prev: Array<{ x: number; y: number; group: number }>,
  palette: string[]
) {
  // Ghost trail — previous frame positions at low opacity. Goo mode cuts
  // this pass: 0.08 alpha sits far below the threshold cutoff (invisible).
  for (const p of prev) {
    ctx.beginPath()
    ctx.arc(p.x, p.y, BOID_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${palette[p.group] ?? palette[0]}, 0.08)`
    ctx.fill()
  }
  for (const boid of boids) {
    ctx.beginPath()
    ctx.arc(boid.x, boid.y, BOID_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${palette[boid.group] ?? palette[0]}, ${boid.opacity})`
    ctx.fill()
  }
}

export function BoidsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const lastFrameRef = useRef<number>(0)
  const lastMoveRef = useRef<number>(0)
  const prevBoidsRef = useRef<Array<{ x: number; y: number; group: number }>>([])
  const spritesRef = useRef<Partial<Record<SceneName, HTMLCanvasElement>>>({})
  const { init, tick } = useBoids(BOID_COUNT)
  const setPosition = useCursorUpdater()
  const cursorRef = useRef({ x: -1, y: -1 })

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY }
      lastMoveRef.current = Date.now()
      setPosition(e.clientX, e.clientY)
    },
    [setPosition]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    init(canvas.width, canvas.height)
    lastMoveRef.current = Date.now()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)

    const loop = (timestamp: number) => {
      if (document.hidden) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      // Cap at 60fps
      if (timestamp - lastFrameRef.current < 16.67) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }
      lastFrameRef.current = timestamp

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const scene = useSceneStore.getState().scene

      const isIdle = Date.now() - lastMoveRef.current > IDLE_MS
      const formationTargets = isIdle
        ? buildCircleTargets(
            BOID_COUNT,
            canvas.width / 2,
            canvas.height / 2,
            Math.min(canvas.width, canvas.height) * 0.3
          )
        : undefined

      const boids = tick(cursorRef.current, canvas.width, canvas.height, formationTargets)

      if (RENDER_MODE === 'goo') {
        const sprite = (spritesRef.current[scene] ??= makeDropletSprite(INK_TONES[scene]))
        drawGoo(ctx, boids, sprite)
      } else {
        drawCircles(ctx, boids, prevBoidsRef.current, SCENE_COLORS[scene])
        prevBoidsRef.current = boids.map((b) => ({ x: b.x, y: b.y, group: b.group }))
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [init, tick, handleMouseMove])

  return (
    <>
      {RENDER_MODE === 'goo' && (
        <svg className={styles.gooDefs} aria-hidden>
          <defs>
            <filter id="boids-goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation={GOO_BLUR} result="blur" />
              {/* Alpha threshold: 22a − 8 → cutoff ≈ 0.36, hard by ≈ 0.41.
                  The slope keeps a hint of feather so the ink edge stays
                  organic rather than vector-crisp. */}
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -8"
              />
            </filter>
          </defs>
        </svg>
      )}
      <canvas
        ref={canvasRef}
        className={RENDER_MODE === 'goo' ? styles.gooCanvas : styles.canvas}
      />
    </>
  )
}
