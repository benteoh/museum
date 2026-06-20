// components/home/CuratorLine.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const section = style({
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `0 ${vars.space.px6}`,
})

export const line = style({
  maxWidth: '42rem',
  textAlign: 'center',
  fontFamily: vars.font.body,
  fontSize: '1.125rem',
  lineHeight: 1.7,
  letterSpacing: '0.04em',
  color: vars.color.textSecondary,
})
