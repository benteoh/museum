# Living Codex — Phase 0 & 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the site's ground layer from dark night-gallery to bright parchment (Living Codex Phase 0–1): v2 visual brief, dual-world token palette, Renaissance type system, procedural paper texture, torn-edge sheet component, and the home gallery re-laid as strewn manuscript sheets.

**Architecture:** All colour flows through vanilla-extract tokens in `styles/tokens.css.ts`, so the rebrand is mostly a token-value swap — existing components re-skin automatically. New pure-math modules (`tornEdge.ts`, `scatter.ts`) generate deterministic torn-paper clip paths and sheet scatter transforms; a `TornSheet` component applies them via SVG `clipPath` with `objectBoundingBox` units. `ExhibitionPanel` swaps its glass-vitrine look for a manuscript sheet.

**Tech Stack:** Next.js 16.2.7 (webpack, static export), React 19, vanilla-extract, framer-motion 12, Velite content, Vitest + Testing Library (jsdom), pnpm.

## Global Constraints

- **Read `node_modules/next/dist/docs/` before writing any Next.js-specific code** — this Next version differs from training data (AGENTS.md).
- Spec/design docs stay **uncommitted** until the user explicitly says to commit them (user preference). Code commits are normal and frequent.
- Fonts load via `next/font/google` with CSS variables, following the existing pattern in `app/layout.tsx`.
- All new colours go through `vars.color.*` — no hardcoded hex in component CSS.
- Respect `prefers-reduced-motion` for any new animation (none introduced in this plan — scatter transforms are static).
- Tests: `pnpm test` (vitest run). Build: `pnpm build`. Dev: `pnpm dev`.
- Reference spec: `docs/superpowers/specs/2026-07-02-living-codex-design.md`.

## File Structure

```
docs/superpowers/specs/visual-brief.md      REWRITE  v2 brief (Task 1, uncommitted)
styles/tokens.css.ts                        MODIFY   paper palette + dusk reserve + font vars (Task 2)
app/layout.tsx                              MODIFY   font swap: Cinzel/EB Garamond/Caveat (Task 2)
styles/typography.css.ts                    MODIFY   heading weight for Cinzel (Task 2)
styles/global.css.ts                        MODIFY   parchment ground: noise + vignette (Task 3)
components/paper/tornEdge.ts                CREATE   pure math: PRNG, seed hash, torn path (Task 4)
tests/components/paper/tornEdge.test.ts     CREATE   (Task 4)
components/paper/TornSheet.tsx              CREATE   clip-path wrapper component (Task 5)
components/paper/TornSheet.css.ts           CREATE   (Task 5)
tests/components/paper/TornSheet.test.tsx   CREATE   (Task 5)
components/paper/scatter.ts                 CREATE   pure math: sheet scatter (Task 6)
tests/components/paper/scatter.test.ts      CREATE   (Task 6)
components/gallery/ExhibitionPanel.tsx      MODIFY   manuscript sheet (Task 6)
components/gallery/ExhibitionPanel.css.ts   MODIFY   manuscript sheet styles (Task 6)
(various *.css.ts)                          MODIFY   hardcoded old-palette colour sweep (Task 7)
```

---

### Task 1: Visual Brief v2 (doc only — no code, no commit)

**Files:**
- Rewrite: `docs/superpowers/specs/visual-brief.md`

**Interfaces:**
- Consumes: `docs/superpowers/specs/2026-07-02-living-codex-design.md` (locked decisions)
- Produces: the palette hexes and type choices that Task 2 copies verbatim into `tokens.css.ts`

- [ ] **Step 1: Replace the file content**

Overwrite `docs/superpowers/specs/visual-brief.md` with:

```markdown
# Museum of Little Things — Visual Brief
**Version 2.0 | 2026-07-02**
**Status: Supersedes v1 (dark night-gallery). Art direction: The Living Codex — da Vinci manuscript + Greek marble + physics.**

## Aesthetic-to-Constraint Table

| Mood | Sensory target | Constraint |
|---|---|---|
| Quiet | Nothing competes for attention | Max transition duration: 900ms. No simultaneous animations. |
| Archival | Old, handled, real | Paper noise: SVG fractalNoise `baseFrequency 0.8, numOctaves 2`, alpha ≤ 0.06. No clean flat surfaces. |
| Heavy | Things have mass | Gallery spring: `stiffness 40–70, damping 18–24`. Sheets settle, never snap. |
| Luxurious | Slow, deliberate, unhurried | Minimum transition duration: 500ms. Only link underlines may be snappy. |
| Drawn | Everything begins as ink | Line-work (previews, annotations) animates stroke-first; fills come second. |

## Dual-World Palette

**Paper world (home, index — bright atelier):**

| Token | Hex | Role |
|---|---|---|
| bg | `#E7DCC1` | Parchment ground |
| surface | `#F3ECD8` | Fresh sheet |
| border | `#C7B693` | Sheet edges, rules |
| inkFaint | `#9C8C6B` | Ruled lines, hairlines |
| textPrimary | `#382C19` | Iron-gall ink |
| textSecondary | `#6B5C42` | Faded ink |
| accent | `#8C4F32` | Red chalk (sanguine) — highlights, active states |
| accentDim | `#A97B5D` | Red chalk, faded |
| monoTag | `#7A5F38` | Annotations, tags |
| statusLive | `#5F7E52` | Verdigris |
| statusWip | `#B08A2E` | Ochre |
| sheetShadow | `rgba(56, 44, 25, 0.18)` | Sheet drop shadows |

**Marble-dusk world (detail pages — Phase 5; reserved in tokens now):**

| Token | Hex | Role |
|---|---|---|
| duskBg | `#171310` | Torch-lit hall |
| duskSurface | `#221C15` | Stone in shadow |
| duskText | `#E6DCC4` | Warm marble white |
| duskTorch | `#D89B54` | Torch warmth — accents, plaque engraving |

The tear transition carries the palette shift; the activated exhibit is the brightest object in the dusk room.

## Type System

| Role | Face | Weights | Rationale |
|---|---|---|---|
| Display / headings | **Cinzel** | 400, 700 | Based on Trajan's Column inscriptions — the marble voice |
| Body | **EB Garamond** | 400, 500, italic | Renaissance bookface — the manuscript voice |
| Annotations / tags | **Caveat** | 400 | Hand-italic marginalia, used sparingly |
| Code | **JetBrains Mono** | 400 | Unchanged — code is code |

## Material Targets (Phase 7 / R3F)

| Material | Roughness | Metalness | Transmission | Notes |
|---|---|---|---|---|
| Aged paper | 0.75–0.85 | 0.0 | 0.0 | Warm fibre texture, torn edges |
| Greek marble | 0.15–0.25 | 0.0 | 0.1–0.2 | Veining via roughness map, slight translucency |
| Torch light | — | — | — | Warm HDRI (Poly Haven, candlelit/sunset family) — replaces v1 "studio" |

## Camera Personality

*"Unhurried museum guide — glides between exhibits with quiet authority, no rush."* Spring start: `stiffness 40, damping 20`.

## Performance Floor

Unchanged from v1: 2020 MacBook Air M1 at 60fps; mid-range Android 30fps with reduced effects; `hardwareConcurrency ≤ 2` or `deviceMemory < 4GB` → static fallback.

## Audio

Unchanged from v1: yes, ambient paper-and-stone loop, `volume 0.15`, default off, mute in Nav, `localStorage('museum-muted')`.

## Mobile Stance

Adapted, not reduced: same world, sheets stack in a scrollable pile, tap replaces hover, no cursor boids/paper physics.
```

- [ ] **Step 2: Do NOT commit**

Leave the file uncommitted (user preference: spec docs stay uncommitted until explicitly approved).

---

### Task 2: Token & Type Rebrand

**Files:**
- Modify: `styles/tokens.css.ts`
- Modify: `app/layout.tsx`
- Modify: `styles/typography.css.ts`

**Interfaces:**
- Consumes: palette hexes from Task 1 (copied verbatim below — no need to re-read the brief)
- Produces: `vars.color.{bg,surface,border,inkFaint,textPrimary,textSecondary,accent,accentDim,monoTag,statusLive,statusWip,sheetShadow,duskBg,duskSurface,duskText,duskTorch}` and `vars.font.{display,body,hand,mono}` — Tasks 3–7 rely on these exact names.

- [ ] **Step 1: Check the Next.js font docs**

Read `node_modules/next/dist/docs/` for the fonts guide (e.g. `Glob node_modules/next/dist/docs/**/*font*`) and confirm the `next/font/google` import-and-variable pattern used in `app/layout.tsx` is still current in this version. Adjust Step 3 if the API differs.

- [ ] **Step 2: Rewrite `styles/tokens.css.ts`**

```ts
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
```

Note: every pre-existing key is kept (only values change) so all consumers compile; `inkFaint`, `sheetShadow`, `hand`, and the four `dusk*` keys are additive.

- [ ] **Step 3: Swap fonts in `app/layout.tsx`**

Replace the three font constants and the `<html>` className list (keep everything else — Nav, BoidsCanvasWrapper, PageTransition, view-transition style block — untouched):

```tsx
import { Cinzel, EB_Garamond, Caveat, JetBrains_Mono } from 'next/font/google'

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-cinzel',
  display: 'swap',
})

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-eb-garamond',
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-caveat',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})
```

And on `<html>`:

```tsx
className={`${cinzel.variable} ${ebGaramond.variable} ${caveat.variable} ${jetbrainsMono.variable}`}
```

- [ ] **Step 4: Adjust `styles/typography.css.ts` for Cinzel**

Cinzel has no 300 weight. Replace the heading rule:

```ts
globalStyle('h1, h2, h3, h4, h5, h6', {
  fontFamily: vars.font.display,
  fontWeight: 400,
  lineHeight: 1.2,
  letterSpacing: '0.02em',
  color: vars.color.textPrimary,
})
```

Leave the `p` and `code` rules unchanged.

- [ ] **Step 5: Verify build and existing tests**

Run: `pnpm test` → Expected: all existing suites PASS (they test math/queries, not colours).
Run: `pnpm build` → Expected: build succeeds.

- [ ] **Step 6: Visual smoke check**

Run `pnpm dev`, open `/`. Expected: parchment background, dark-ink text, Cinzel headings. Old dark panels/cards will look wrong in places (hardcoded colours) — that is Task 7's job, not a failure here.

- [ ] **Step 7: Commit**

```bash
git add styles/tokens.css.ts app/layout.tsx styles/typography.css.ts
git commit -m "feat: living codex token and type rebrand (parchment palette, Cinzel/Garamond/Caveat)"
```

---

### Task 3: Parchment Ground Texture

**Files:**
- Modify: `styles/global.css.ts`

**Interfaces:**
- Consumes: `vars.color.bg` from Task 2
- Produces: body-level paper texture; no exports

- [ ] **Step 1: Add noise + vignette to the body style**

In `styles/global.css.ts`, add above the `globalStyle('body', …)` call:

```ts
// Procedural paper fibre — SVG fractalNoise, tiled. Alpha kept ≤0.06 per the
// visual brief so text contrast is unaffected.
const paperNoise = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0.30 0 0 0 0 0.24 0 0 0 0 0.13 0 0 0 0.05 0'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>")`
```

Then extend the body rule (keep existing properties):

```ts
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
```

- [ ] **Step 2: Verify in browser**

`pnpm dev`, open `/`, zoom to 100%. Expected: visible-but-subtle grain on the parchment, brighter centre, gently darkened edges (reading-desk vignette). Confirm body text is still comfortably legible.

- [ ] **Step 3: Run build**

Run: `pnpm build` → Expected: succeeds (vanilla-extract accepts the data-URI string).

- [ ] **Step 4: Commit**

```bash
git add styles/global.css.ts
git commit -m "feat: procedural parchment ground (fractalNoise fibre + desk vignette)"
```

---

### Task 4: Torn-Edge Math (`tornEdge.ts`)

**Files:**
- Create: `components/paper/tornEdge.ts`
- Test: `tests/components/paper/tornEdge.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `mulberry32(seed: number): () => number` — deterministic PRNG in [0, 1)
  - `hashSeed(s: string): number` — FNV-1a string → uint32
  - `tornEdgePath(opts: { width: number; height: number; seed: number; roughness?: number; segments?: number }): string` — closed SVG path (`M … Z`)
  - Task 5 (`TornSheet`) and Task 6 (`scatter.ts`) import from this module

- [ ] **Step 1: Write the failing tests**

Create `tests/components/paper/tornEdge.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mulberry32, hashSeed, tornEdgePath } from '@/components/paper/tornEdge'

describe('mulberry32', () => {
  it('is deterministic for the same seed', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })

  it('produces values in [0, 1)', () => {
    const rand = mulberry32(7)
    for (let i = 0; i < 1000; i++) {
      const v = rand()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('hashSeed', () => {
  it('is deterministic and differs across strings', () => {
    expect(hashSeed('skyhive')).toBe(hashSeed('skyhive'))
    expect(hashSeed('skyhive')).not.toBe(hashSeed('museum-of-little-things'))
  })

  it('returns an unsigned 32-bit integer', () => {
    const h = hashSeed('anything')
    expect(Number.isInteger(h)).toBe(true)
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThanOrEqual(0xffffffff)
  })
})

describe('tornEdgePath', () => {
  const opts = { width: 1, height: 1, seed: 123 }

  it('is deterministic for the same seed', () => {
    expect(tornEdgePath(opts)).toBe(tornEdgePath({ ...opts }))
  })

  it('differs across seeds', () => {
    expect(tornEdgePath(opts)).not.toBe(tornEdgePath({ ...opts, seed: 124 }))
  })

  it('produces a closed path', () => {
    const d = tornEdgePath(opts)
    expect(d.startsWith('M ')).toBe(true)
    expect(d.endsWith(' Z')).toBe(true)
  })

  it('keeps every coordinate within roughness of the unit box', () => {
    const roughness = 0.015
    const d = tornEdgePath({ ...opts, roughness })
    const nums = d.match(/-?\d+(\.\d+)?/g)!.map(Number)
    for (const n of nums) {
      expect(n).toBeGreaterThanOrEqual(-roughness)
      expect(n).toBeLessThanOrEqual(1 + roughness)
    }
  })

  it('has one point per segment per edge (4 * segments points)', () => {
    const d = tornEdgePath({ ...opts, segments: 10 })
    const commands = d.match(/[ML]/g)!
    expect(commands.length).toBe(40)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test tests/components/paper/tornEdge.test.ts`
Expected: FAIL — cannot resolve `@/components/paper/tornEdge`.

- [ ] **Step 3: Implement `components/paper/tornEdge.ts`**

```ts
// components/paper/tornEdge.ts
// Pure math for procedural torn-paper edges. No DOM, no React — unit-testable.

/** Deterministic PRNG (mulberry32). Same seed → same sequence. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** FNV-1a hash of a string to an unsigned 32-bit int — stable seeds from slugs. */
export function hashSeed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

type TornEdgeOptions = {
  width: number
  height: number
  seed: number
  /** Max perpendicular jitter as a fraction of the box (default 0.015). */
  roughness?: number
  /** Points per edge (default 18). */
  segments?: number
}

/**
 * Closed SVG path tracing the box perimeter with jittered points — a torn
 * sheet outline. With width/height = 1 the path suits objectBoundingBox
 * clipPath units. Points are clamped to [-roughness, size + roughness].
 */
export function tornEdgePath({ width, height, seed, roughness = 0.015, segments = 18 }: TornEdgeOptions): string {
  const rand = mulberry32(seed)
  const jitter = (scale: number) => {
    const r = (rand() * 2 - 1) * roughness * scale
    return Math.max(-roughness * scale, Math.min(roughness * scale, r))
  }
  const pts: Array<[number, number]> = []
  // top: left → right
  for (let i = 0; i < segments; i++) pts.push([(i / segments) * width, jitter(height)])
  // right: top → bottom
  for (let i = 0; i < segments; i++) pts.push([width + jitter(width), (i / segments) * height])
  // bottom: right → left
  for (let i = 0; i < segments; i++) pts.push([width - (i / segments) * width, height + jitter(height)])
  // left: bottom → top
  for (let i = 0; i < segments; i++) pts.push([jitter(width), height - (i / segments) * height])

  const [first, ...rest] = pts
  const fmt = (n: number) => Number(n.toFixed(4)).toString()
  return `M ${fmt(first[0])} ${fmt(first[1])} ${rest.map(([x, y]) => `L ${fmt(x)} ${fmt(y)}`).join(' ')} Z`
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test tests/components/paper/tornEdge.test.ts`
Expected: PASS (all suites).

- [ ] **Step 5: Commit**

```bash
git add components/paper/tornEdge.ts tests/components/paper/tornEdge.test.ts
git commit -m "feat: pure tornEdge module (seeded PRNG, slug hash, torn-paper SVG path)"
```

---

### Task 5: TornSheet Component

**Files:**
- Create: `components/paper/TornSheet.tsx`
- Create: `components/paper/TornSheet.css.ts`
- Test: `tests/components/paper/TornSheet.test.tsx`

**Interfaces:**
- Consumes: `tornEdgePath`, `hashSeed` from `components/paper/tornEdge.ts` (Task 4)
- Produces: `TornSheet({ seed: string; className?: string; children: React.ReactNode })` — clips its children to a deterministic torn-paper outline. Task 6 wraps panel content in it.

- [ ] **Step 1: Write the failing test**

Create `tests/components/paper/TornSheet.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TornSheet } from '@/components/paper/TornSheet'

describe('TornSheet', () => {
  it('renders its children', () => {
    render(
      <TornSheet seed="skyhive">
        <p>exhibit</p>
      </TornSheet>,
    )
    expect(screen.getByText('exhibit')).toBeInTheDocument()
  })

  it('clips content with a referenced SVG clipPath', () => {
    const { container } = render(
      <TornSheet seed="skyhive">
        <p>exhibit</p>
      </TornSheet>,
    )
    const clipPath = container.querySelector('clipPath')
    expect(clipPath).not.toBeNull()
    expect(clipPath!.getAttribute('clipPathUnits')).toBe('objectBoundingBox')
    const clipped = container.querySelector(`[style*="clip-path"]`) as HTMLElement
    expect(clipped.style.clipPath).toContain(`url(#${clipPath!.id})`)
  })

  it('produces the same path for the same seed', () => {
    const a = render(<TornSheet seed="same">x</TornSheet>).container.querySelector('path')!
    const b = render(<TornSheet seed="same">y</TornSheet>).container.querySelector('path')!
    expect(a.getAttribute('d')).toBe(b.getAttribute('d'))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/components/paper/TornSheet.test.tsx`
Expected: FAIL — cannot resolve `@/components/paper/TornSheet`.

- [ ] **Step 3: Implement the component**

Create `components/paper/TornSheet.css.ts`:

```ts
// components/paper/TornSheet.css.ts
import { style } from '@vanilla-extract/css'

export const root = style({
  position: 'relative',
  width: '100%',
  height: '100%',
})

// Zero-size holder for the <clipPath> def — must stay in the DOM.
export const defs = style({
  position: 'absolute',
  width: 0,
  height: 0,
})
```

Create `components/paper/TornSheet.tsx`:

```tsx
'use client'

// components/paper/TornSheet.tsx
import { useId, useMemo } from 'react'
import { tornEdgePath, hashSeed } from './tornEdge'
import * as styles from './TornSheet.css'

type Props = {
  /** Any stable string (e.g. project slug) — same seed, same tear. */
  seed: string
  className?: string
  children: React.ReactNode
}

export function TornSheet({ seed, className, children }: Props) {
  const rawId = useId()
  const clipId = `torn-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const d = useMemo(() => tornEdgePath({ width: 1, height: 1, seed: hashSeed(seed) }), [seed])

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={{ clipPath: `url(#${clipId})` }}
    >
      <svg aria-hidden className={styles.defs}>
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={d} />
          </clipPath>
        </defs>
      </svg>
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/components/paper/TornSheet.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/paper/TornSheet.tsx components/paper/TornSheet.css.ts tests/components/paper/TornSheet.test.tsx
git commit -m "feat: TornSheet component — torn-paper clip wrapper"
```

---

### Task 6: Scatter Math + Manuscript ExhibitionPanel

**Files:**
- Create: `components/paper/scatter.ts`
- Test: `tests/components/paper/scatter.test.ts`
- Modify: `components/gallery/ExhibitionPanel.tsx`
- Modify: `components/gallery/ExhibitionPanel.css.ts`

**Interfaces:**
- Consumes: `mulberry32` (Task 4), `TornSheet` (Task 5), `vars.color.{surface,inkFaint,textPrimary,monoTag,sheetShadow}` and `vars.font.{display,hand}` (Task 2)
- Produces: `sheetScatter(index: number): { rotate: number; dx: number; dy: number }`; the re-skinned home gallery panel. `GalleryTrack.tsx` is untouched (its props to `ExhibitionPanel` don't change).

- [ ] **Step 1: Write the failing scatter tests**

Create `tests/components/paper/scatter.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { sheetScatter } from '@/components/paper/scatter'

describe('sheetScatter', () => {
  it('is deterministic per index', () => {
    expect(sheetScatter(3)).toEqual(sheetScatter(3))
  })

  it('differs across indices', () => {
    expect(sheetScatter(0)).not.toEqual(sheetScatter(1))
  })

  it('stays within its bounds for the first 50 indices', () => {
    for (let i = 0; i < 50; i++) {
      const s = sheetScatter(i)
      expect(Math.abs(s.rotate)).toBeLessThanOrEqual(3.5)
      expect(Math.abs(s.dx)).toBeLessThanOrEqual(12)
      expect(Math.abs(s.dy)).toBeLessThanOrEqual(16)
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/components/paper/scatter.test.ts`
Expected: FAIL — cannot resolve `@/components/paper/scatter`.

- [ ] **Step 3: Implement `components/paper/scatter.ts`**

```ts
// components/paper/scatter.ts
// Deterministic "strewn on a desk" transform per sheet index.
import { mulberry32 } from './tornEdge'

export type SheetScatter = {
  /** degrees, ±3.5 */
  rotate: number
  /** px, ±12 */
  dx: number
  /** px, ±16 */
  dy: number
}

export function sheetScatter(index: number): SheetScatter {
  const rand = mulberry32((index + 1) * 7919)
  return {
    rotate: (rand() * 2 - 1) * 3.5,
    dx: (rand() * 2 - 1) * 12,
    dy: (rand() * 2 - 1) * 16,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/components/paper/scatter.test.ts`
Expected: PASS.

- [ ] **Step 5: Re-skin `components/gallery/ExhibitionPanel.css.ts`**

Replace the file content:

```ts
// components/gallery/ExhibitionPanel.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

// drop-shadow (not box-shadow) so the shadow follows the torn clip outline.
export const link = style({
  flex: '0 0 auto',
  display: 'block',
  filter: `drop-shadow(0 10px 18px ${vars.color.sheetShadow})`,
  transition: `filter 500ms ${vars.ease.out}`,
  ':hover': {
    filter: `drop-shadow(0 16px 28px ${vars.color.sheetShadow})`,
  },
})

export const sheetWrap = style({
  width: 'clamp(320px, 40vw, 560px)',
  height: '70vh',
})

// The manuscript sheet itself — clipped by TornSheet.
export const sheet = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  backgroundColor: vars.color.surface,
})

// Preview area — the "plate" (illustration) on the sheet.
export const plate = style({
  position: 'relative',
  flex: 1,
  overflow: 'hidden',
})

// Caption strip beneath the plate, like a folio colophon.
export const colophon = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.px1,
  padding: `${vars.space.px3} ${vars.space.px6} ${vars.space.px4}`,
  borderTop: `1px solid ${vars.color.inkFaint}`,
})

export const title = style({
  fontFamily: vars.font.display,
  fontSize: '1.25rem',
  fontWeight: 400,
  letterSpacing: '0.03em',
  color: vars.color.textPrimary,
})

export const meta = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space.px2,
  fontFamily: vars.font.hand,
  fontSize: '0.95rem',
  color: vars.color.monoTag,
})
```

- [ ] **Step 6: Re-skin `components/gallery/ExhibitionPanel.tsx`**

Replace the file content (props are unchanged; the old `rotateY` vitrine tilt is replaced by the 2D scatter):

```tsx
// components/gallery/ExhibitionPanel.tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ProjectPreview } from '@/components/projects/ProjectPreview'
import type { ProjectCardData } from '@/components/projects/ProjectCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { TornSheet } from '@/components/paper/TornSheet'
import { sheetScatter } from '@/components/paper/scatter'
import { tokens } from '@/lib/motion'
import * as styles from './ExhibitionPanel.css'

type Props = {
  project: ProjectCardData
  index: number
  activeIndex: number
}

export function ExhibitionPanel({ project, index, activeIndex }: Props) {
  const isActive = index === activeIndex
  const scatter = sheetScatter(index)

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={styles.link}
      style={{ viewTransitionName: `panel-${project.slug}` } as React.CSSProperties}
    >
      <motion.article
        className={styles.sheetWrap}
        initial={false}
        animate={{
          rotate: isActive ? scatter.rotate * 0.3 : scatter.rotate,
          x: scatter.dx,
          y: scatter.dy,
          scale: isActive ? 1.03 : 1,
        }}
        transition={tokens.standard}
      >
        <TornSheet seed={project.slug}>
          <div className={styles.sheet}>
            <div className={styles.plate}>
              <ProjectPreview
                slug={project.slug}
                heroImage={project.heroImage}
                heroColour={project.heroColour}
                title={project.title}
              />
            </div>
            <div className={styles.colophon}>
              <h3 className={styles.title}>{project.title}</h3>
              <div className={styles.meta}>
                {project.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </TornSheet>
      </motion.article>
    </Link>
  )
}

/** Placeholder sheet shown when there is no project content yet. */
export function ExhibitionPanelSkeleton() {
  return (
    <div className={styles.link}>
      <div className={styles.sheetWrap}>
        <Skeleton width="100%" height="100%" radius="0" />
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Run the full test suite and build**

Run: `pnpm test` → Expected: PASS (including existing `resolvePreview`, `galleryMath`, `useBoids` suites).
Run: `pnpm build` → Expected: succeeds.

- [ ] **Step 8: Visual check**

`pnpm dev`, open `/`, scroll through the gallery. Expected: sheets sit on parchment with torn edges, slight individual rotation/offset (strewn desk), the active sheet straightens slightly and scales up. Dark canvas previews look like dark plates on paper — acceptable until Phase 2 (ink previews).

- [ ] **Step 9: Commit**

```bash
git add components/paper/scatter.ts tests/components/paper/scatter.test.ts components/gallery/ExhibitionPanel.tsx components/gallery/ExhibitionPanel.css.ts
git commit -m "feat: manuscript sheets — torn edges and desk scatter on the home gallery"
```

---

### Task 7: Old-Palette Colour Sweep

**Files:**
- Modify: any `*.css.ts` / `*.tsx` still carrying night-gallery literals (list produced in Step 1; known offenders include `components/gallery/GalleryTrack.css.ts`, `components/projects/previews/DefaultPreview.tsx`, `app/projects/[slug]/page.css.ts`, `components/project-detail/IframeWrapper.css.ts`)

**Interfaces:**
- Consumes: `vars.color.*` from Task 2
- Produces: no component in the repo renders old-palette hardcoded colours

- [ ] **Step 1: Find every old-palette literal**

Run (Grep tool or ripgrep) across `app/`, `components/`, `styles/`, `hooks/`, `lib/` for these patterns:

```
#0D0F14  |  #151820  |  #1E2330  |  #B8D4E8  |  #6A9AB8  |  #3D5A73  |  #E8EDF2
rgba(13, 15, 20  |  rgba(184, 212, 232  |  rgba(21, 24, 32
```

List every hit with file and line.

- [ ] **Step 2: Replace each hit with the token equivalent**

Mapping (old literal → replacement):

| Old | Replace with |
|---|---|
| `#0D0F14` / `rgba(13, 15, 20, a)` | `vars.color.bg` / `vars.color.sheetShadow` (shadows) |
| `#151820` | `vars.color.surface` |
| `#1E2330` | `vars.color.border` |
| `#B8D4E8` / `rgba(184, 212, 232, a)` | `vars.color.accent` (or `vars.color.accentDim` for the dimmer alpha uses) |
| `#6A9AB8` | `vars.color.accentDim` |
| `#3D5A73` | `vars.color.monoTag` |
| `#E8EDF2` | `vars.color.textPrimary` |

Two intentional exceptions, leave as-is and note them in the commit message:
- `hooks/useBoids.ts` / `BoidsCanvas` particle colour — the boids re-skin to iron-gall ink is Phase 3, not this plan.
- Canvas preview components (`components/projects/previews/*Preview.tsx`) — the ink re-draw is Phase 2. Only change `DefaultPreview`'s reduced-motion/background fill fallbacks if they reference `#151820` (use `vars` is impossible inside canvas — use the literal `'#F3ECD8'` with a comment pointing at `vars.color.surface`).

- [ ] **Step 3: Run tests and build**

Run: `pnpm test` → Expected: PASS.
Run: `pnpm build` → Expected: succeeds.

- [ ] **Step 4: Full-site visual pass**

`pnpm dev`; check `/`, `/projects`, and one detail page (`/projects/skyhive`). Expected: no leftover dark-navy patches; text legible everywhere on parchment; status badges (verdigris/ochre) readable. Detail pages render in the paper world for now — the marble-dusk treatment is Phase 5 by design.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: sweep night-gallery colour literals for parchment tokens"
```

---

## Mobile note (spec requirement)

Phase 1 introduces no pointer-dependent behaviour: scatter transforms are static, the gallery remains the existing scroll-driven track, and torn edges/textures are resolution-independent. The stacked-pile mobile layout arrives with the paper-physics work (Phase 3).

## Out of scope for this plan

Ink previews (Phase 2), paper physics + ink boids (Phase 3), the Tear transition (Phase 4), the Exhibit detail pages (Phase 5), post-processing/audio (Phase 6), R3F marble hall (Phase 7).
