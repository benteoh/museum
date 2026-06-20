// tests/hooks/galleryMath.test.ts
import { describe, it, expect } from 'vitest'
import { scrollDistance, activeIndexAt } from '@/hooks/galleryMath'

describe('scrollDistance', () => {
  it('is the overflow beyond the viewport', () => {
    expect(scrollDistance(3000, 1200)).toBe(1800)
  })

  it('clamps to zero when the track fits the viewport', () => {
    expect(scrollDistance(800, 1200)).toBe(0)
  })
})

describe('activeIndexAt', () => {
  it('maps progress 0 to the first panel', () => {
    expect(activeIndexAt(0, 5)).toBe(0)
  })

  it('maps progress 1 to the last panel', () => {
    expect(activeIndexAt(1, 5)).toBe(4)
  })

  it('rounds to the nearest panel mid-track', () => {
    expect(activeIndexAt(0.5, 5)).toBe(2)
  })

  it('returns 0 for a non-positive panel count', () => {
    expect(activeIndexAt(0.5, 0)).toBe(0)
  })

  it('clamps out-of-range progress', () => {
    expect(activeIndexAt(1.5, 3)).toBe(2)
    expect(activeIndexAt(-0.5, 3)).toBe(0)
  })
})
