import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TornSheet } from '@/components/paper/TornSheet'

describe('TornSheet', () => {
  it('renders its children', () => {
    render(
      <TornSheet seed="skyhive">
        <p>exhibit</p>
      </TornSheet>,
    )
    expect(screen.getByText('exhibit')).toBeInTheDocument()
  })

  it('clips content with a referenced SVG clipPath', () => {
    const { container } = render(
      <TornSheet seed="skyhive">
        <p>exhibit</p>
      </TornSheet>,
    )
    const clipPath = container.querySelector('clipPath')
    expect(clipPath).not.toBeNull()
    expect(clipPath!.getAttribute('clipPathUnits')).toBe('objectBoundingBox')
    const clipped = container.querySelector(`[style*="clip-path"]`) as HTMLElement
    expect(clipped.style.clipPath).toContain(`#${clipPath!.id}`)
  })

  it('produces the same path for the same seed', () => {
    const a = render(<TornSheet seed="same">x</TornSheet>).container.querySelector('path')!
    const b = render(<TornSheet seed="same">y</TornSheet>).container.querySelector('path')!
    expect(a.getAttribute('d')).toBe(b.getAttribute('d'))
  })
})
