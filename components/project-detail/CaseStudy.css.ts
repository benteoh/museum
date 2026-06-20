// components/project-detail/CaseStudy.css.ts
import { style, globalStyle } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const root = style({
  maxWidth: '65ch',
  marginTop: vars.space.px12,
  marginBottom: vars.space.px12,
  fontFamily: vars.font.body,
  fontSize: '1.0625rem',
  lineHeight: 1.8,
  color: vars.color.textSecondary,
})

globalStyle(`${root} h2`, {
  marginTop: vars.space.px8,
  marginBottom: vars.space.px4,
  fontFamily: vars.font.display,
  fontSize: '1.25rem',
  fontWeight: 500,
  letterSpacing: '-0.02em',
  color: vars.color.textPrimary,
})

globalStyle(`${root} p`, {
  marginBottom: vars.space.px4,
})

globalStyle(`${root} a`, {
  color: vars.color.accent,
  textDecoration: 'underline',
  textDecorationColor: vars.color.accentDim,
})

globalStyle(`${root} code`, {
  fontFamily: vars.font.mono,
  fontSize: '0.875em',
  padding: `2px ${vars.space.px2}`,
  borderRadius: '3px',
  backgroundColor: vars.color.surface,
  color: vars.color.accent,
})
