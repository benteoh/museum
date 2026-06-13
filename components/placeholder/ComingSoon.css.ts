// components/placeholder/ComingSoon.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const wrapper = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  fontFamily: vars.font.body,
  fontSize: '1.125rem',
  letterSpacing: '0.04em',
  color: vars.color.textSecondary,
})
