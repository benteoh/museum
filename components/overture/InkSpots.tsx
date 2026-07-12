'use client'

// components/overture/InkSpots.tsx
// Dancing ink: small iron-gall blots that drift and breathe
// over a manuscript, multiplied into the paper. Deterministic per seed.
import { useEffect, useRef } from 'react'
import { mulberry32, hashSeed } from '@/components/paper/tornEdge'
import { useDeviceTier } from '@/hooks/useDeviceTier'
import * as styles from './InkSpots.css'

// vars.color.textPrimary (#382C19) as rgb — canvas can't read CSS vars.
const INK = '56, 44, 25'

type Spot = {
  x: number
  y: number
  r: number
  phase: number
  speed: number
  drift: number
  alpha: number
}

export function InkSpots({ seed, count = 9 }: { seed: string; count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tier = useDeviceTier()

  useEffect(() => {
    if (tier !== 'full') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const rand = mulberry32(hashSeed(seed) ^ 0x9e3779b9)
    const spots: Spot[] = Array.from({ length: count }, () => ({
      x: 0.12 + rand() * 0.76,
      y: 0.15 + rand() * 0.7,
      r: 1 + rand() * 2.4,
      phase: rand() * Math.PI * 2,
      speed: 0.25 + rand() * 0.6,
      drift: 5 + rand() * 9,
      alpha: 0.1 + rand() * 0.22,
    }))

    let t = 0
    let raf = 0
    let last = 0
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (now - last < 33) return // ~30fps is plenty for ambient ink
      last = now
      t += 0.02
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const s of spots) {
        const ox = Math.sin(t * s.speed + s.phase) * s.drift
        const oy = Math.cos(t * s.speed * 0.6 + s.phase * 1.3) * s.drift * 0.7
        const breathe = 1 + 0.25 * Math.sin(t * s.speed * 1.7 + s.phase)
        const a = s.alpha * (0.7 + 0.3 * Math.sin(t * s.speed * 0.9 + s.phase * 2))
        ctx.beginPath()
        ctx.fillStyle = `rgba(${INK}, ${a})`
        ctx.arc(s.x * canvas.width + ox, s.y * canvas.height + oy, s.r * breathe, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [seed, count, tier])

  return <canvas ref={canvasRef} className={styles.root} aria-hidden />
}
