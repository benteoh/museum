// components/vision/VisionScene.css.ts
// The Vision: glass project frames floating over the Florence vista.
// Glass whites/warm-light literals in this file are the material language of
// the panes (refraction, specular, sun-glow) sampled from the approved vista
// still — documented exception to the tokens-only rule, alongside the
// light-on-dark type cases (frameTitle, curatorNote base).
import { globalStyle, style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const section = style({
  position: 'relative',
})

export const sticky = style({
  position: 'sticky',
  top: 0,
  height: '100vh',
  overflow: 'hidden',
})

// Generated vista when present; golden-hour gradient placeholder otherwise.
export const backdrop = style({
  position: 'absolute',
  inset: 0,
  background: `
    radial-gradient(ellipse 60% 50% at 18% 62%, rgba(255, 214, 150, 0.55) 0%, rgba(255, 214, 150, 0) 70%),
    linear-gradient(
      to bottom,
      #F6D7A0 0%,
      #EFBF82 38%,
      #E39E5C 58%,
      #C98B4E 66%,
      #9A7B3F 78%,
      #6E5A2E 100%
    )
  `,
})

export const backdropImage = style({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
})

// Gentle grounding shadow at the foot of the viewport.
export const grounding = style({
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  height: '18vh',
  background: 'linear-gradient(to top, rgba(56, 44, 25, 0.28), transparent)',
  pointerEvents: 'none',
})

export const track = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '5vw',
  height: '100vh',
  paddingLeft: '16vw',
  paddingRight: '16vw',
  width: 'max-content',
})

export const frameSlot = style({
  flex: '0 0 auto',
  width: 'clamp(300px, 30vw, 480px)',
})

// The frame is a link into the project detail. Focus gets a light glow ring
// on the glass itself (below) rather than a default outline.
export const paneLink = style({
  display: 'block',
  borderRadius: '18px',
  textDecoration: 'none',
  color: 'inherit',
  outline: 'none',
  WebkitTapHighlightColor: 'transparent',
})

// The imagined pane — liquid glass over the vista.
export const glass = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  aspectRatio: '7 / 6',
  borderRadius: '18px',
  overflow: 'hidden',
  background: 'rgba(255, 252, 244, 0.10)',
  backdropFilter: 'blur(10px) saturate(1.15)',
  border: '1px solid rgba(255, 250, 235, 0.42)',
  // Chromatic edge hint: cool split on the sun-facing top edge, warm on the
  // bottom — a whisper of refraction. Deepens slightly on hover.
  boxShadow:
    'inset 0 1px 1px rgba(224, 240, 255, 0.38), inset 0 2px 6px rgba(255, 252, 240, 0.18), inset 0 -1px 1px rgba(255, 214, 165, 0.32), 0 18px 44px rgba(56, 44, 25, 0.28)',
  transition: 'box-shadow 600ms cubic-bezier(0.16, 1, 0.3, 1)',
  selectors: {
    '&:hover': {
      boxShadow:
        'inset 0 1px 1px rgba(224, 240, 255, 0.5), inset 0 2px 6px rgba(255, 252, 240, 0.24), inset 0 -1px 1px rgba(255, 214, 165, 0.4), 0 26px 60px rgba(56, 44, 25, 0.34)',
    },
    // Keyboard focus: a light outer glow ring on the glass — the sun catching
    // the pane's edge — instead of a default outline.
    [`${paneLink}:focus-visible &`]: {
      boxShadow:
        'inset 0 1px 1px rgba(224, 240, 255, 0.5), inset 0 2px 6px rgba(255, 252, 240, 0.24), inset 0 -1px 1px rgba(255, 214, 165, 0.4), 0 0 0 3px rgba(255, 248, 236, 0.85), 0 0 28px 6px rgba(255, 236, 190, 0.55), 0 26px 60px rgba(56, 44, 25, 0.34)',
    },
  },
})

export const plate = style({
  position: 'relative',
  flex: 1,
  overflow: 'hidden',
  margin: '10px 10px 0',
  borderRadius: '10px',
})

export const caption = style({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: vars.space.px3,
  padding: `${vars.space.px2} ${vars.space.px4} ${vars.space.px3}`,
})

export const frameTitle = style({
  fontFamily: vars.font.display,
  fontSize: '1.05rem',
  fontWeight: 400,
  letterSpacing: '0.04em',
  color: '#FFF8EC',
  textShadow: '0 1px 12px rgba(56, 44, 25, 0.45)',
})

export const frameTags = style({
  display: 'flex',
  gap: vars.space.px2,
  fontFamily: vars.font.hand,
  fontSize: '0.9rem',
  color: 'rgba(255, 248, 236, 0.85)',
  textShadow: '0 1px 8px rgba(56, 44, 25, 0.4)',
})

export const defs = style({
  position: 'absolute',
  width: 0,
  height: 0,
})

// ——— The curator's hand-note, written over the vista ———

export const curatorNote = style({
  position: 'absolute',
  bottom: '7vh',
  left: '6vw',
  zIndex: 2,
  maxWidth: 'min(34vw, 380px)',
  fontFamily: vars.font.hand,
  fontSize: '1.45rem',
  lineHeight: 1.35,
  color: vars.color.duskText,
  textShadow: '0 1px 14px rgba(56, 44, 25, 0.55)',
  transform: 'rotate(-2deg)',
  pointerEvents: 'none',
})

// ——— Mobile: vertical stack on native scroll (adapted, not reduced) ———

export const stackSection = style({
  position: 'relative',
})

// The vista holds behind the stack: a full-height holder carries a sticky
// viewport, so the image stays put while frames scroll over it — and is
// correctly clamped to the section's bounds (a negative-margin sticky would
// slide past them and bleed under the coda).
export const stackBackdropHolder = style({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
})

export const stackBackdrop = style({
  position: 'sticky',
  top: 0,
  height: '100vh',
  overflow: 'hidden',
})

export const stackContent = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '9vh',
  padding: '14vh 6vw 16vh',
})

export const curatorNoteStack = style({
  alignSelf: 'flex-start',
  maxWidth: '70vw',
  fontFamily: vars.font.hand,
  fontSize: '1.35rem',
  lineHeight: 1.35,
  color: vars.color.duskText,
  textShadow: '0 1px 14px rgba(56, 44, 25, 0.55)',
  transform: 'rotate(-2deg)',
  margin: 0,
})

// ——— Static tier: the settled composition, no pin, no motion ———

export const staticSection = style({
  position: 'relative',
  minHeight: '100vh',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

export const staticGrid = style({
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 380px))',
  justifyContent: 'center',
  gap: vars.space.px8,
  padding: `${vars.space.px16} ${vars.space.px8}`,
  maxWidth: '1100px',
})

// Frame slots carry a viewport-relative width for the rail; inside the
// static grid they must fill their column instead.
globalStyle(`${staticGrid} > *`, {
  width: '100%',
})
