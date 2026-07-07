// components/nav/Nav.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const nav = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.space.px4} ${vars.space.px6}`,
  transition: `background-color 500ms ${vars.ease.out},
               backdrop-filter 500ms ${vars.ease.out}`,
})

export const navScrolled = style({
  backgroundColor: vars.color.surface,
  backdropFilter: 'blur(12px)',
})

export const brand = style({
  fontFamily: vars.font.display,
  fontSize: '0.875rem',
  fontWeight: 500,
  color: vars.color.textPrimary,
  letterSpacing: '0.01em',
})

export const links = style({
  display: 'flex',
  gap: vars.space.px6,
  '@media': {
    '(max-width: 640px)': {
      display: 'none',
    },
  },
})

export const link = style({
  position: 'relative',
  fontFamily: vars.font.body,
  fontSize: '0.875rem',
  color: vars.color.textSecondary,
  transition: `color 150ms ${vars.ease.out}`,
  ':hover': {
    color: vars.color.textPrimary,
  },
  '::after': {
    content: '""',
    position: 'absolute',
    bottom: '-2px',
    left: 0,
    right: 0,
    height: '1px',
    backgroundColor: vars.color.accent,
    transformOrigin: 'left',
    transform: 'scaleX(0)',
    transition: `transform 150ms ${vars.ease.out}`,
  },
  selectors: {
    '&:hover::after': {
      transform: 'scaleX(1)',
    },
  },
})

export const hamburger = style({
  display: 'none',
  flexDirection: 'column',
  gap: '5px',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: vars.space.px2,
  '@media': {
    '(max-width: 640px)': {
      display: 'flex',
    },
  },
})

export const hamburgerLine = style({
  width: '20px',
  height: '1px',
  backgroundColor: vars.color.textPrimary,
  transition: `background-color 150ms ${vars.ease.out}`,
})
