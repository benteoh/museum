// components/projects/previews/SkyhivePreview.tsx
'use client'

import { useEffect, useRef } from 'react'

type Cube = { x: number; y: number; size: number; speed: number }

const BG = '#0d1520'

function drawIsoCube(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, op: number) {
  const h = s * 0.5
  // Top face
  ctx.beginPath()
  ctx.moveTo(cx, cy - h)
  ctx.lineTo(cx + s, cy)
  ctx.lineTo(cx, cy + h)
  ctx.lineTo(cx - s, cy)
  ctx.closePath()
  ctx.fillStyle = `rgba(74,127,160,${op})`
  ctx.fill()
  // Left face
  ctx.beginPath()
  ctx.moveTo(cx - s, cy)
  ctx.lineTo(cx, cy + h)
  ctx.lineTo(cx, cy + h + s)
  ctx.lineTo(cx - s, cy + s)
  ctx.closePath()
  ctx.fillStyle = `rgba(26,47,74,${op})`
  ctx.fill()
  // Right face
  ctx.beginPath()
  ctx.moveTo(cx + s, cy)
  ctx.lineTo(cx, cy + h)
  ctx.lineTo(cx, cy + h + s)
  ctx.lineTo(cx + s, cy + s)
  ctx.closePath()
  ctx.fillStyle = `rgba(47,74,107,${op})`
  ctx.fill()
}

function makeCube(canvasWidth: number, canvasHeight: number): Cube {
  return {
    x: Math.random() * canvasWidth,
    y: canvasHeight + Math.random() * canvasHeight,
    size: 8 + Math.random() * 10,
    speed: 0.2 + Math.random() * 0.4,
  }
}

export function SkyhivePreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()

    const cubes: Cube[] = Array.from({ length: 12 }, () => makeCube(canvas.width, canvas.height))
    // Scatter initial y so they don't all start off-screen
    for (const c of cubes) { c.y = Math.random() * canvas.height }

    if (reduced) {
      ctx.fillStyle = BG
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      const sorted = [...cubes].sort((a, b) => a.y - b.y)
      for (const c of sorted) drawIsoCube(ctx, c.x, c.y, c.size, 0.5)
      return
    }

    let raf = 0
    let last = 0

    const loop = (timestamp: number) => {
      if (timestamp - last < 16.67) { raf = requestAnimationFrame(loop); return }
      last = timestamp

      ctx.fillStyle = BG
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (const c of cubes) {
        c.y -= c.speed
        if (c.y + c.size * 2 < 0) {
          c.x = Math.random() * canvas.width
          c.y = canvas.height + c.size
          c.size = 8 + Math.random() * 10
          c.speed = 0.2 + Math.random() * 0.4
        }
      }

      // Sort back-to-front (higher y = drawn later = in front)
      const sorted = [...cubes].sort((a, b) => a.y - b.y)
      for (const c of sorted) drawIsoCube(ctx, c.x, c.y, c.size, 0.6)

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
