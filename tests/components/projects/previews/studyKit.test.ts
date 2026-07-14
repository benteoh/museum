import { describe, expect, it } from 'vitest'
import {
  STUDY_INKS,
  forceArrowGeometry,
  mirrorWritingLines,
  strokeDrawProps,
} from '@/components/projects/previews/studyKit'

describe('mirrorWritingLines', () => {
  it('returns the same right-to-left paths for the same seed', () => {
    const first = mirrorWritingLines('codex-atlanticus', { count: 3 })
    const second = mirrorWritingLines('codex-atlanticus', { count: 3 })

    expect(first).toEqual(second)
    expect(first).toHaveLength(3)
    expect(first.every((path) => path.startsWith('M 90 '))).toBe(true)
    expect(first.every((path) => path.includes(' q -'))).toBe(true)
  })

  it('varies the paths when the seed changes', () => {
    expect(mirrorWritingLines('flight', { count: 2 })).not.toEqual(
      mirrorWritingLines('anatomy', { count: 2 }),
    )
  })
})

describe('strokeDrawProps', () => {
  it('hides an undrawn stroke behind its dash length', () => {
    expect(strokeDrawProps(120, false)).toEqual({
      strokeDasharray: 120,
      strokeDashoffset: 120,
    })
  })

  it('reveals a drawn stroke while preserving its dash length', () => {
    expect(strokeDrawProps(120, true)).toEqual({
      strokeDasharray: 120,
      strokeDashoffset: 0,
    })
  })
})

describe('forceArrowGeometry', () => {
  it('builds a shaft and closed arrowhead pointing at the destination', () => {
    expect(forceArrowGeometry(10, 20, 30, 20, 4)).toEqual({
      shaftPath: 'M 10 20 L 30 20',
      headPath: 'M 30 20 L 26 16 L 26 24 Z',
    })
  })
})

describe('STUDY_INKS', () => {
  it('mirrors the paper and glass palette tokens', () => {
    expect(STUDY_INKS).toEqual({
      paper: {
        primary: '#382C19',
        accent: '#8C4F32',
        annotation: '#7A5F38',
      },
      glass: {
        primary: '#E6DCC4',
        accent: '#D89B54',
        annotation: '#E6DCC4',
      },
    })
  })
})
