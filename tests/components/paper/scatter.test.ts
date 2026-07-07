import { describe, it, expect } from 'vitest'
import { sheetScatter } from '@/components/paper/scatter'

describe('sheetScatter', () => {
  it('is deterministic per index', () => {
    expect(sheetScatter(3)).toEqual(sheetScatter(3))
  })

  it('differs across indices', () => {
    expect(sheetScatter(0)).not.toEqual(sheetScatter(1))
  })

  it('stays within its bounds for the first 50 indices', () => {
    for (let i = 0; i < 50; i++) {
      const s = sheetScatter(i)
      expect(Math.abs(s.rotate)).toBeLessThanOrEqual(3.5)
      expect(Math.abs(s.dx)).toBeLessThanOrEqual(12)
      expect(Math.abs(s.dy)).toBeLessThanOrEqual(16)
    }
  })
})
