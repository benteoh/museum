// components/thoughts/ThoughtList.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const list = style({
  display: 'flex',
  flexDirection: 'column',
})

export const item = style({
  display: 'grid',
  gridTemplateColumns: '8rem 1fr',
  gap: vars.space.px6,
  padding: `${vars.space.px6} 0`,
  borderTop: `1px solid ${vars.color.border}`,
  '@media': {
    '(max-width: 640px)': {
      gridTemplateColumns: '1fr',
      gap: vars.space.px2,
    },
  },
})

export const meta = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.px1,
  fontFamily: vars.font.mono,
  fontSize: '0.75rem',
  letterSpacing: '0.04em',
  color: vars.color.textSecondary,
})

export const tag = style({
  color: vars.color.monoTag,
})

export const title = style({
  fontFamily: vars.font.display,
  fontSize: '1.5rem',
  fontWeight: 500,
  letterSpacing: '-0.01em',
  color: vars.color.textPrimary,
  transition: `color 150ms ${vars.ease.out}`,
  selectors: {
    [`${item}:hover &`]: {
      color: vars.color.accent,
    },
  },
})

export const excerpt = style({
  marginTop: vars.space.px2,
  maxWidth: '40rem',
  fontFamily: vars.font.body,
  fontSize: '1rem',
  lineHeight: 1.6,
  color: vars.color.textSecondary,
})
