// tests/hooks/useBoids.test.ts
import { describe, it, expect } from 'vitest'
import { createBoid, applyBoidRules, updateBoids, type Boid, type Band } from '@/hooks/useBoids'

describe('createBoid', () => {
  it('creates a boid within given bounds', () => {
    const boid = createBoid(800, 600)
    expect(boid.x).toBeGreaterThanOrEqual(0)
    expect(boid.x).toBeLessThanOrEqual(800)
    expect(boid.y).toBeGreaterThanOrEqual(0)
    expect(boid.y).toBeLessThanOrEqual(600)
  })

  it('creates a boid with speed within bounds', () => {
    const boid = createBoid(800, 600)
    const speed = Math.sqrt(boid.vx ** 2 + boid.vy ** 2)
    expect(speed).toBeGreaterThan(0)
    expect(speed).toBeLessThanOrEqual(2)
  })
})

describe('applyBoidRules', () => {
  it('returns a velocity delta object', () => {
    const boids = Array.from({ length: 5 }, () => createBoid(800, 600))
    const result = applyBoidRules(boids[0], boids, { x: -1, y: -1 })
    expect(result).toHaveProperty('dx')
    expect(result).toHaveProperty('dy')
  })

  it('applies separation when cursor is within disruption radius', () => {
    const boid = { x: 100, y: 100, vx: 0, vy: 0, opacity: 0.2, group: 0, wanderAngle: 0 }
    const others = [{ ...boid }]
    const cursor = { x: 110, y: 110 } // within 80px radius
    const result = applyBoidRules(boid, others, cursor)
    expect(typeof result.dx).toBe('number')
    expect(typeof result.dy).toBe('number')
  })
})

describe('updateBoids', () => {
  it('returns same number of boids', () => {
    const boids = Array.from({ length: 10 }, () => createBoid(800, 600))
    const updated = updateBoids(boids, { x: -1, y: -1 }, 800, 600)
    expect(updated).toHaveLength(10)
  })

  it('wraps boids that go off-screen', () => {
    const boid = { x: 850, y: 300, vx: 2, vy: 0, opacity: 0.2, group: 0, wanderAngle: 0 }
    const updated = updateBoids([boid], { x: -1, y: -1 }, 800, 600)
    expect(updated[0].x).toBeLessThan(800)
  })
})

describe('updateBoids — velocity opacity', () => {
  it('gives a fast-moving boid higher opacity than a still boid', () => {
    const stillBoid: Boid = { x: 100, y: 100, vx: 0,   vy: 0, opacity: 0.2, group: 0, wanderAngle: 0 }
    const fastBoid:  Boid = { x: 700, y: 500, vx: 2.5, vy: 0, opacity: 0.2, group: 0, wanderAngle: 0 }
    const updated = updateBoids([stillBoid, fastBoid], { x: -1, y: -1 }, 800, 600)
    expect(updated[1].opacity).toBeGreaterThan(updated[0].opacity)
  })
})

describe('updateBoids — idle formation', () => {
  it('steers a boid toward its formation target when targets are provided', () => {
    const boid: Boid = { x: 0, y: 0, vx: 0, vy: 0, opacity: 0.2, group: 0, wanderAngle: 0 }
    const target = { x: 400, y: 300 }
    const updated = updateBoids([boid], { x: -1, y: -1 }, 800, 600, [target])
    expect(updated[0].x).toBeGreaterThan(0)
  })
})

describe('updateBoids — banded murmuration mode', () => {
  const band: Band = { top: 60, bottom: 160, left: 100, right: 700 }
  const noCursor = { x: -1, y: -1 }

  const bandedBoid = (over: Partial<Boid>): Boid => ({
    x: 400, y: 110, vx: 0, vy: 0, opacity: 0.4, group: 0, wanderAngle: 0, mode: 'banded', ...over,
  })

  it('steers a banded boid above the band back down into it', () => {
    const boid = bandedBoid({ y: 10 })
    const updated = updateBoids([boid], noCursor, 800, 600, undefined, band)
    // Steer-back (60 - 10) * 0.01 = 0.5 dominates wander noise (±0.045).
    expect(updated[0].vy).toBeGreaterThan(0.2)
  })

  it('clamps a banded boid at the viewport edge instead of wrapping', () => {
    const boid = bandedBoid({ x: 799.5, vx: 1.15 })
    const updated = updateBoids([boid], noCursor, 800, 600, undefined, band)
    expect(updated[0].x).toBeLessThanOrEqual(800)
    expect(updated[0].x).toBeGreaterThan(700) // wrapped would land near 0
  })

  it('ignores the cursor while a free boid flees it', () => {
    const start = { x: 400, y: 110 }
    const cursor = { x: 395, y: 110 } // just left of the boid — flee pushes right
    let free: Boid[] = [{ ...start, vx: 0, vy: 0, opacity: 0.4, group: 0, wanderAngle: 0, mode: 'free' }]
    let banded: Boid[] = [bandedBoid({})]
    for (let i = 0; i < 30; i++) {
      free = updateBoids(free, cursor, 800, 600)
      banded = updateBoids(banded, cursor, 800, 600, undefined, band)
    }
    // The free boid is consistently accelerated away; the banded boid only
    // wanders (a random walk, so assert relative to the fleeing boid rather
    // than against a fixed bound).
    expect(free[0].x - start.x).toBeGreaterThan(25)
    expect(free[0].x - start.x).toBeGreaterThan(Math.abs(banded[0].x - start.x) + 5)
  })

  it('keeps idle formation targets from acting on banded boids', () => {
    const target = { x: 700, y: 110 }
    const boid = bandedBoid({})
    const updated = updateBoids([boid], noCursor, 800, 600, [target], band)
    // Free boids get (700-400)*0.002 = 0.6 toward the target; banded must not.
    expect(Math.abs(updated[0].x - 400)).toBeLessThan(0.5)
  })

  it('pulls banded boids toward their shared centroid', () => {
    const a = bandedBoid({ x: 200 })
    const b = bandedBoid({ x: 600 })
    const updated = updateBoids([a, b], noCursor, 800, 600, undefined, band)
    // Centroid sits at 400: (400-200)*0.0035 = 0.7 beats wander noise.
    expect(updated[0].vx).toBeGreaterThan(0.2)
    expect(updated[1].vx).toBeLessThan(-0.2)
  })

  it('coasts and dries up a fading boid', () => {
    const boid: Boid = { x: 400, y: 300, vx: 2, vy: 0, opacity: 0.5, group: 0, wanderAngle: 0, mode: 'fading' }
    const updated = updateBoids([boid], noCursor, 800, 600)
    expect(updated[0].vx).toBeLessThan(2)
    expect(updated[0].opacity).toBeLessThan(0.5)
    expect(updated[0].x).toBeGreaterThan(400) // still coasting, not frozen
  })
})
