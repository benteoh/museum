// components/paper/TornSheet.css.ts
import { style } from '@vanilla-extract/css'

export const root = style({
  position: 'relative',
  width: '100%',
  height: '100%',
})

// Zero-size holder for the <clipPath> def — must stay in the DOM.
export const defs = style({
  position: 'absolute',
  width: 0,
  height: 0,
})

// Raw paper fibre exposed by the tear — paler than any aged surface above it.
export const rim = style({
  position: 'absolute',
  inset: 0,
  backgroundColor: '#F7F0DC',
})

// Content sits slightly inside the rim so the fibre peeks through unevenly.
export const content = style({
  position: 'absolute',
  inset: '0.4%',
})
