// components/layout/PageShell.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const container = style({
  maxWidth: '72rem',
  margin: '0 auto',
  padding: `${vars.space.px24} ${vars.space.px6} ${vars.space.px16}`,
})

export const header = style({
  marginBottom: vars.space.px12,
})

export const kicker = style({
  display: 'block',
  marginBottom: vars.space.px3,
  fontFamily: vars.font.display,
  fontSize: '0.875rem',
  fontWeight: 400,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: vars.color.accentDim,
})

export const title = style({
  fontFamily: vars.font.display,
  fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
  fontWeight: 500,
  lineHeight: 1,
  letterSpacing: '-0.03em',
  color: vars.color.textPrimary,
})

export const lede = style({
  maxWidth: '42rem',
  marginTop: vars.space.px4,
  fontFamily: vars.font.body,
  fontSize: '1.125rem',
  lineHeight: 1.7,
  color: vars.color.textSecondary,
})
