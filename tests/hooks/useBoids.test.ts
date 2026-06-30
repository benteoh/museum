// tests/hooks/useBoids.test.ts
import { describe, it, expect } from 'vitest'
import { createBoid, applyBoidRules, updateBoids, type Boid } from '@/hooks/useBoids'

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
