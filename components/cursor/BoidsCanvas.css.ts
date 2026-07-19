// components/cursor/BoidsCanvas.css.ts
import { style } from '@vanilla-extract/css'

// Stacking lives on the wrapper, so the canvas itself carries none.
const base = {
  position: 'fixed',
  inset: 0,
  width: '100vw',
  height: '100vh',
  pointerEvents: 'none',
} as const

export const canvas = style(base)

// The liquid-ink pipeline: droplet sprites on the canvas, fused by the goo
// filter (blur + alpha threshold) defined inline in BoidsCanvas. The slight
// opacity is the ink-wash translucency — applied after the filter, so the
// liquid edges stay crisp while the wash stays light on the page.
export const gooCanvas = style({
  ...base,
  filter: 'url(#boids-goo)',
  opacity: 0.85,
})

export const gooDefs = style({
  position: 'absolute',
  width: 0,
  height: 0,
})
