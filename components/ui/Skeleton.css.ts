// components/ui/Skeleton.css.ts
import { style, keyframes } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

const pulse = keyframes({
  '0%, 100%': { opacity: 0.5 },
  '50%': { opacity: 0.9 },
})

export const skeleton = style({
  display: 'block',
  backgroundColor: vars.color.border,
  borderRadius: '4px',
  animation: `${pulse} 1600ms ${vars.ease.out} infinite`,
})
