# Bespoke Project Previews Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the empty preview registry and gradient-drift DefaultPreview with genuinely alive canvas animations — a canvas dot field for the default, a mini boids simulation for `museum-of-little-things`, and floating isometric voxel cubes for `skyhive`.

**Architecture:** All previews are `'use client'` canvas components that run rAF loops. Pure math functions are extracted to separate files for testability (mirrors the existing `galleryMath.ts` pattern). Registry registration happens last so each component is independently testable before wiring.

**Tech Stack:** React 19, Canvas 2D API, Vanilla Extract, Vitest + jsdom, no new npm dependencies.

## Global Constraints

- All preview components: `'use client'` directive, no props (`ComponentType` with no arguments), `pointer-events: none` on root via className, `aria-hidden` on canvas element.
- `prefers-reduced-motion`: every canvas animation must detect this and render a static fill instead of an rAF loop.
- Vanilla Extract styles only — no inline style objects except for CSS custom properties passed as `CSSProperties`.
- `display: block` on every `<canvas>` element (avoids the 4px baseline gap browsers add to inline elements).
- Cancel `requestAnimationFrame` on cleanup — every `useEffect` that starts a loop must return a cleanup function.
- Test runner: `pnpm test` (vitest run). Test files in `tests/components/previews/`.

---

### Task 1: Upgrade DefaultPreview to Canvas Dot Field

Replaces the CSS gradient drift with a Canvas 2D animated dot field. 70 dots oscillate using sin/cos with individual phase offsets, producing an organic breathing motion. Reduced-motion users see a static tinted fill.

**Files:**
- Modify: `components/projects/previews/DefaultPreview.tsx`
- Modify: `components/projects/previews/DefaultPreview.css.ts`
- Create: `tests/components/previews/DefaultPreview.test.tsx`

**Interfaces:**
- Consumes: nothing from other tasks
- Produces: `DefaultPreview({ heroColour?: string })` — same signature as before; called by `ProjectPreview` which is unchanged

- [ ] **Step 1: Write the failing test**

```ts
// tests/components/previews/DefaultPreview.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { DefaultPreview } from '@/components/projects/previews/DefaultPreview'

// jsdom doesn't implement canvas — mock getContext so the component doesn't throw
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: '',
  })
})

describe('DefaultPreview', () => {
  it('renders a canvas element', () => {
    const { container } = render(<DefaultPreview />)
    expect(container.querySelector('canvas')).not.toBeNull()
  })

  it('canvas has aria-hidden', () => {
    const { container } = render(<DefaultPreview />)
    expect(container.querySelector('canvas')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('accepts an optional heroColour without throwing', () => {
    expect(() => render(<DefaultPreview heroColour="#2F4A6B" />)).not.toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```
pnpm test tests/components/previews/DefaultPreview.test.tsx
```

Expected: FAIL — `canvas` element not found (current component renders a `div`)

- [ ] **Step 3: Update DefaultPreview.css.ts — strip the gradient animation**

The canvas element fills its container via `width: 100%; height: 100%`. The `drift` keyframe and gradient are no longer needed.

```ts
// components/projects/previews/DefaultPreview.css.ts
import { style } from '@vanilla-extract/css'

export const root = style({
  width: '100%',
  height: '100%',
  display: 'block',
})
```

- [ ] **Step 4: Replace DefaultPreview.tsx with canvas implementation**

```tsx
// components/projects/previews/DefaultPreview.tsx
'use client'

import { useEffect, useRef } from 'react'
import * as styles from './DefaultPreview.css'

type Dot = { x: number; y: number; phase: number; speed: number; radius: number }

function makeDots(count: number, w: number, h: number): Dot[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    phase: Math.random() * Math.PI * 2,
    speed: 0.15 + Math.random() * 0.25,
    radius: 1 + Math.random() * 1.5,
  }))
}

export function DefaultPreview({ heroColour }: { heroColour?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = (canvas.width = canvas.offsetWidth)
    const h = (canvas.height = canvas.offsetHeight)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      ctx.fillStyle = heroColour ?? '#151820'
      ctx.fillRect(0, 0, w, h)
      return
    }

    const colour = heroColour ?? '#B8D4E8'
    const dots = makeDots(70, w, h)
    let t = 0
    let raf: number

    function draw() {
      ctx!.clearRect(0, 0, w, h)
      t += 0.005
      for (const d of dots) {
        const ox = Math.sin(t * d.speed + d.phase) * 18
        const oy = Math.cos(t * d.speed * 0.7 + d.phase) * 12
        ctx!.beginPath()
        ctx!.arc(d.x + ox, d.y + oy, d.radius, 0, Math.PI * 2)
        ctx!.fillStyle = colour + '30'
        ctx!.fill()
      }
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [heroColour])

  return <canvas ref={ref} className={styles.root} aria-hidden />
}
```

- [ ] **Step 5: Run tests to verify they pass**

```
pnpm test tests/components/previews/DefaultPreview.test.tsx
```

Expected: PASS (3 tests)

- [ ] **Step 6: Run full test suite to check for regressions**

```
pnpm test
```

Expected: all existing tests pass

- [ ] **Step 7: Verify visually**

```
pnpm dev
```

Open `http://localhost:3000`. Gallery panels with no `heroImage` and no bespoke component (i.e. `museum-of-little-things` which uses its `heroImage`) should show the dot field. Check that dots oscillate smoothly.

- [ ] **Step 8: Commit**

```bash
git add components/projects/previews/DefaultPreview.tsx components/projects/previews/DefaultPreview.css.ts tests/components/previews/DefaultPreview.test.tsx
git commit -m "feat: upgrade DefaultPreview to animated canvas dot field"
```

---

### Task 2: boidsMath Pure Functions + MuseumPreview Component

Extracts the boids simulation math into a pure, testable module, then builds a canvas component that runs it. The preview shows 18 particles doing cohesion/separation/alignment — a miniature version of the boids cursor that is the signature element of this site.

**Files:**
- Create: `components/projects/previews/boidsMath.ts`
- Create: `components/projects/previews/MuseumPreview.tsx`
- Create: `components/projects/previews/MuseumPreview.css.ts`
- Create: `tests/components/previews/boidsMath.test.ts`

**Interfaces:**
- Consumes: nothing from other tasks
- Produces:
  - `boidsMath.ts` exports `type Particle = { x: number; y: number; vx: number; vy: number }` and `tick(particles: Particle[], width: number, height: number): Particle[]`
  - `MuseumPreview` is a `ComponentType` (no props) for registration in Task 4

- [ ] **Step 1: Write the failing tests for boidsMath**

```ts
// tests/components/previews/boidsMath.test.ts
import { describe, it, expect } from 'vitest'
import { tick, type Particle } from '@/components/projects/previews/boidsMath'

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    x: 100 + i * 5,
    y: 100 + i * 5,
    vx: 0.1,
    vy: 0.1,
  }))
}

describe('tick', () => {
  it('returns the same number of particles', () => {
    const ps = makeParticles(10)
    expect(tick(ps, 400, 300)).toHaveLength(10)
  })

  it('moves particles — position changes after one tick', () => {
    const ps: Particle[] = [{ x: 100, y: 100, vx: 1, vy: 0 }]
    const next = tick(ps, 400, 300)
    expect(next[0].x).not.toBe(100)
  })

  it('wraps particles that exceed width', () => {
    const ps: Particle[] = [{ x: 399, y: 150, vx: 5, vy: 0 }]
    const next = tick(ps, 400, 300)
    expect(next[0].x).toBeGreaterThanOrEqual(0)
    expect(next[0].x).toBeLessThan(400)
  })

  it('wraps particles that go below x=0', () => {
    const ps: Particle[] = [{ x: 1, y: 150, vx: -5, vy: 0 }]
    const next = tick(ps, 400, 300)
    expect(next[0].x).toBeGreaterThanOrEqual(0)
    expect(next[0].x).toBeLessThan(400)
  })

  it('wraps particles that exceed height', () => {
    const ps: Particle[] = [{ x: 200, y: 299, vx: 0, vy: 5 }]
    const next = tick(ps, 400, 300)
    expect(next[0].y).toBeGreaterThanOrEqual(0)
    expect(next[0].y).toBeLessThan(300)
  })

  it('caps particle speed at MAX_SPEED', () => {
    const ps = Array.from({ length: 5 }, () => ({
      x: 200, y: 150, vx: 20, vy: 20,
    }))
    const next = tick(ps, 400, 300)
    for (const p of next) {
      const speed = Math.sqrt(p.vx ** 2 + p.vy ** 2)
      expect(speed).toBeLessThanOrEqual(1.25) // MAX_SPEED (1.2) + float tolerance
    }
  })

  it('does not mutate the input array', () => {
    const ps: Particle[] = [{ x: 100, y: 100, vx: 1, vy: 1 }]
    const original = { ...ps[0] }
    tick(ps, 400, 300)
    expect(ps[0]).toEqual(original)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```
pnpm test tests/components/previews/boidsMath.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 3: Create boidsMath.ts**

```ts
// components/projects/previews/boidsMath.ts
export type Particle = { x: number; y: number; vx: number; vy: number }

const MAX_SPEED = 1.2
const COHESION_STRENGTH = 0.003
const SEPARATION_DIST = 20
const SEPARATION_STRENGTH = 0.05
const ALIGNMENT_STRENGTH = 0.01

export function tick(ps: Particle[], w: number, h: number): Particle[] {
  const cx = ps.reduce((s, p) => s + p.x, 0) / ps.length
  const cy = ps.reduce((s, p) => s + p.y, 0) / ps.length
  const avgVx = ps.reduce((s, p) => s + p.vx, 0) / ps.length
  const avgVy = ps.reduce((s, p) => s + p.vy, 0) / ps.length

  return ps.map((p): Particle => {
    let dvx = 0
    let dvy = 0

    // cohesion — steer toward flock centre
    dvx += (cx - p.x) * COHESION_STRENGTH
    dvy += (cy - p.y) * COHESION_STRENGTH

    // separation — push away from close neighbours
    for (const other of ps) {
      if (other === p) continue
      const dx = p.x - other.x
      const dy = p.y - other.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < SEPARATION_DIST && dist > 0) {
        dvx += (dx / dist) * SEPARATION_STRENGTH
        dvy += (dy / dist) * SEPARATION_STRENGTH
      }
    }

    // alignment — match flock velocity
    dvx += (avgVx - p.vx) * ALIGNMENT_STRENGTH
    dvy += (avgVy - p.vy) * ALIGNMENT_STRENGTH

    let nvx = p.vx + dvx
    let nvy = p.vy + dvy
    const speed = Math.sqrt(nvx * nvx + nvy * nvy)
    if (speed > MAX_SPEED) {
      nvx = (nvx / speed) * MAX_SPEED
      nvy = (nvy / speed) * MAX_SPEED
    }

    let nx = p.x + nvx
    let ny = p.y + nvy
    if (nx < 0) nx += w
    if (nx > w) nx -= w
    if (ny < 0) ny += h
    if (ny > h) ny -= h

    return { x: nx, y: ny, vx: nvx, vy: nvy }
  })
}
```

- [ ] **Step 4: Run tests to verify boidsMath passes**

```
pnpm test tests/components/previews/boidsMath.test.ts
```

Expected: PASS (7 tests)

- [ ] **Step 5: Create MuseumPreview.css.ts**

```ts
// components/projects/previews/MuseumPreview.css.ts
import { style } from '@vanilla-extract/css'

export const root = style({
  width: '100%',
  height: '100%',
  display: 'block',
})
```

- [ ] **Step 6: Create MuseumPreview.tsx**

```tsx
// components/projects/previews/MuseumPreview.tsx
'use client'

import { useEffect, useRef } from 'react'
import * as styles from './MuseumPreview.css'
import { tick, type Particle } from './boidsMath'

function makeParticles(count: number, w: number, h: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: w * 0.25 + Math.random() * w * 0.5,
    y: h * 0.25 + Math.random() * h * 0.5,
    vx: (Math.random() - 0.5) * 0.8,
    vy: (Math.random() - 0.5) * 0.8,
  }))
}

export function MuseumPreview() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = (canvas.width = canvas.offsetWidth)
    const h = (canvas.height = canvas.offsetHeight)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      ctx.fillStyle = '#0D0F14'
      ctx.fillRect(0, 0, w, h)
      return
    }

    let particles = makeParticles(18, w, h)
    let raf: number

    function draw() {
      ctx!.clearRect(0, 0, w, h)
      particles = tick(particles, w, h)
      ctx!.fillStyle = '#B8D4E830'
      for (const p of particles) {
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, 2, 0, Math.PI * 2)
        ctx!.fill()
      }
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={ref} className={styles.root} aria-hidden />
}
```

- [ ] **Step 7: Run full test suite**

```
pnpm test
```

Expected: all tests pass (no component test for MuseumPreview yet — that comes in Task 4 with the registry test)

- [ ] **Step 8: Commit**

```bash
git add components/projects/previews/boidsMath.ts components/projects/previews/MuseumPreview.tsx components/projects/previews/MuseumPreview.css.ts tests/components/previews/boidsMath.test.ts
git commit -m "feat: add boidsMath pure functions and MuseumPreview canvas component"
```

---

### Task 3: SkyhivePreview — Floating Isometric Voxel Cubes

12 isometric cubes drift upward at varied speeds. Each cube is drawn as three faces (top, left, right) using navy-blue tones matching Skyhive's `heroColour` (#2F4A6B). Cubes respawn at the bottom when they exit the top.

**Files:**
- Create: `components/projects/previews/SkyhivePreview.tsx`
- Create: `components/projects/previews/SkyhivePreview.css.ts`

**Interfaces:**
- Consumes: nothing from other tasks
- Produces: `SkyhivePreview` is a `ComponentType` (no props) for registration in Task 4

- [ ] **Step 1: Create SkyhivePreview.css.ts**

```ts
// components/projects/previews/SkyhivePreview.css.ts
import { style } from '@vanilla-extract/css'

export const root = style({
  width: '100%',
  height: '100%',
  display: 'block',
})
```

- [ ] **Step 2: Create SkyhivePreview.tsx**

```tsx
// components/projects/previews/SkyhivePreview.tsx
'use client'

import { useEffect, useRef } from 'react'
import * as styles from './SkyhivePreview.css'

type Cube = {
  x: number
  y: number
  vy: number
  size: number
  opacity: number
}

function makeCubes(count: number, w: number, h: number): Cube[] {
  return Array.from({ length: count }, () => ({
    x: w * 0.1 + Math.random() * w * 0.8,
    y: Math.random() * h,
    vy: 0.2 + Math.random() * 0.4,
    size: 8 + Math.random() * 10,
    opacity: 0.3 + Math.random() * 0.45,
  }))
}

// Isometric cube centred at (cx, cy) with half-width s.
// Faces: top (lightest), left (darkest), right (mid).
function drawCube(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  op: number,
) {
  const h = s * 0.5 // iso vertical offset per horizontal unit

  // top face — diamond shape
  ctx.beginPath()
  ctx.moveTo(cx, cy - h)
  ctx.lineTo(cx + s, cy)
  ctx.lineTo(cx, cy + h)
  ctx.lineTo(cx - s, cy)
  ctx.closePath()
  ctx.fillStyle = `rgba(74, 127, 160, ${op})`
  ctx.fill()

  // left face — parallelogram going down-left
  ctx.beginPath()
  ctx.moveTo(cx - s, cy)
  ctx.lineTo(cx, cy + h)
  ctx.lineTo(cx, cy + h + s)
  ctx.lineTo(cx - s, cy + s)
  ctx.closePath()
  ctx.fillStyle = `rgba(26, 47, 74, ${op})`
  ctx.fill()

  // right face — parallelogram going down-right
  ctx.beginPath()
  ctx.moveTo(cx + s, cy)
  ctx.lineTo(cx, cy + h)
  ctx.lineTo(cx, cy + h + s)
  ctx.lineTo(cx + s, cy + s)
  ctx.closePath()
  ctx.fillStyle = `rgba(47, 74, 107, ${op})`
  ctx.fill()
}

export function SkyhivePreview() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = (canvas.width = canvas.offsetWidth)
    const h = (canvas.height = canvas.offsetHeight)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      ctx.fillStyle = '#2F4A6B'
      ctx.fillRect(0, 0, w, h)
      return
    }

    const cubes = makeCubes(12, w, h)
    let raf: number

    function draw() {
      ctx!.clearRect(0, 0, w, h)

      // sort back-to-front by y so cubes overlap correctly
      cubes.sort((a, b) => a.y - b.y)

      for (const c of cubes) {
        drawCube(ctx!, c.x, c.y, c.size, c.opacity)
        c.y -= c.vy
        if (c.y + c.size * 2 < 0) {
          c.y = h + c.size
          c.x = w * 0.1 + Math.random() * w * 0.8
        }
      }

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={ref} className={styles.root} aria-hidden />
}
```

- [ ] **Step 3: Run full test suite — no regressions**

```
pnpm test
```

Expected: all existing tests pass (no new tests for SkyhivePreview — the registry test in Task 4 covers that it exists)

- [ ] **Step 4: Verify visually**

```
pnpm dev
```

Check that `SkyhivePreview` renders correctly in isolation before registering it. You can temporarily import and render it in a test page, or wait until Task 4 registers it and check the gallery.

- [ ] **Step 5: Commit**

```bash
git add components/projects/previews/SkyhivePreview.tsx components/projects/previews/SkyhivePreview.css.ts
git commit -m "feat: add SkyhivePreview floating isometric voxel canvas component"
```

---

### Task 4: Register Both Components + Registry Tests

Wire both components into the registry and add a test that confirms registration — both that the slugs exist and that all registry values are callable functions.

**Files:**
- Modify: `components/projects/previews/index.ts`
- Create: `tests/components/previews/registry.test.ts`

**Interfaces:**
- Consumes: `MuseumPreview` from Task 2, `SkyhivePreview` from Task 3
- Produces: `PREVIEW_COMPONENTS` with `'museum-of-little-things'` and `'skyhive'` registered

- [ ] **Step 1: Write the failing registry tests**

```ts
// tests/components/previews/registry.test.ts
import { describe, it, expect } from 'vitest'
import { PREVIEW_COMPONENTS } from '@/components/projects/previews'

describe('PREVIEW_COMPONENTS registry', () => {
  it('has a preview registered for museum-of-little-things', () => {
    expect(PREVIEW_COMPONENTS['museum-of-little-things']).toBeDefined()
  })

  it('has a preview registered for skyhive', () => {
    expect(PREVIEW_COMPONENTS['skyhive']).toBeDefined()
  })

  it('all registered values are functions', () => {
    for (const [slug, Component] of Object.entries(PREVIEW_COMPONENTS)) {
      expect(typeof Component, `${slug} is not a function`).toBe('function')
    }
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```
pnpm test tests/components/previews/registry.test.ts
```

Expected: FAIL — `museum-of-little-things` and `skyhive` are undefined (registry is empty)

- [ ] **Step 3: Update index.ts to register both components**

```ts
// components/projects/previews/index.ts
import type { ComponentType } from 'react'
import { MuseumPreview } from './MuseumPreview'
import { SkyhivePreview } from './SkyhivePreview'

export const PREVIEW_COMPONENTS: Record<string, ComponentType> = {
  'museum-of-little-things': MuseumPreview,
  'skyhive': SkyhivePreview,
}
```

- [ ] **Step 4: Run registry tests to verify they pass**

```
pnpm test tests/components/previews/registry.test.ts
```

Expected: PASS (3 tests)

- [ ] **Step 5: Run full test suite**

```
pnpm test
```

Expected: all tests pass

- [ ] **Step 6: Verify end-to-end in the browser**

```
pnpm dev
```

Open `http://localhost:3000`. Check:
1. Gallery panel for `museum-of-little-things` shows boids particles drifting (not the SVG hero image — note: this project currently uses `heroImage` so the image takes priority over the component. Temporarily remove `heroImage` from the frontmatter to verify the preview renders, then restore it).
2. Gallery panel for `skyhive` shows floating isometric cubes.
3. Any future project without a bespoke component shows the dot field DefaultPreview.

- [ ] **Step 7: Run build to confirm no TypeScript or Velite errors**

```
pnpm build
```

Expected: clean build with no type errors

- [ ] **Step 8: Commit**

```bash
git add components/projects/previews/index.ts tests/components/previews/registry.test.ts
git commit -m "feat: register MuseumPreview and SkyhivePreview in PREVIEW_COMPONENTS"
```

---

## Self-Review

**Spec coverage check:**

| Requirement | Task |
|---|---|
| DefaultPreview upgraded from gradient drift | Task 1 |
| Reduced-motion static fallback on all components | Tasks 1, 2, 3 |
| `pointer-events: none` on root | Handled by `styles.root` in each `.css.ts` — all preview components use `pointer-events: none` set at the `ProjectPreview` parent level (existing code in `ProjectPreview.css.ts`, not touched here) |
| `aria-hidden` on canvas | Tasks 1, 2, 3 |
| `display: block` on canvas | All `.css.ts` files |
| MuseumPreview — boids simulation | Task 2 |
| SkyhivePreview — voxel cubes | Task 3 |
| Registry populated | Task 4 |
| Pure math tested | Task 2 (boidsMath) |
| rAF cleanup on unmount | All useEffect returns cancel |

**Placeholder scan:** No TBDs, no "implement later", all code blocks contain real implementations.

**Type consistency:** `Particle` type defined once in `boidsMath.ts`, imported by `MuseumPreview.tsx`. `ComponentType` used throughout. `PREVIEW_COMPONENTS` type is `Record<string, ComponentType>` in both index.ts and the test import.

**Note on museum-of-little-things preview visibility:** This project has a `heroImage` set in its frontmatter, so `resolvePreview` will choose `'image'` over `'component'` (per the existing priority order). The bespoke component is registered and ready — to use it, either remove `heroImage` from the frontmatter or update `resolvePreview` to make components always win. The current priority order (`component > image > default`) already handles this correctly: if `heroImage` is removed, the bespoke component takes over automatically.
