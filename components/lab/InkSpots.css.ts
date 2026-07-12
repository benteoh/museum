// components/lab/InkSpots.css.ts
import { style } from '@vanilla-extract/css'

export const root = style({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  // Ink sinks into the paper rather than sitting on it.
  mixBlendMode: 'multiply',
})
