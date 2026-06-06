// styles/global.css.ts
import { globalStyle } from '@vanilla-extract/css'
import { vars } from './tokens.css'

globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
})

globalStyle('html', {
  scrollBehavior: 'smooth',
})

globalStyle('body', {
  backgroundColor: vars.color.bg,
  color: vars.color.textPrimary,
  fontFamily: vars.font.body,
  lineHeight: '1.6',
  overflowX: 'hidden',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})

globalStyle('::-webkit-scrollbar', {
  width: '6px',
})

globalStyle('::-webkit-scrollbar-track', {
  background: vars.color.bg,
})

globalStyle('::-webkit-scrollbar-thumb', {
  background: vars.color.border,
  borderRadius: '3px',
})

globalStyle('a', {
  color: 'inherit',
  textDecoration: 'none',
})
