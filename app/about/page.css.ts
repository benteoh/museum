// app/about/page.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const prose = style({
  maxWidth: '42rem',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.px3,
})

export const spacer = style({
  height: vars.space.px4,
})
