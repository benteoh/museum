import { describe, it, expect } from 'vitest'
import { mulberry32, hashSeed, tornEdgePath } from '@/components/paper/tornEdge'

describe('mulberry32', () => {
  it('is deterministic for the same seed', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })

  it('produces values in [0, 1)', () => {
    const rand = mulberry32(7)
    for (let i = 0; i < 1000; i++) {
      const v = rand()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('hashSeed', () => {
  it('is deterministic and differs across strings', () => {
    expect(hashSeed('skyhive')).toBe(hashSeed('skyhive'))
    expect(hashSeed('skyhive')).not.toBe(hashSeed('museum-of-little-things'))
  })

  it('returns an unsigned 32-bit integer', () => {
    const h = hashSeed('anything')
    expect(Number.isInteger(h)).toBe(true)
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThanOrEqual(0xffffffff)
  })
})

describe('tornEdgePath', () => {
  const opts = { width: 1, height: 1, seed: 123 }

  it('is deterministic for the same seed', () => {
    expect(tornEdgePath(opts)).toBe(tornEdgePath({ ...opts }))
  })

  it('differs across seeds', () => {
    expect(tornEdgePath(opts)).not.toBe(tornEdgePath({ ...opts, seed: 124 }))
  })

  it('produces a closed path', () => {
    const d = tornEdgePath(opts)
    expect(d.startsWith('M ')).toBe(true)
    expect(d.endsWith(' Z')).toBe(true)
  })

  it('keeps every coordinate within roughness of the unit box', () => {
    const roughness = 0.015
    const d = tornEdgePath({ ...opts, roughness })
    const nums = d.match(/-?\d+(\.\d+)?/g)!.map(Number)
    for (const n of nums) {
      expect(n).toBeGreaterThanOrEqual(-roughness)
      expect(n).toBeLessThanOrEqual(1 + roughness)
    }
  })

  it('has one point per segment per edge (4 * segments points)', () => {
    const d = tornEdgePath({ ...opts, segments: 10 })
    const commands = d.match(/[ML]/g)!
    expect(commands.length).toBe(40)
  })
})
