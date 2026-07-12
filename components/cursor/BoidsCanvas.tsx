// components/cursor/BoidsCanvas.tsx
'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useBoids } from '@/hooks/useBoids'
import { useCursorUpdater } from '@/hooks/useCursor'
import { useSceneStore, type SceneName } from '@/hooks/useScene'
import * as styles from './BoidsCanvas.css'

const BOID_COUNT = 120
const BOID_RADIUS = 3
const IDLE_MS = 3000

// Per-group RGB, one hue per rock-paper-scissors group, keyed by scene.
// Canvas fillStyle strings mirror tokens (documented exception): the paper
// world writes in iron-gall ink (textPrimary / accent / monoTag); the dusk
// scenes glint warm (duskText / duskTorch / a sun-glow sampled from the
// vista still). The swap happens while the canvas is faded out, so the
// motes simply *return* in the new world's material.
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

export function BoidsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const lastFrameRef = useRef<number>(0)
  const lastMoveRef = useRef<number>(0)
  const prevBoidsRef = useRef<Array<{ x: number; y: number; group: number }>>([])
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

      const palette = SCENE_COLORS[useSceneStore.getState().scene]

      // Ghost trail — previous frame positions at low opacity
      for (const prev of prevBoidsRef.current) {
        ctx.beginPath()
        ctx.arc(prev.x, prev.y, BOID_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${palette[prev.group] ?? palette[0]}, 0.08)`
        ctx.fill()
      }

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

      prevBoidsRef.current = boids.map((b) => ({ x: b.x, y: b.y, group: b.group }))

      for (const boid of boids) {
        ctx.beginPath()
        ctx.arc(boid.x, boid.y, BOID_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${palette[boid.group] ?? palette[0]}, ${boid.opacity})`
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
