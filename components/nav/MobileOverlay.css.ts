// components/nav/MobileOverlay.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const overlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: 200,
  backgroundColor: vars.color.bg,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
})

export const closeButton = style({
  position: 'absolute',
  top: vars.space.px4,
  right: vars.space.px6,
  background: 'none',
  border: 'none',
  color: vars.color.textSecondary,
  fontSize: '1.5rem',
  cursor: 'pointer',
  padding: vars.space.px2,
})

export const linkList = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.space.px8,
})

export const mobileLink = style({
  fontFamily: vars.font.display,
  fontSize: '2.5rem',
  fontWeight: 300,
  color: vars.color.textPrimary,
  transition: `color 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  ':hover': {
    color: vars.color.accent,
  },
})
