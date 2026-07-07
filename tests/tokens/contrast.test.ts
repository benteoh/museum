// tests/tokens/contrast.test.ts
import { describe, it, expect } from 'vitest'

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return [r, g, b]
}

function channelLuminance(c: number): number {
  const srgb = c / 255
  return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4)
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b)
}

function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexToRgb(hexA))
  const lB = relativeLuminance(hexToRgb(hexB))
  const lighter = Math.max(lA, lB)
  const darker = Math.min(lA, lB)
  return (lighter + 0.05) / (darker + 0.05)
}

const bg = '#E7DCC1'
const textPrimary = '#382C19'
const textSecondary = '#6B5C42'

describe('WCAG contrast — paper world palette', () => {
  it('textSecondary on bg meets AA (>=4.5:1)', () => {
    expect(contrastRatio(textSecondary, bg)).toBeGreaterThanOrEqual(4.5)
  })

  it('textPrimary on bg is well above AA', () => {
    expect(contrastRatio(textPrimary, bg)).toBeGreaterThanOrEqual(4.5)
  })
})
