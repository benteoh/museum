// components/gallery/ExhibitionPanel.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

// drop-shadow (not box-shadow) so the shadow follows the torn clip outline.
export const link = style({
  flex: '0 0 auto',
  display: 'block',
  filter: `drop-shadow(0 10px 18px ${vars.color.sheetShadow})`,
  transition: `filter 500ms ${vars.ease.out}`,
  ':hover': {
    filter: `drop-shadow(0 16px 28px ${vars.color.sheetShadow})`,
  },
})

export const sheetWrap = style({
  width: 'clamp(320px, 40vw, 560px)',
  height: '70vh',
})

// The manuscript sheet itself — clipped by TornSheet.
export const sheet = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  backgroundColor: vars.color.surface,
})

// Preview area — the "plate" (illustration) on the sheet.
export const plate = style({
  position: 'relative',
  flex: 1,
  overflow: 'hidden',
})

// Caption strip beneath the plate, like a folio colophon.
export const colophon = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.px1,
  padding: `${vars.space.px3} ${vars.space.px6} ${vars.space.px4}`,
  borderTop: `1px solid ${vars.color.inkFaint}`,
})

export const title = style({
  fontFamily: vars.font.display,
  fontSize: '1.25rem',
  fontWeight: 400,
  letterSpacing: '0.03em',
  color: vars.color.textPrimary,
})

export const meta = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space.px2,
  fontFamily: vars.font.hand,
  fontSize: '0.95rem',
  color: vars.color.monoTag,
})
