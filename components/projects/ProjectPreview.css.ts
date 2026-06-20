// components/projects/ProjectPreview.css.ts
import { style } from '@vanilla-extract/css'

export const root = style({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  pointerEvents: 'none', // panels own interaction; preview is decorative
})

export const image = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
})
