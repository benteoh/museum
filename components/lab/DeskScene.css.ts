// components/lab/DeskScene.css.ts
// LAB SKETCH — the Overture desk: parting manuscripts reveal the title.
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const section = style({
  position: 'relative',
})

export const sticky = style({
  position: 'sticky',
  top: 0,
  height: '100vh',
  overflow: 'hidden',
})

export const desk = style({
  position: 'absolute',
  inset: 0,
})

// ——— Revealed on the desk beneath the papers ———

export const title = style({
  position: 'absolute',
  top: '11vh',
  left: 0,
  right: 0,
  zIndex: 1,
  textAlign: 'center',
  fontFamily: vars.font.display,
  fontSize: 'clamp(2.8rem, 7vw, 6.5rem)',
  fontWeight: 400,
  lineHeight: 1.05,
  letterSpacing: '0.05em',
  color: vars.color.textPrimary,
  pointerEvents: 'none',
})

export const curatorNote = style({
  position: 'absolute',
  bottom: '9vh',
  left: '7vw',
  zIndex: 1,
  maxWidth: '30vw',
  fontFamily: vars.font.hand,
  fontSize: '1.4rem',
  lineHeight: 1.4,
  color: vars.color.textSecondary,
  transform: 'rotate(-2deg)',
  pointerEvents: 'none',
})

// ——— Overture manuscripts (decorative, part on scroll) ———

export const sheetLayer = style({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
})

export const sheetAnchor = style({
  position: 'absolute',
  left: '50%',
  top: '50%',
})

export const sheetCenter = style({
  width: '100%',
  height: '100%',
  transform: 'translate(-50%, -50%)',
  filter: `drop-shadow(0 14px 26px ${vars.color.sheetShadow})`,
})

// Fibre + gentle lighting variance so asset-less sheets aren't flat fill.
const paperNoise = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0.30 0 0 0 0 0.24 0 0 0 0 0.13 0 0 0 0.05 0'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>")`

export const sheetBody = style({
  position: 'relative',
  width: '100%',
  height: '100%',
  backgroundColor: vars.color.surface,
  backgroundImage: `${paperNoise}, radial-gradient(ellipse at 32% 22%, rgba(255, 252, 240, 0.5) 0%, rgba(199, 182, 147, 0.28) 100%)`,
})

export const sheetImage = style({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
})

// The scan again, processed into exposed raw fibre for the tear rim.
export const rimImage = style({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
  filter: 'brightness(1.28) saturate(0.45) contrast(0.88) blur(1.5px)',
})

// Lab-only affordance so we can talk about moments precisely.
export const hint = style({
  position: 'fixed',
  right: vars.space.px4,
  bottom: vars.space.px4,
  zIndex: 200,
  fontFamily: vars.font.mono,
  fontSize: '0.75rem',
  color: vars.color.textSecondary,
})
