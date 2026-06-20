// components/gallery/ExhibitionPanel.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const link = style({
  flex: '0 0 auto',
  display: 'block',
})

export const panel = style({
  position: 'relative',
  width: 'clamp(320px, 40vw, 560px)',
  height: '70vh',
  borderRadius: '12px',
  overflow: 'hidden',
  backgroundColor: vars.color.surface,
  boxShadow: '0 8px 24px rgba(13, 15, 20, 0.6)',
  transition: `box-shadow 500ms ${vars.ease.out}`,
  ':hover': {
    boxShadow: '0 12px 32px rgba(13, 15, 20, 0.8)',
  },
})

// Vitrine glass overlay.
export const glass = style({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  gap: vars.space.px2,
  padding: vars.space.px6,
  backdropFilter: 'blur(4px)',
  background: 'rgba(13, 15, 20, 0.15)',
  border: '1px solid rgba(184, 212, 232, 0.08)',
  borderRadius: '12px',
  transition: `background 500ms ${vars.ease.out}, border-color 500ms ${vars.ease.out}`,
  selectors: {
    [`${panel}:hover &`]: {
      background: 'rgba(13, 15, 20, 0.06)',
      borderColor: 'rgba(184, 212, 232, 0.14)',
    },
  },
})

export const title = style({
  fontFamily: vars.font.display,
  fontSize: '1.75rem',
  fontWeight: 500,
  letterSpacing: '-0.02em',
  color: vars.color.textPrimary,
})

export const meta = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space.px2,
  fontFamily: vars.font.mono,
  fontSize: '0.6875rem',
  letterSpacing: '0.04em',
  color: vars.color.monoTag,
})
