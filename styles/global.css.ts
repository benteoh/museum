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

// Procedural paper fibre — SVG fractalNoise, tiled. Alpha kept ≤0.06 per the
// visual brief so text contrast is unaffected.
const paperNoise = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0.30 0 0 0 0 0.24 0 0 0 0 0.13 0 0 0 0.05 0'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>")`

globalStyle('body', {
  backgroundColor: vars.color.bg,
  backgroundImage: `${paperNoise}, radial-gradient(ellipse at 50% 40%, rgba(243, 236, 216, 0.55) 0%, rgba(56, 44, 25, 0.08) 100%)`,
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
