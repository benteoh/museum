// hooks/useBoids.ts
'use client'

import { useRef, useCallback } from 'react'

// Spatial perception
const PERCEPTION_RADIUS = 90
const SEPARATION_RADIUS = 24
const DISRUPTION_RADIUS = 110
const CHASE_RADIUS = 150
const FLEE_RADIUS = 120

// Motion limits
const MAX_SPEED = 2.8
const MAX_FORCE = 0.09
const W_FORMATION = 0.002

// Rock-paper-scissors groups: group g chases (g+1), flees (g-1)
export const GROUPS = 3

// Steering weights
const W_COHESION = 0.0008
const W_SEPARATION = 0.06
const W_ALIGNMENT = 0.05 // moderate — strong alignment makes whole flock go uniform
const W_CHASE = 0.05
const W_FLEE = 0.1 // flee > chase so prey scatter and the chase never resolves
const W_WANDER = 0.045
const WANDER_JITTER = 0.5

export type Boid = {
  x: number
  y: number
  vx: number
  vy: number
  opacity: number
  group: number
  wanderAngle: number
}

export type CursorPos = { x: number; y: number }

export function createBoid(width: number, height: number, group?: number): Boid {
  const angle = Math.random() * Math.PI * 2
  const speed = 0.5 + Math.random() * 1.5
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    opacity: 0.2,
    group: group ?? Math.floor(Math.random() * GROUPS),
    wanderAngle: Math.random() * Math.PI * 2,
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
): { dx: number; dy: number; wanderAngle: number } {
  const group = boid.group ?? 0
  const preyGroup = (group + 1) % GROUPS
  const predatorGroup = (group + GROUPS - 1) % GROUPS

  let cohX = 0, cohY = 0, cohCount = 0
  let sepX = 0, sepY = 0
  let aliVx = 0, aliVy = 0, aliCount = 0
  let fleeX = 0, fleeY = 0
  let preyX = 0, preyY = 0, nearestPrey = Infinity

  for (const other of all) {
    if (other === boid) continue
    const otherGroup = other.group ?? 0
    const d = dist(boid.x, boid.y, other.x, other.y)

    // Flocking only with same group
    if (otherGroup === group && d < PERCEPTION_RADIUS) {
      cohX += other.x
      cohY += other.y
      cohCount++

      aliVx += other.vx
      aliVy += other.vy
      aliCount++
    }

    // Separation from everyone nearby, regardless of group (physical space)
    if (d < SEPARATION_RADIUS && d > 0) {
      sepX += (boid.x - other.x) / d
      sepY += (boid.y - other.y) / d
    }

    // Chase nearest prey
    if (otherGroup === preyGroup && d < CHASE_RADIUS && d < nearestPrey) {
      nearestPrey = d
      preyX = other.x
      preyY = other.y
    }

    // Flee from predators, weighted by closeness
    if (otherGroup === predatorGroup && d < FLEE_RADIUS && d > 0) {
      const w = (1 - d / FLEE_RADIUS) / d
      fleeX += (boid.x - other.x) * w
      fleeY += (boid.y - other.y) * w
    }
  }

  let dx = 0
  let dy = 0

  // Cohesion (same group)
  if (cohCount > 0) {
    dx += (cohX / cohCount - boid.x) * W_COHESION
    dy += (cohY / cohCount - boid.y) * W_COHESION
  }

  // Separation (all)
  dx += sepX * W_SEPARATION
  dy += sepY * W_SEPARATION

  // Alignment (same group)
  if (aliCount > 0) {
    dx += (aliVx / aliCount - boid.vx) * W_ALIGNMENT
    dy += (aliVy / aliCount - boid.vy) * W_ALIGNMENT
  }

  // Chase prey
  if (nearestPrey < Infinity) {
    const cd = dist(boid.x, boid.y, preyX, preyY)
    if (cd > 0) {
      dx += ((preyX - boid.x) / cd) * W_CHASE
      dy += ((preyY - boid.y) / cd) * W_CHASE
    }
  }

  // Flee predators
  dx += fleeX * W_FLEE
  dy += fleeY * W_FLEE

  // Wander — random-walk steering that breaks up uniform directional drift
  const wanderAngle = (boid.wanderAngle ?? 0) + (Math.random() - 0.5) * WANDER_JITTER
  dx += Math.cos(wanderAngle) * W_WANDER
  dy += Math.sin(wanderAngle) * W_WANDER

  // Cursor disruption — force only, opacity is now speed-derived in updateBoids
  const cursorDist = dist(boid.x, boid.y, cursor.x, cursor.y)
  if (cursor.x >= 0 && cursor.y >= 0 && cursorDist < DISRUPTION_RADIUS) {
    const force = (1 - cursorDist / DISRUPTION_RADIUS) * 0.3
    if (cursorDist > 0) {
      dx += ((boid.x - cursor.x) / cursorDist) * force
      dy += ((boid.y - cursor.y) / cursorDist) * force
    }
  }

  // Clamp forces
  dx = clamp(dx, -MAX_FORCE, MAX_FORCE)
  dy = clamp(dy, -MAX_FORCE, MAX_FORCE)

  return { dx, dy, wanderAngle }
}

export function updateBoids(
  boids: Boid[],
  cursor: CursorPos,
  width: number,
  height: number,
  formationTargets?: Array<{ x: number; y: number }>
): Boid[] {
  return boids.map((boid, i) => {
    const { dx: ruleDx, dy: ruleDy, wanderAngle } = applyBoidRules(boid, boids, cursor)

    let dx = ruleDx
    let dy = ruleDy

    if (formationTargets) {
      const target = formationTargets[i % formationTargets.length]
      if (target) {
        dx += (target.x - boid.x) * W_FORMATION
        dy += (target.y - boid.y) * W_FORMATION
      }
    }

    let vx = boid.vx + dx
    let vy = boid.vy + dy

    const speed = Math.sqrt(vx ** 2 + vy ** 2)
    if (speed > MAX_SPEED) {
      vx = (vx / speed) * MAX_SPEED
      vy = (vy / speed) * MAX_SPEED
    }

    let x = boid.x + vx
    let y = boid.y + vy

    if (x < 0) x += width
    if (x > width) x -= width
    if (y < 0) y += height
    if (y > height) y -= height

    const targetOpacity = 0.2 + (speed / MAX_SPEED) * 0.4
    const newOpacity = boid.opacity + (targetOpacity - boid.opacity) * 0.05

    return { x, y, vx, vy, opacity: newOpacity, group: boid.group ?? 0, wanderAngle }
  })
}

export function useBoids(count: number) {
  const boidsRef = useRef<Boid[]>([])

  const init = useCallback((width: number, height: number) => {
    boidsRef.current = Array.from({ length: count }, (_, i) =>
      createBoid(width, height, i % GROUPS)
    )
  }, [count])

  const tick = useCallback((
    cursor: CursorPos,
    width: number,
    height: number,
    formationTargets?: Array<{ x: number; y: number }>
  ) => {
    boidsRef.current = updateBoids(boidsRef.current, cursor, width, height, formationTargets)
    return boidsRef.current
  }, [])

  return { init, tick, boids: boidsRef }
}
