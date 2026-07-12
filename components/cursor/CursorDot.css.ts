// components/cursor/CursorDot.css.ts
// The ink-nib pointer. Warm-light literals mirror duskText/duskTorch — the
// same documented light-on-dark exception as the scene type treatments.
import { style, globalStyle } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

// Stamped on <html> while the bespoke cursor is active (fine pointer, full
// tier). Scoped here so the native cursor returns the moment it unmounts.
export const hideNativeCursor = style({})

globalStyle(`${hideNativeCursor}, ${hideNativeCursor} *`, {
  cursor: 'none',
})

export const root = style({
  position: 'fixed',
  inset: 0,
  zIndex: 999,
  pointerEvents: 'none',
})

export const dot = style({
  position: 'absolute',
  top: -4,
  left: -4,
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: vars.color.textPrimary,
  transition: 'background 500ms cubic-bezier(0.16, 1, 0.3, 1)',
})

export const dotLight = style({
  background: vars.color.duskText,
  boxShadow: '0 0 10px rgba(255, 236, 190, 0.65)',
})

export const halo = style({
  position: 'absolute',
  top: -16,
  left: -16,
  width: 32,
  height: 32,
  borderRadius: '50%',
  border: '1.5px solid rgba(56, 44, 25, 0.4)',
  transition: 'border-color 500ms cubic-bezier(0.16, 1, 0.3, 1)',
})

export const haloLight = style({
  borderColor: 'rgba(230, 220, 196, 0.6)',
})
