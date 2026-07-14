import { keyframes, style } from '@vanilla-extract/css'

const drawStroke = keyframes({
  from: { strokeDashoffset: 'var(--stroke-length)' },
  to: { strokeDashoffset: 0 },
})

const assemble = keyframes({
  '0%, 100%': { transform: 'translate(0, 0)' },
  '50%': { transform: 'translate(2px, -1.5px)' },
})

export const root = style({
  width: '100%',
  height: '100%',
  display: 'block',
  overflow: 'hidden',
  pointerEvents: 'none',
})

export const glass = style({
  filter: 'drop-shadow(0 0 3px color-mix(in srgb, currentColor 32%, transparent))',
})

export const drawnStroke = style({
  strokeDashoffset: 0,
})

export const drawOn = style({
  animationName: drawStroke,
  animationDuration: '850ms',
  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  animationFillMode: 'forwards',
})

export const assembling = style({
  transformBox: 'fill-box',
  transformOrigin: 'center',
  animation: `${assemble} 7.5s ease-in-out 1.8s infinite`,
})
