// components/cursor/BoidsCanvas.css.ts
import { style } from '@vanilla-extract/css'

export const canvas = style({
  position: 'fixed',
  inset: 0,
  width: '100vw',
  height: '100vh',
  zIndex: 9999,
  pointerEvents: 'none',
})
