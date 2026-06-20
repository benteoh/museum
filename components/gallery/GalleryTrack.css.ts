// components/gallery/GalleryTrack.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

// Height is set inline (depends on panel count) to allocate scroll length.
export const section = style({
  position: 'relative',
})

export const sticky = style({
  position: 'sticky',
  top: 0,
  height: '100vh',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  perspective: '1200px',
})

export const track = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.px16,
  paddingLeft: vars.space.px32,
  paddingRight: vars.space.px32,
  transformStyle: 'preserve-3d',
  willChange: 'transform',
})
