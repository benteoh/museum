// styles/typography.css.ts
import { globalStyle } from '@vanilla-extract/css'
import { vars } from './tokens.css'

globalStyle('h1, h2, h3, h4, h5, h6', {
  fontFamily: vars.font.display,
  fontWeight: 400,
  lineHeight: 1.2,
  letterSpacing: '0.02em',
  color: vars.color.textPrimary,
})

globalStyle('p', {
  fontFamily: vars.font.body,
  lineHeight: 1.75,
  color: vars.color.textSecondary,
})

globalStyle('code, pre, kbd, samp', {
  fontFamily: vars.font.mono,
})
