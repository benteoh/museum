// tests/components/projects/previews/boidsMath.test.ts
import { describe, it, expect } from 'vitest'
import { createParticles, tick } from '@/components/projects/previews/boidsMath'

describe('createParticles', () => {
  it('creates the requested number of particles', () => {
    const ps = createParticles(18, 400, 300)
    expect(ps).toHaveLength(18)
  })

  it('places all particles within canvas bounds', () => {
    const ps = createParticles(18, 400, 300)
    for (const p of ps) {
      expect(p.x).toBeGreaterThanOrEqual(0)
      expect(p.x).toBeLessThanOrEqual(400)
      expect(p.y).toBeGreaterThanOrEqual(0)
      expect(p.y).toBeLessThanOrEqual(300)
    }
  })

  it('uses an injected random source for deterministic visitor placement', () => {
    const random = () => 0.25

    expect(createParticles(3, 100, 60, random)).toEqual(
      createParticles(3, 100, 60, random),
    )
  })
})

describe('tick', () => {
  it('returns the same number of particles', () => {
    const ps = createParticles(18, 400, 300)
    expect(tick(ps, 400, 300)).toHaveLength(18)
  })

  it('wraps particles that go off the right edge', () => {
    const ps = [{ x: 402, y: 150, vx: 2, vy: 0 }]
    const next = tick(ps, 400, 300)
    expect(next[0].x).toBeLessThan(400)
  })

  it('wraps particles that go off the bottom edge', () => {
    const ps = [{ x: 200, y: 302, vx: 0, vy: 2 }]
    const next = tick(ps, 400, 300)
    expect(next[0].y).toBeLessThan(300)
  })

  it('produces non-zero velocity for at least one particle', () => {
    const ps = createParticles(18, 400, 300)
    const next = tick(ps, 400, 300)
    expect(next.some((p) => p.vx !== 0 || p.vy !== 0)).toBe(true)
  })

  it('honours a calm speed ceiling for manuscript visitor motes', () => {
    const next = tick([{ x: 20, y: 20, vx: 1, vy: 1 }], 100, 60, {
      maxSpeed: 0.08,
      maxForce: 0.004,
    })

    expect(Math.hypot(next[0].vx, next[0].vy)).toBeLessThanOrEqual(0.080001)
  })
})
