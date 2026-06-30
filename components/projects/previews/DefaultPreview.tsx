// components/projects/previews/DefaultPreview.tsx
'use client'

import { useEffect, useRef } from 'react'
import * as styles from './DefaultPreview.css'

type Dot = { x: number; y: number; phase: number; speed: number; radius: number }

/** Calm animated fill shown when a project has no component or image. */
export function DefaultPreview({ heroColour }: { heroColour?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const colour = heroColour ?? '#151820'
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()

    if (reduced) {
      ctx.fillStyle = colour
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    const dots: Dot[] = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
      radius: 1 + Math.random() * 1.5,
    }))

    let t = 0
    let raf = 0
    let last = 0

    const loop = (timestamp: number) => {
      if (timestamp - last < 16.67) { raf = requestAnimationFrame(loop); return }
      last = timestamp
      t += 0.005

      ctx.fillStyle = colour
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = colour + '30'
      for (const d of dots) {
        const ox = Math.sin(t * d.speed + d.phase) * 18
        const oy = Math.cos(t * d.speed * 0.7 + d.phase) * 12
        ctx.beginPath()
        ctx.arc(d.x + ox, d.y + oy, d.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [heroColour])

  return <canvas ref={canvasRef} className={styles.root} aria-hidden />
}
