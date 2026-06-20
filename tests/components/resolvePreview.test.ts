// tests/components/resolvePreview.test.ts
import { describe, it, expect } from 'vitest'
import { resolvePreview } from '@/components/projects/resolvePreview'

describe('resolvePreview', () => {
  it('chooses component when a bespoke preview exists', () => {
    expect(resolvePreview({ hasComponent: true, heroImage: '/x.png' })).toBe('component')
  })

  it('chooses image when no component but heroImage present', () => {
    expect(resolvePreview({ hasComponent: false, heroImage: '/x.gif' })).toBe('image')
  })

  it('falls back to default when neither is present', () => {
    expect(resolvePreview({ hasComponent: false })).toBe('default')
  })

  it('treats empty-string heroImage as absent', () => {
    expect(resolvePreview({ hasComponent: false, heroImage: '' })).toBe('default')
  })
})
