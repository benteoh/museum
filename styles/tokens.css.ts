// styles/tokens.css.ts
import { createGlobalTheme } from '@vanilla-extract/css'

export const vars = createGlobalTheme(':root', {
  color: {
    bg: '#0D0F14',
    surface: '#151820',
    border: '#1E2330',
    accent: '#B8D4E8',
    accentDim: '#6A9AB8',
    textPrimary: '#E8EDF2',
    textSecondary: '#6B7280',
    monoTag: '#3D5A73',
    statusLive: '#4ADE80',
    statusWip: '#F59E0B',
  },
  font: {
    display: 'var(--font-space-grotesk)',
    body: 'var(--font-instrument-sans)',
    mono: 'var(--font-jetbrains-mono)',
  },
  ease: {
    // Signature easing — mirrors the [0.16, 1, 0.3, 1] tuple used by Framer tokens in lib/motion.ts
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  space: {
    px1: '4px',
    px2: '8px',
    px3: '12px',
    px4: '16px',
    px6: '24px',
    px8: '32px',
    px12: '48px',
    px16: '64px',
    px24: '96px',
    px32: '128px',
  },
})
