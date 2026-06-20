// components/project-detail/IframeWrapper.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const root = style({
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
  borderRadius: vars.space.px2,
  border: `1px solid ${vars.color.border}`,
  marginBottom: vars.space.px12,
})

export const iframe = style({
  display: 'block',
  width: '100%',
  height: '100%',
  border: 'none',
  transition: `opacity 0.4s ${vars.ease.out}`,
})

export const skeletonLayer = style({
  position: 'absolute',
  inset: 0,
})

export const fallback = style({
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
  borderRadius: vars.space.px2,
  border: `1px solid ${vars.color.border}`,
  marginBottom: vars.space.px12,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.px4,
})

export const fallbackLink = style({
  position: 'absolute',
  bottom: vars.space.px4,
  right: vars.space.px4,
  fontFamily: vars.font.mono,
  fontSize: '0.75rem',
  letterSpacing: '0.05em',
  color: vars.color.accent,
  textDecoration: 'none',
  padding: `${vars.space.px2} ${vars.space.px4}`,
  border: `1px solid ${vars.color.accentDim}`,
  borderRadius: vars.space.px2,
  backgroundColor: vars.color.bg,
  ':hover': {
    backgroundColor: vars.color.surface,
  },
})

export const mobileNote = style({
  marginTop: vars.space.px3,
  fontFamily: vars.font.mono,
  fontSize: '0.75rem',
  color: vars.color.textSecondary,
  '@media': {
    '(min-width: 640px)': {
      display: 'none',
    },
  },
})
