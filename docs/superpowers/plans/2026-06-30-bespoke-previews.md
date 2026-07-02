# Bespoke Per-Project Previews Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the CSS gradient DefaultPreview with an animated canvas dot field, add bespoke canvas previews for `museum-of-little-things` and `skyhive`, and register them by project slug.

**Architecture:** Three layers — a pure `boidsMath.ts` module for testable simulation logic, individual `'use client'` canvas components per project registered in `index.ts`, and an upgraded `DefaultPreview` that switches from a CSS keyframe gradient to a Canvas 2D dot field. The `PREVIEW_COMPONENTS` registry in `index.ts` already exists but is empty — this plan fills it.

**Tech Stack:** Canvas 2D, React 18, Vanilla Extract (`@vanilla-extract/css`), Vitest

## Global Constraints

- All preview components are `'use client'` and take no props (`ComponentType`, no args)
- `prefers-reduced-motion`: skip rAF entirely, render a static canvas fill once
- Cap at 60fps via rAF timestamp throttling (`timestamp - last < 16.67`)
- Components must render correctly in any aspect ratio — canvas fills `100% × 100%`
- Never use `setInterval` — rAF only
- Run tests with: `pnpm vitest run`

---

### Task 1: Pure boids simulation module

**Files:**
- Create: `components/projects/previews/boidsMath.ts`
- Create: `tests/components/projects/previews/boidsMath.test.ts`

**Interfaces:**
- Produces:
  - `type Particle = { x: number; y: number; vx: number; vy: number }`
  - `function createParticles(count: number, width: number, height: number): Particle[]`
  - `function tick(particles: Particle[], width: number, height: number): Particle[]`

- [ ] **Step 1: Write failing tests**

```ts
// tests/components/projects/previews/boidsMath.test.ts
import { describe, it, expect } from 'vitest'
import { createParticles, tick } from '@/components/projects/previews/boidsMath'

describe('createParticles', () => {
  it('creates the requested number of particles', () => {
    const ps = createParticles(18, 400, 300)
    expect(ps).toHaveLength(18)
  })

  it('places all particles within canvas bounds', () => {
    const ps = createParticles(18, 400, 300)
    for (const p of ps) {
      expect(p.x).toBeGreaterThanOrEqual(0)
      expect(p.x).toBeLessThanOrEqual(400)
      expect(p.y).toBeGreaterThanOrEqual(0)
      expect(p.y).toBeLessThanOrEqual(300)
    }
  })
})

describe('tick', () => {
  it('returns the same number of particles', () => {
    const ps = createParticles(18, 400, 300)
    expect(tick(ps, 400, 300)).toHaveLength(18)
  })

  it('wraps particles that go off the right edge', () => {
    const ps = [{ x: 402, y: 150, vx: 2, vy: 0 }]
    const next = tick(ps, 400, 300)
    expect(next[0].x).toBeLessThan(400)
  })

  it('wraps particles that go off the bottom edge', () => {
    const ps = [{ x: 200, y: 302, vx: 0, vy: 2 }]
    const next = tick(ps, 400, 300)
    expect(next[0].y).toBeLessThan(300)
  })

  it('produces non-zero velocity for at least one particle', () => {
    const ps = createParticles(18, 400, 300)
    const next = tick(ps, 400, 300)
    expect(next.some((p) => p.vx !== 0 || p.vy !== 0)).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```
pnpm vitest run tests/components/projects/previews/boidsMath.test.ts
```
Expected: FAIL — module not found

- [ ] **Step 3: Implement boidsMath.ts**

```ts
// components/projects/previews/boidsMath.ts
export type Particle = { x: number; y: number; vx: number; vy: number }

const MAX_SPEED = 1.5
const MAX_FORCE = 0.04
const COHESION_RADIUS = 80
const SEPARATION_RADIUS = 20
const ALIGNMENT_RADIUS = 80
const W_COHESION = 0.001
const W_SEPARATION = 0.05
const W_ALIGNMENT = 0.04

export function createParticles(count: number, width: number, height: number): Particle[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = 0.4 + Math.random() * 0.8
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    }
  })
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2)
}

export function tick(particles: Particle[], width: number, height: number): Particle[] {
  return particles.map((p) => {
    let dx = 0, dy = 0
    let cohX = 0, cohY = 0, cohN = 0
    let sepX = 0, sepY = 0
    let aliVx = 0, aliVy = 0, aliN = 0

    for (const other of particles) {
      if (other === p) continue
      const d = dist(p.x, p.y, other.x, other.y)
      if (d < COHESION_RADIUS) { cohX += other.x; cohY += other.y; cohN++ }
      if (d < SEPARATION_RADIUS && d > 0) { sepX += (p.x - other.x) / d; sepY += (p.y - other.y) / d }
      if (d < ALIGNMENT_RADIUS) { aliVx += other.vx; aliVy += other.vy; aliN++ }
    }

    if (cohN > 0) { dx += (cohX / cohN - p.x) * W_COHESION; dy += (cohY / cohN - p.y) * W_COHESION }
    dx += sepX * W_SEPARATION
    dy += sepY * W_SEPARATION
    if (aliN > 0) { dx += (aliVx / aliN - p.vx) * W_ALIGNMENT; dy += (aliVy / aliN - p.vy) * W_ALIGNMENT }

    dx = clamp(dx, -MAX_FORCE, MAX_FORCE)
    dy = clamp(dy, -MAX_FORCE, MAX_FORCE)

    let vx = p.vx + dx
    let vy = p.vy + dy
    const speed = Math.sqrt(vx ** 2 + vy ** 2)
    if (speed > MAX_SPEED) { vx = (vx / speed) * MAX_SPEED; vy = (vy / speed) * MAX_SPEED }

    let x = p.x + vx
    let y = p.y + vy
    if (x < 0) x += width
    if (x > width) x -= width
    if (y < 0) y += height
    if (y > height) y -= height

    return { x, y, vx, vy }
  })
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```
pnpm vitest run tests/components/projects/previews/boidsMath.test.ts
```
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add components/projects/previews/boidsMath.ts tests/components/projects/previews/boidsMath.test.ts
git commit -m "feat: add pure boidsMath module for preview simulation"
```

---

### Task 2: DefaultPreview — canvas dot field

**Files:**
- Modify: `components/projects/previews/DefaultPreview.tsx`
- Modify: `components/projects/previews/DefaultPreview.css.ts`

**Interfaces:**
- Consumes: nothing new
- Produces: `DefaultPreview({ heroColour?: string })` — unchanged external signature

Current `DefaultPreview.tsx` accepts `{ heroColour?: string }` and renders a `<div>` with a CSS gradient animation. Current `DefaultPreview.css.ts` has a `drift` keyframe and a gradient `root` style.

- [ ] **Step 1: Simplify DefaultPreview.css.ts — drop the drift keyframe**

Replace the entire file:

```ts
// components/projects/previews/DefaultPreview.css.ts
import { style } from '@vanilla-extract/css'

export const root = style({ width: '100%', height: '100%', display: 'block' })
```

- [ ] **Step 2: Rewrite DefaultPreview.tsx with canvas dot field**

```tsx
// components/projects/previews/DefaultPreview.tsx
'use client'

import { useEffect, useRef } from 'react'
import * as styles from './DefaultPreview.css'

type Dot = { x: number; y: number; phase: number; speed: number; radius: number }

/** Calm animated fill shown when a project has no component or image. */
export function DefaultPreview({ heroColour }: { heroColour?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const colour = heroColour ?? '#151820'
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()

    if (reduced) {
      ctx.fillStyle = colour
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      return
    }

    const dots: Dot[] = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
      radius: 1 + Math.random() * 1.5,
    }))

    let t = 0
    let raf = 0
    let last = 0

    const loop = (timestamp: number) => {
      if (timestamp - last < 16.67) { raf = requestAnimationFrame(loop); return }
      last = timestamp
      t += 0.005

      ctx.fillStyle = colour
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = colour + '30'
      for (const d of dots) {
        const ox = Math.sin(t * d.speed + d.phase) * 18
        const oy = Math.cos(t * d.speed * 0.7 + d.phase) * 12
        ctx.beginPath()
        ctx.arc(d.x + ox, d.y + oy, d.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [heroColour])

  return <canvas ref={canvasRef} className={styles.root} aria-hidden />
}
```

- [ ] **Step 3: Verify in dev server**

```
pnpm dev
```

Navigate to a project with a `heroColour` set, or the home gallery with a fallback project. Confirm panels fill with animated breathing dots instead of the gradient drift. Open DevTools → toggle `prefers-reduced-motion: reduce` → confirm static solid fill.

- [ ] **Step 4: Commit**

```bash
git add components/projects/previews/DefaultPreview.tsx components/projects/previews/DefaultPreview.css.ts
git commit -m "feat: replace gradient DefaultPreview with canvas dot field"
```

---

### Task 3: MuseumOfLittleThingsPreview — mini boids

**Files:**
- Create: `components/projects/previews/MuseumOfLittleThingsPreview.tsx`
- Modify: `components/projects/previews/index.ts`

**Interfaces:**
- Consumes: `tick`, `createParticles`, `Particle` from `./boidsMath`
- Produces: `MuseumOfLittleThingsPreview` — `ComponentType` (no props)

- [ ] **Step 1: Create the component**

```tsx
// components/projects/previews/MuseumOfLittleThingsPreview.tsx
'use client'

import { useEffect, useRef } from 'react'
import { createParticles, tick } from './boidsMath'
import type { Particle } from './boidsMath'

const ACCENT = '#B8D4E8'
const COUNT = 18

export function MuseumOfLittleThingsPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let particles: Particle[] = []

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      particles = createParticles(COUNT, canvas.width, canvas.height)
    }
    resize()

    if (reduced) {
      ctx.fillStyle = '#151820'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = ACCENT + '50'
        ctx.fill()
      }
      return
    }

    let raf = 0
    let last = 0

    const loop = (timestamp: number) => {
      if (timestamp - last < 16.67) { raf = requestAnimationFrame(loop); return }
      last = timestamp

      particles = tick(particles, canvas.width, canvas.height)

      ctx.fillStyle = '#15182099'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = ACCENT + '50'
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-hidden
    />
  )
}
```

- [ ] **Step 2: Register the component in index.ts**

```ts
// components/projects/previews/index.ts
import type { ComponentType } from 'react'
import { MuseumOfLittleThingsPreview } from './MuseumOfLittleThingsPreview'

export const PREVIEW_COMPONENTS: Record<string, ComponentType> = {
  'museum-of-little-things': MuseumOfLittleThingsPreview,
}
```

- [ ] **Step 3: Verify in dev server**

Navigate to the home gallery. The `museum-of-little-things` panel should show 18 soft blue flocking particles — not the dot field. Confirm reduced-motion shows a static scatter.

- [ ] **Step 4: Commit**

```bash
git add components/projects/previews/MuseumOfLittleThingsPreview.tsx components/projects/previews/index.ts
git commit -m "feat: bespoke mini-boids preview for museum-of-little-things"
```

---

### Task 4: SkyhivePreview — isometric voxel cubes

**Files:**
- Create: `components/projects/previews/SkyhivePreview.tsx`
- Modify: `components/projects/previews/index.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `SkyhivePreview` — `ComponentType` (no props)

- [ ] **Step 1: Create the component**

```tsx
// components/projects/previews/SkyhivePreview.tsx
'use client'

import { useEffect, useRef } from 'react'

type Cube = { x: number; y: number; size: number; speed: number }

const BG = '#0d1520'

function drawIsoCube(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, op: number) {
  const h = s * 0.5
  // Top face
  ctx.beginPath()
  ctx.moveTo(cx, cy - h)
  ctx.lineTo(cx + s, cy)
  ctx.lineTo(cx, cy + h)
  ctx.lineTo(cx - s, cy)
  ctx.closePath()
  ctx.fillStyle = `rgba(74,127,160,${op})`
  ctx.fill()
  // Left face
  ctx.beginPath()
  ctx.moveTo(cx - s, cy)
  ctx.lineTo(cx, cy + h)
  ctx.lineTo(cx, cy + h + s)
  ctx.lineTo(cx - s, cy + s)
  ctx.closePath()
  ctx.fillStyle = `rgba(26,47,74,${op})`
  ctx.fill()
  // Right face
  ctx.beginPath()
  ctx.moveTo(cx + s, cy)
  ctx.lineTo(cx, cy + h)
  ctx.lineTo(cx, cy + h + s)
  ctx.lineTo(cx + s, cy + s)
  ctx.closePath()
  ctx.fillStyle = `rgba(47,74,107,${op})`
  ctx.fill()
}

function makeCube(canvasWidth: number, canvasHeight: number): Cube {
  return {
    x: Math.random() * canvasWidth,
    y: canvasHeight + Math.random() * canvasHeight,
    size: 8 + Math.random() * 10,
    speed: 0.2 + Math.random() * 0.4,
  }
}

export function SkyhivePreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()

    const cubes: Cube[] = Array.from({ length: 12 }, () => makeCube(canvas.width, canvas.height))
    // Scatter initial y so they don't all start off-screen
    for (const c of cubes) { c.y = Math.random() * canvas.height }

    if (reduced) {
      ctx.fillStyle = BG
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      const sorted = [...cubes].sort((a, b) => a.y - b.y)
      for (const c of sorted) drawIsoCube(ctx, c.x, c.y, c.size, 0.5)
      return
    }

    let raf = 0
    let last = 0

    const loop = (timestamp: number) => {
      if (timestamp - last < 16.67) { raf = requestAnimationFrame(loop); return }
      last = timestamp

      ctx.fillStyle = BG
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (const c of cubes) {
        c.y -= c.speed
        if (c.y + c.size * 2 < 0) {
          c.x = Math.random() * canvas.width
          c.y = canvas.height + c.size
          c.size = 8 + Math.random() * 10
          c.speed = 0.2 + Math.random() * 0.4
        }
      }

      // Sort back-to-front (higher y = drawn later = in front)
      const sorted = [...cubes].sort((a, b) => a.y - b.y)
      for (const c of sorted) drawIsoCube(ctx, c.x, c.y, c.size, 0.6)

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-hidden
    />
  )
}
```

- [ ] **Step 2: Register SkyhivePreview in index.ts**

```ts
// components/projects/previews/index.ts
import type { ComponentType } from 'react'
import { MuseumOfLittleThingsPreview } from './MuseumOfLittleThingsPreview'
import { SkyhivePreview } from './SkyhivePreview'

export const PREVIEW_COMPONENTS: Record<string, ComponentType> = {
  'museum-of-little-things': MuseumOfLittleThingsPreview,
  skyhive: SkyhivePreview,
}
```

- [ ] **Step 3: Verify in dev server**

Navigate to the home gallery. The `skyhive` panel should show isometric cubes drifting upward at varied speeds, respawning at the bottom. Confirm back-to-front sort (nearer cubes overlap farther ones correctly). Confirm reduced-motion shows a static snapshot.

- [ ] **Step 4: Commit**

```bash
git add components/projects/previews/SkyhivePreview.tsx components/projects/previews/index.ts
git commit -m "feat: bespoke isometric voxel preview for skyhive"
```

---

## Self-Review

**Spec coverage:**
- DefaultPreview canvas dot field ✅ Task 2
- `boidsMath.ts` pure function (`tick`, `createParticles`) ✅ Task 1
- `museum-of-little-things` mini boids preview ✅ Task 3
- `skyhive` isometric cube preview ✅ Task 4
- Both registered by slug in `PREVIEW_COMPONENTS` ✅ Tasks 3 + 4
- `prefers-reduced-motion` respected in all four components ✅
- 60fps cap via timestamp throttling ✅
- Any aspect ratio via `ResizeObserver` ✅

**Placeholder scan:** None found.

**Type consistency:** `Particle` type exported from `boidsMath.ts` in Task 1, consumed by `MuseumOfLittleThingsPreview` in Task 3 — consistent.
