// components/projects/previews/MuseumOfLittleThingsPreview.tsx
'use client'

import { useEffect, useRef } from 'react'
import { createParticles, tick } from './boidsMath'
import type { Particle } from './boidsMath'

const ACCENT = '#B8D4E8'
const COUNT = 18

export function MuseumOfLittleThingsPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let particles: Particle[] = []

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      particles = createParticles(COUNT, canvas.width, canvas.height)
    }
    resize()

    if (reduced) {
      ctx.fillStyle = '#151820'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = ACCENT + '50'
        ctx.fill()
      }
      return
    }

    let raf = 0
    let last = 0

    const loop = (timestamp: number) => {
      if (timestamp - last < 16.67) { raf = requestAnimationFrame(loop); return }
      last = timestamp

      particles = tick(particles, canvas.width, canvas.height)

      ctx.fillStyle = '#15182099'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = ACCENT + '50'
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
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
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-hidden
    />
  )
}
