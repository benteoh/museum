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
