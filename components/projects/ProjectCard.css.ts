// components/projects/ProjectCard.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const cardLink = style({
  display: 'block',
  textDecoration: 'none',
  color: 'inherit',
})

export const card = style({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: '12px',
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.surface,
  transition: `transform 300ms ${vars.ease.out}, border-color 300ms ${vars.ease.out}`,
  ':hover': {
    transform: 'translateY(-4px)',
    borderColor: vars.color.accentDim,
  },
})

export const panel = style({
  position: 'relative',
  aspectRatio: '16 / 10',
  overflow: 'hidden',
  backgroundColor: vars.color.surface,
})

export const badge = style({
  position: 'absolute',
  top: vars.space.px3,
  right: vars.space.px3,
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.px1,
  padding: `${vars.space.px1} ${vars.space.px2}`,
  borderRadius: '999px',
  backgroundColor: 'rgba(13, 15, 20, 0.55)',
  backdropFilter: 'blur(6px)',
  fontFamily: vars.font.mono,
  fontSize: '0.6875rem',
  letterSpacing: '0.04em',
  color: vars.color.textPrimary,
})

export const badgeDot = style({
  width: '6px',
  height: '6px',
  borderRadius: '999px',
})

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.px2,
  padding: vars.space.px4,
})

export const title = style({
  fontFamily: vars.font.display,
  fontSize: '1.375rem',
  fontWeight: 500,
  letterSpacing: '-0.01em',
  color: vars.color.textPrimary,
})

export const description = style({
  fontFamily: vars.font.body,
  fontSize: '0.9375rem',
  lineHeight: 1.6,
  color: vars.color.textSecondary,
})

export const tags = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space.px2,
  marginTop: vars.space.px2,
})

export const tag = style({
  fontFamily: vars.font.mono,
  fontSize: '0.6875rem',
  letterSpacing: '0.02em',
  color: vars.color.monoTag,
})
