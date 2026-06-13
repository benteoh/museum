// components/projects/ProjectGallery.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
  gap: vars.space.px6,
})
