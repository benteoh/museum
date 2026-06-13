// components/cursor/BoidsCanvas.tsx
'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useBoids } from '@/hooks/useBoids'
import { useCursorUpdater } from '@/hooks/useCursor'
import * as styles from './BoidsCanvas.css'

const BOID_COUNT = 120
const BOID_RADIUS = 3

// Per-group RGB — one hue per rock-paper-scissors group
const GROUP_COLORS = ['184, 212, 232', '232, 196, 184', '196, 232, 200']

export function BoidsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const lastFrameRef = useRef<number>(0)
  const { init, tick } = useBoids(BOID_COUNT)
  const setPosition = useCursorUpdater()
  const cursorRef = useRef({ x: -1, y: -1 })

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY }
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

      const boids = tick(cursorRef.current, canvas.width, canvas.height)

      for (const boid of boids) {
        ctx.beginPath()
        ctx.arc(boid.x, boid.y, BOID_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${GROUP_COLORS[boid.group] ?? GROUP_COLORS[0]}, ${boid.opacity})`
        ctx.fill()
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

  return <canvas ref={canvasRef} className={styles.canvas} />
}
