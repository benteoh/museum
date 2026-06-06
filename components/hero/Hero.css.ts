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
  fontFamily: vars.font.display,
  fontSize: 'clamp(3rem, 8vw, 7rem)',
  fontWeight: 300,
  color: vars.color.textPrimary,
  lineHeight: 1.05,
  textShadow: '0 0 40px rgba(13, 15, 20, 0.4)',
  margin: 0,
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
  animation: `${pulse} 2000ms cubic-bezier(0.16, 1, 0.3, 1) infinite`,
  // opacity is controlled by Framer Motion animate in Hero.tsx
})
