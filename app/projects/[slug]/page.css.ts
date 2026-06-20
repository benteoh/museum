// app/projects/[slug]/page.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const container = style({
  maxWidth: '72rem',
  margin: '0 auto',
  padding: `${vars.space.px24} ${vars.space.px6} ${vars.space.px16}`,
})

export const header = style({
  marginBottom: vars.space.px8,
})

export const back = style({
  display: 'inline-block',
  marginBottom: vars.space.px8,
  fontFamily: vars.font.mono,
  fontSize: '0.8125rem',
  letterSpacing: '0.05em',
  color: vars.color.accentDim,
  textDecoration: 'none',
  ':hover': {
    color: vars.color.accent,
  },
})

export const title = style({
  fontFamily: vars.font.display,
  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
  fontWeight: 500,
  lineHeight: 1.05,
  letterSpacing: '-0.03em',
  color: vars.color.textPrimary,
  marginBottom: vars.space.px4,
})

export const description = style({
  fontFamily: vars.font.body,
  fontSize: '1.125rem',
  lineHeight: 1.6,
  color: vars.color.textSecondary,
  maxWidth: '52ch',
  marginBottom: vars.space.px6,
})

export const meta = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space.px2,
  marginBottom: vars.space.px4,
})

export const status = style({
  fontFamily: vars.font.mono,
  fontSize: '0.6875rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: vars.color.statusLive,
  padding: `${vars.space.px1} ${vars.space.px3}`,
  border: `1px solid currentColor`,
  borderRadius: '2px',
})

export const tag = style({
  fontFamily: vars.font.mono,
  fontSize: '0.6875rem',
  letterSpacing: '0.05em',
  color: vars.color.textSecondary,
  padding: `${vars.space.px1} ${vars.space.px3}`,
  border: `1px solid ${vars.color.border}`,
  borderRadius: '2px',
})

export const links = style({
  display: 'flex',
  gap: vars.space.px4,
  marginTop: vars.space.px4,
})

export const link = style({
  fontFamily: vars.font.mono,
  fontSize: '0.8125rem',
  letterSpacing: '0.04em',
  color: vars.color.accent,
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline',
  },
})

export const footer = style({
  marginTop: vars.space.px12,
  paddingTop: vars.space.px8,
  borderTop: `1px solid ${vars.color.border}`,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.px4,
})

export const footerTags = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space.px2,
})

export const footerTag = style({
  fontFamily: vars.font.mono,
  fontSize: '0.6875rem',
  letterSpacing: '0.05em',
  color: vars.color.textSecondary,
})

export const date = style({
  fontFamily: vars.font.mono,
  fontSize: '0.75rem',
  color: vars.color.textSecondary,
})
