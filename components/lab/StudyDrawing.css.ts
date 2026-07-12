// components/lab/StudyDrawing.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const drawing = style({
  width: '100%',
  height: '100%',
  color: vars.color.textSecondary,
})

export const ruled = style({
  color: vars.color.inkFaint,
})
