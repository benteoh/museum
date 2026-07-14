import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ProjectPreview } from '@/components/projects/ProjectPreview'
import { DefaultPreview } from '@/components/projects/previews/DefaultPreview'
import { MuseumOfLittleThingsPreview } from '@/components/projects/previews/MuseumOfLittleThingsPreview'
import { SkyhivePreview } from '@/components/projects/previews/SkyhivePreview'
import { VisionScene } from '@/components/vision/VisionScene'
import type { Tier } from '@/lib/deviceTier'

const device = vi.hoisted(() => ({ tier: 'reduced' as Tier }))

vi.mock('@/hooks/useDeviceTier', () => ({
  useDeviceTier: () => device.tier,
}))

vi.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: () => false,
}))

vi.mock('@/hooks/useGallery', async () => {
  const { createRef } = await import('react')
  return {
    useGallery: () => ({
      sectionRef: createRef<HTMLElement>(),
      trackRef: createRef<HTMLDivElement>(),
      x: 0,
      activeIndex: 0,
    }),
  }
})

type ObserverCallback = (entries: Array<{ isIntersecting: boolean }>) => void
let observerCallback: ObserverCallback | undefined

class IntersectionObserverStub {
  constructor(callback: ObserverCallback) {
    observerCallback = callback
  }
  observe() {}
  disconnect() {}
}

function geometry(container: HTMLElement) {
  return Array.from(container.querySelectorAll('[data-geometry]')).map((node) =>
    node.getAttribute('d') ?? node.getAttribute('points'),
  )
}

describe('dual-world preview contracts', () => {
  beforeEach(() => {
    device.tier = 'reduced'
    observerCallback = undefined
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('defaults ProjectPreview to paper and keeps bespoke priority over hero images', () => {
    const { container } = render(
      <ProjectPreview
        slug="museum-of-little-things"
        heroImage="/must-not-win.png"
        title="Museum"
      />,
    )

    expect(container.querySelector('[data-study="museum"]')).toHaveAttribute(
      'data-study-world',
      'paper',
    )
    expect(container.querySelector('img')).toBeNull()
  })

  it('passes glass only from VisionScene into its project plates', () => {
    device.tier = 'static'
    const { container } = render(
      <VisionScene
        curatorNote="visions"
        projects={[
          {
            slug: 'skyhive',
            title: 'Skyhive',
            description: 'A hive in the air',
            tags: ['geometry'],
            status: 'wip',
          },
        ]}
      />,
    )

    expect(container.querySelector('[data-study="skyhive"]')).toHaveAttribute(
      'data-study-world',
      'glass',
    )
  })

  it.each([
    ['museum', MuseumOfLittleThingsPreview],
    ['skyhive', SkyhivePreview],
  ] as const)('%s keeps geometry identical while ink treatment changes', (_, Preview) => {
    const paper = render(<Preview world="paper" />)
    const glass = render(<Preview world="glass" />)

    expect(geometry(paper.container)).toEqual(geometry(glass.container))
    expect(paper.container.querySelector('svg')).toHaveAttribute('data-study-world', 'paper')
    expect(glass.container.querySelector('svg')).toHaveAttribute('data-study-world', 'glass')
    expect(paper.container.querySelector('svg')).not.toHaveStyle(
      glass.container.querySelector('svg')!.getAttribute('style') ?? '',
    )
  })

  it('seeds the default geometric study from slug and hero colour', () => {
    const first = render(
      <DefaultPreview slug="future-machine" heroColour="#123456" world="paper" />,
    )
    const same = render(
      <DefaultPreview slug="future-machine" heroColour="#123456" world="glass" />,
    )
    const changed = render(
      <DefaultPreview slug="future-machine" heroColour="#654321" world="paper" />,
    )

    expect(geometry(first.container)).toEqual(geometry(same.container))
    expect(geometry(first.container)).not.toEqual(geometry(changed.container))
  })

  it.each([
    ['reduced', 'true'],
    ['static', 'true'],
    ['full', 'false'],
  ] as const)('renders the %s tier with drawn=%s', (tier, drawn) => {
    device.tier = tier
    const { container } = render(<SkyhivePreview world="paper" />)

    expect(container.querySelector('svg')).toHaveAttribute('data-drawn', drawn)
  })

  it('runs Museum visitor motes only while visible and the document is shown', () => {
    device.tier = 'full'
    vi.useFakeTimers()
    let hidden = false
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
    const request = vi.fn(() => 42)
    const cancel = vi.fn()
    vi.stubGlobal('requestAnimationFrame', request)
    vi.stubGlobal('cancelAnimationFrame', cancel)
    render(<MuseumOfLittleThingsPreview world="paper" />)

    expect(request).not.toHaveBeenCalled()
    act(() => observerCallback?.([{ isIntersecting: true }]))
    expect(request).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1600))
    expect(request).toHaveBeenCalledTimes(1)

    act(() => observerCallback?.([{ isIntersecting: false }]))
    expect(cancel).toHaveBeenCalledWith(42)
    act(() => observerCallback?.([{ isIntersecting: true }]))
    expect(request).toHaveBeenCalledTimes(2)

    hidden = true
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(cancel).toHaveBeenCalledTimes(2)
  })
})
