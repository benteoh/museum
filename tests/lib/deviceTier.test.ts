import { describe, it, expect } from 'vitest'
import { resolveTier } from '@/lib/deviceTier'

describe('resolveTier', () => {
  it('returns static at the hardwareConcurrency boundary (2)', () => {
    expect(resolveTier({ reducedMotion: false, hardwareConcurrency: 2 })).toBe('static')
    expect(resolveTier({ reducedMotion: false, hardwareConcurrency: 1 })).toBe('static')
  })

  it('returns static below the deviceMemory boundary (4GB)', () => {
    expect(resolveTier({ reducedMotion: false, deviceMemory: 3.9 })).toBe('static')
    expect(resolveTier({ reducedMotion: false, deviceMemory: 2 })).toBe('static')
  })

  it('weak hardware wins over everything, even without reduced motion', () => {
    expect(
      resolveTier({ reducedMotion: false, hardwareConcurrency: 2, deviceMemory: 8 }),
    ).toBe('static')
    expect(
      resolveTier({ reducedMotion: true, hardwareConcurrency: 1, deviceMemory: 2 }),
    ).toBe('static')
  })

  it('returns reduced when motion is reduced on capable hardware', () => {
    expect(
      resolveTier({ reducedMotion: true, hardwareConcurrency: 8, deviceMemory: 8 }),
    ).toBe('reduced')
  })

  it('returns full on capable hardware without reduced motion', () => {
    expect(
      resolveTier({ reducedMotion: false, hardwareConcurrency: 8, deviceMemory: 8 }),
    ).toBe('full')
    expect(resolveTier({ reducedMotion: false, hardwareConcurrency: 3, deviceMemory: 4 })).toBe(
      'full',
    )
  })

  it('treats missing capability values as capable', () => {
    expect(resolveTier({ reducedMotion: false })).toBe('full')
    expect(resolveTier({ reducedMotion: true })).toBe('reduced')
    expect(resolveTier({ reducedMotion: false, hardwareConcurrency: 8 })).toBe('full')
    expect(resolveTier({ reducedMotion: false, deviceMemory: 8 })).toBe('full')
  })
})
