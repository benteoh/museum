// components/home/Invitation.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const section = style({
  height: '80vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

export const link = style({
  position: 'relative',
  fontFamily: vars.font.body,
  fontSize: '1.125rem',
  letterSpacing: '0.04em',
  color: vars.color.textSecondary,
  transition: `color 150ms ${vars.ease.out}`,
  ':hover': {
    color: vars.color.textPrimary,
  },
  '::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '-4px',
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
