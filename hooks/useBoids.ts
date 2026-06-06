// hooks/useBoids.ts
'use client'

import { useRef, useCallback } from 'react'

const PERCEPTION_RADIUS = 80
const SEPARATION_RADIUS = 30
const DISRUPTION_RADIUS = 80
const MAX_SPEED = 2
const MAX_FORCE = 0.05

export type Boid = {
  x: number
  y: number
  vx: number
  vy: number
  opacity: number
}

export type CursorPos = { x: number; y: number }

export function createBoid(width: number, height: number): Boid {
  const angle = Math.random() * Math.PI * 2
  const speed = 0.5 + Math.random() * 1.5
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    opacity: 0.2,
  }
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2)
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

export function applyBoidRules(
  boid: Boid,
  all: Boid[],
  cursor: CursorPos
): { dx: number; dy: number; opacity: number } {
  let cohX = 0, cohY = 0, cohCount = 0
  let sepX = 0, sepY = 0
  let aliVx = 0, aliVy = 0, aliCount = 0

  for (const other of all) {
    if (other === boid) continue
    const d = dist(boid.x, boid.y, other.x, other.y)

    if (d < PERCEPTION_RADIUS) {
      cohX += other.x
      cohY += other.y
      cohCount++

      aliVx += other.vx
      aliVy += other.vy
      aliCount++
    }

    if (d < SEPARATION_RADIUS && d > 0) {
      sepX += (boid.x - other.x) / d
      sepY += (boid.y - other.y) / d
    }
  }

  let dx = 0
  let dy = 0

  // Cohesion
  if (cohCount > 0) {
    const targetX = cohX / cohCount - boid.x
    const targetY = cohY / cohCount - boid.y
    dx += targetX * 0.0005
    dy += targetY * 0.0005
  }

  // Separation
  dx += sepX * 0.05
  dy += sepY * 0.05

  // Alignment
  if (aliCount > 0) {
    dx += (aliVx / aliCount - boid.vx) * 0.05
    dy += (aliVy / aliCount - boid.vy) * 0.05
  }

  // Cursor disruption
  const cursorDist = dist(boid.x, boid.y, cursor.x, cursor.y)
  let targetOpacity = 0.2

  if (cursor.x >= 0 && cursor.y >= 0 && cursorDist < DISRUPTION_RADIUS) {
    const force = (1 - cursorDist / DISRUPTION_RADIUS) * 0.3
    if (cursorDist > 0) {
      dx += ((boid.x - cursor.x) / cursorDist) * force
      dy += ((boid.y - cursor.y) / cursorDist) * force
    }
    targetOpacity = 0.6
  }

  // Clamp forces
  dx = clamp(dx, -MAX_FORCE, MAX_FORCE)
  dy = clamp(dy, -MAX_FORCE, MAX_FORCE)

  return { dx, dy, opacity: targetOpacity }
}

export function updateBoids(
  boids: Boid[],
  cursor: CursorPos,
  width: number,
  height: number
): Boid[] {
  return boids.map((boid) => {
    const { dx, dy, opacity } = applyBoidRules(boid, boids, cursor)

    let vx = boid.vx + dx
    let vy = boid.vy + dy

    // Clamp to max speed
    const speed = Math.sqrt(vx ** 2 + vy ** 2)
    if (speed > MAX_SPEED) {
      vx = (vx / speed) * MAX_SPEED
      vy = (vy / speed) * MAX_SPEED
    }

    let x = boid.x + vx
    let y = boid.y + vy

    // Wrap around edges
    if (x < 0) x += width
    if (x > width) x -= width
    if (y < 0) y += height
    if (y > height) y -= height

    // Lerp opacity toward target
    const newOpacity = boid.opacity + (opacity - boid.opacity) * 0.05

    return { x, y, vx, vy, opacity: newOpacity }
  })
}

export function useBoids(count: number) {
  const boidsRef = useRef<Boid[]>([])

  const init = useCallback((width: number, height: number) => {
    boidsRef.current = Array.from({ length: count }, () => createBoid(width, height))
  }, [count])

  const tick = useCallback((cursor: CursorPos, width: number, height: number) => {
    boidsRef.current = updateBoids(boidsRef.current, cursor, width, height)
    return boidsRef.current
  }, [])

  return { init, tick, boids: boidsRef }
}
