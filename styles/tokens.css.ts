// styles/tokens.css.ts
import { createGlobalTheme } from '@vanilla-extract/css'

export const vars = createGlobalTheme(':root', {
  color: {
    // Paper world (bright atelier)
    bg: '#E7DCC1',
    surface: '#F3ECD8',
    border: '#C7B693',
    inkFaint: '#9C8C6B',
    accent: '#8C4F32',
    accentDim: '#A97B5D',
    textPrimary: '#382C19',
    textSecondary: '#6B5C42',
    monoTag: '#7A5F38',
    statusLive: '#5F7E52',
    statusWip: '#B08A2E',
    sheetShadow: 'rgba(56, 44, 25, 0.18)',
    // Marble-dusk world — reserved for detail pages (Phase 5)
    duskBg: '#171310',
    duskSurface: '#221C15',
    duskText: '#E6DCC4',
    duskTorch: '#D89B54',
  },
  font: {
    display: 'var(--font-cinzel)',
    body: 'var(--font-eb-garamond)',
    hand: 'var(--font-caveat)',
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
