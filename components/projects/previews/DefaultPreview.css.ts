// components/projects/previews/DefaultPreview.css.ts
import { style, keyframes } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

const drift = keyframes({
  '0%, 100%': { backgroundPosition: '0% 50%' },
  '50%': { backgroundPosition: '100% 50%' },
})

export const root = style({
  width: '100%',
  height: '100%',
  // --tint is set inline per project; falls back to the surface colour.
  background: `linear-gradient(135deg, var(--tint, ${vars.color.surface}), ${vars.color.bg})`,
  backgroundSize: '200% 200%',
  animation: `${drift} 8000ms ${vars.ease.out} infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
})
