// components/hero/Hero.css.ts
import { style, keyframes } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const section = style({
  position: 'relative',
  height: '100vh',
  overflow: 'hidden',
})

export const vignette = style({
  position: 'absolute',
  inset: 0,
  background: `radial-gradient(ellipse at center, transparent 30%, ${vars.color.bg} 100%)`,
  opacity: 0.65,
  zIndex: 1,
  pointerEvents: 'none',
})

export const title = style({
  position: 'absolute',
  bottom: vars.space.px24,
  left: vars.space.px24,
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.px3,
  margin: 0,
  maxWidth: 'min(90vw, 60rem)',
  fontFamily: vars.font.display,
  textShadow: `0 0 40px ${vars.color.sheetShadow}`,
})

// Light, letter-spaced kicker line that sets up the main statement.
export const titleKicker = style({
  fontSize: 'clamp(1rem, 2vw, 1.6rem)',
  fontWeight: 400,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: vars.color.accentDim,
  paddingLeft: '0.12em',
})

// The headline — heavier weight and tight tracking give it weight and presence.
export const titleMain = style({
  fontSize: 'clamp(3.5rem, 9vw, 8.5rem)',
  fontWeight: 500,
  lineHeight: 0.95,
  letterSpacing: '-0.03em',
  color: vars.color.textPrimary,
})

const pulse = keyframes({
  '0%': { transform: 'translateX(-50%) scaleY(1)' },
  '50%': { transform: 'translateX(-50%) scaleY(1.3)' },
  '100%': { transform: 'translateX(-50%) scaleY(1)' },
})

export const scrollIndicator = style({
  position: 'absolute',
  bottom: vars.space.px12,
  left: '50%',
  zIndex: 2,
  width: '1px',
  height: '48px',
  backgroundColor: vars.color.accent,
  transformOrigin: 'top center',
  animation: `${pulse} 2000ms ${vars.ease.out} infinite`,
  // opacity is controlled by Framer Motion animate in Hero.tsx
})
