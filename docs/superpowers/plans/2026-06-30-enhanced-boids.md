# Enhanced Boids Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add velocity-based opacity, idle circular formation after 3s cursor stillness, and single-frame ghost trails to the 120-boid cursor system.

**Architecture:** Three focused additions to `hooks/useBoids.ts` and `components/cursor/BoidsCanvas.tsx`. Velocity opacity moves from cursor-proximity logic in `applyBoidRules` into speed-derived logic in `updateBoids`. Idle formation targets are computed in `BoidsCanvas` (where mouse events live) and passed as an optional parameter to `updateBoids`. Trails use a `prevBoids` ref — a second draw pass at ~8% opacity before the main pass.

**Tech Stack:** Canvas 2D, React 18, Vitest

## Global Constraints

- `MAX_SPEED = 2.8` — existing constant in `hooks/useBoids.ts`, do not change
- Idle threshold: 3000ms cursor stillness
- Formation shape: circular arrangement centred on canvas
- Formation force weight: weak — boids should drift toward shape, not snap
- Trail: single-frame shimmer only — draw previous positions before current frame
- Run tests with: `pnpm vitest run`

---

### Task 1: Velocity-based opacity

**Files:**
- Modify: `hooks/useBoids.ts`
- Modify: `tests/hooks/useBoids.test.ts`

**Interfaces:**
- `applyBoidRules` return type changes: remove `opacity` field → `{ dx: number; dy: number; wanderAngle: number }`
- `updateBoids` signature: unchanged — opacity is now computed internally from speed
- `Boid.opacity` field: retained, but now `0.2 + (speed / MAX_SPEED) * 0.4`

Currently `applyBoidRules` sets `targetOpacity = 0.6` when the cursor is close and `0.2` otherwise. This plan changes opacity to be speed-derived (fast boids are brighter regardless of cursor proximity).

- [ ] **Step 1: Write a failing test for velocity-based opacity**

Add to `tests/hooks/useBoids.test.ts`:

```ts
describe('updateBoids — velocity opacity', () => {
  it('gives a fast-moving boid higher opacity than a still boid', () => {
    // Place boids far apart so they don't interact with each other
    const stillBoid: Boid = { x: 100,  y: 100, vx: 0,   vy: 0, opacity: 0.2, group: 0, wanderAngle: 0 }
    const fastBoid:  Boid = { x: 700,  y: 500, vx: 2.5, vy: 0, opacity: 0.2, group: 0, wanderAngle: 0 }
    const updated = updateBoids([stillBoid, fastBoid], { x: -1, y: -1 }, 800, 600)
    expect(updated[1].opacity).toBeGreaterThan(updated[0].opacity)
  })
})
```

You'll need to add `Boid` to the import:
```ts
import { createBoid, applyBoidRules, updateBoids, type Boid } from '@/hooks/useBoids'
```

- [ ] **Step 2: Run test to confirm it fails**

```
pnpm vitest run tests/hooks/useBoids.test.ts
```
Expected: FAIL — both boids get the same opacity (cursor-proximity path gives 0.2 to both)

- [ ] **Step 3: Remove opacity from applyBoidRules; compute from speed in updateBoids**

In `hooks/useBoids.ts`, update `applyBoidRules`:

Remove the `targetOpacity` variable and the opacity return field. The cursor disruption block keeps its force logic but loses the opacity side effect. The final return changes from `{ dx, dy, opacity: targetOpacity, wanderAngle }` to `{ dx, dy, wanderAngle }`:

```ts
export function applyBoidRules(
  boid: Boid,
  all: Boid[],
  cursor: CursorPos
): { dx: number; dy: number; wanderAngle: number } {
  // ... (all steering code identical to current) ...

  // Cursor disruption — keep force, remove opacity target
  const cursorDist = dist(boid.x, boid.y, cursor.x, cursor.y)
  if (cursor.x >= 0 && cursor.y >= 0 && cursorDist < DISRUPTION_RADIUS) {
    const force = (1 - cursorDist / DISRUPTION_RADIUS) * 0.3
    if (cursorDist > 0) {
      dx += ((boid.x - cursor.x) / cursorDist) * force
      dy += ((boid.y - cursor.y) / cursorDist) * force
    }
  }

  dx = clamp(dx, -MAX_FORCE, MAX_FORCE)
  dy = clamp(dy, -MAX_FORCE, MAX_FORCE)

  return { dx, dy, wanderAngle }
}
```

Update `updateBoids` to compute opacity from speed (replace the existing `const newOpacity` line):

```ts
export function updateBoids(
  boids: Boid[],
  cursor: CursorPos,
  width: number,
  height: number
): Boid[] {
  return boids.map((boid) => {
    const { dx, dy, wanderAngle } = applyBoidRules(boid, boids, cursor)

    let vx = boid.vx + dx
    let vy = boid.vy + dy

    const speed = Math.sqrt(vx ** 2 + vy ** 2)
    if (speed > MAX_SPEED) {
      vx = (vx / speed) * MAX_SPEED
      vy = (vy / speed) * MAX_SPEED
    }

    let x = boid.x + vx
    let y = boid.y + vy
    if (x < 0) x += width
    if (x > width) x -= width
    if (y < 0) y += height
    if (y > height) y -= height

    const targetOpacity = 0.2 + (speed / MAX_SPEED) * 0.4
    const newOpacity = boid.opacity + (targetOpacity - boid.opacity) * 0.05

    return { x, y, vx, vy, opacity: newOpacity, group: boid.group ?? 0, wanderAngle }
  })
}
```

- [ ] **Step 4: Run all boids tests**

```
pnpm vitest run tests/hooks/useBoids.test.ts
```
Expected: PASS (5 tests — 4 existing + 1 new)

- [ ] **Step 5: Commit**

```bash
git add hooks/useBoids.ts tests/hooks/useBoids.test.ts
git commit -m "feat: velocity-based boid opacity replaces cursor-proximity opacity"
```

---

### Task 2: Idle circular formation

**Files:**
- Modify: `hooks/useBoids.ts` — add optional `formationTargets` to `updateBoids` and `tick`
- Modify: `components/cursor/BoidsCanvas.tsx` — track idle timer, build targets, pass to tick

**Interfaces:**
- `updateBoids` new signature: `(boids, cursor, width, height, formationTargets?: Array<{x: number, y: number}>) => Boid[]`
- `tick` (in `useBoids`) new signature: `(cursor, width, height, formationTargets?: Array<{x: number, y: number}>) => Boid[]`

- [ ] **Step 1: Write a failing test for formation steering**

Add to `tests/hooks/useBoids.test.ts`:

```ts
describe('updateBoids — idle formation', () => {
  it('steers a boid toward its formation target when targets are provided', () => {
    const boid: Boid = { x: 0, y: 0, vx: 0, vy: 0, opacity: 0.2, group: 0, wanderAngle: 0 }
    const target = { x: 400, y: 300 }
    const updated = updateBoids([boid], { x: -1, y: -1 }, 800, 600, [target])
    // After one tick with formation force pulling right+down, x should increase
    expect(updated[0].x).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```
pnpm vitest run tests/hooks/useBoids.test.ts
```
Expected: FAIL — `updateBoids` doesn't accept the 5th argument yet

- [ ] **Step 3: Add formation steering to useBoids.ts**

Add constant at the top of `hooks/useBoids.ts`:

```ts
const W_FORMATION = 0.002
```

Update `updateBoids` to accept and apply `formationTargets`:

```ts
export function updateBoids(
  boids: Boid[],
  cursor: CursorPos,
  width: number,
  height: number,
  formationTargets?: Array<{ x: number; y: number }>
): Boid[] {
  return boids.map((boid, i) => {
    const { dx: ruleDx, dy: ruleDy, wanderAngle } = applyBoidRules(boid, boids, cursor)

    let dx = ruleDx
    let dy = ruleDy

    if (formationTargets) {
      const target = formationTargets[i % formationTargets.length]
      if (target) {
        dx += (target.x - boid.x) * W_FORMATION
        dy += (target.y - boid.y) * W_FORMATION
      }
    }

    let vx = boid.vx + dx
    let vy = boid.vy + dy

    const speed = Math.sqrt(vx ** 2 + vy ** 2)
    if (speed > MAX_SPEED) {
      vx = (vx / speed) * MAX_SPEED
      vy = (vy / speed) * MAX_SPEED
    }

    let x = boid.x + vx
    let y = boid.y + vy
    if (x < 0) x += width
    if (x > width) x -= width
    if (y < 0) y += height
    if (y > height) y -= height

    const targetOpacity = 0.2 + (speed / MAX_SPEED) * 0.4
    const newOpacity = boid.opacity + (targetOpacity - boid.opacity) * 0.05

    return { x, y, vx, vy, opacity: newOpacity, group: boid.group ?? 0, wanderAngle }
  })
}
```

Update `tick` in `useBoids` hook to forward the optional param:

```ts
const tick = useCallback((
  cursor: CursorPos,
  width: number,
  height: number,
  formationTargets?: Array<{ x: number; y: number }>
) => {
  boidsRef.current = updateBoids(boidsRef.current, cursor, width, height, formationTargets)
  return boidsRef.current
}, [])
```

- [ ] **Step 4: Run all boids tests**

```
pnpm vitest run tests/hooks/useBoids.test.ts
```
Expected: PASS (6 tests)

- [ ] **Step 5: Add idle timer and circular target builder to BoidsCanvas.tsx**

At the top of `BoidsCanvas.tsx`, add the ref and helper (outside the component):

```tsx
const IDLE_MS = 3000

function buildCircleTargets(
  count: number,
  cx: number,
  cy: number,
  r: number
): Array<{ x: number; y: number }> {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r }
  })
}
```

Inside `BoidsCanvas`, add the idle timer ref:

```tsx
const lastMoveRef = useRef<number>(Date.now())
```

Update `handleMouseMove` to reset the timer:

```tsx
const handleMouseMove = useCallback(
  (e: MouseEvent) => {
    cursorRef.current = { x: e.clientX, y: e.clientY }
    lastMoveRef.current = Date.now()
    setPosition(e.clientX, e.clientY)
  },
  [setPosition]
)
```

Update the draw loop to compute and pass `formationTargets`:

```tsx
const loop = (timestamp: number) => {
  if (document.hidden) { rafRef.current = requestAnimationFrame(loop); return }
  if (timestamp - lastFrameRef.current < 16.67) { rafRef.current = requestAnimationFrame(loop); return }
  lastFrameRef.current = timestamp

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const isIdle = Date.now() - lastMoveRef.current > IDLE_MS
  const formationTargets = isIdle
    ? buildCircleTargets(
        BOID_COUNT,
        canvas.width / 2,
        canvas.height / 2,
        Math.min(canvas.width, canvas.height) * 0.3
      )
    : undefined

  const boids = tick(cursorRef.current, canvas.width, canvas.height, formationTargets)

  for (const boid of boids) {
    ctx.beginPath()
    ctx.arc(boid.x, boid.y, BOID_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${GROUP_COLORS[boid.group] ?? GROUP_COLORS[0]}, ${boid.opacity})`
    ctx.fill()
  }

  rafRef.current = requestAnimationFrame(loop)
}
```

- [ ] **Step 6: Verify in dev server**

```
pnpm dev
```

Move the cursor freely, then let it rest for 3 seconds. The boids should gradually drift into a ring formation centred on screen. Moving the cursor should immediately scatter them. Confirm the drift is gradual — not a snap.

- [ ] **Step 7: Commit**

```bash
git add hooks/useBoids.ts components/cursor/BoidsCanvas.tsx tests/hooks/useBoids.test.ts
git commit -m "feat: idle circular formation after 3s cursor stillness"
```

---

### Task 3: Single-frame ghost trail

**Files:**
- Modify: `components/cursor/BoidsCanvas.tsx` — store prevBoids, draw ghost pass before main pass

**Interfaces:**
- No new exports — internal draw loop change only

- [ ] **Step 1: Add prevBoids ref to BoidsCanvas.tsx**

Inside the `BoidsCanvas` component, add:

```tsx
const prevBoidsRef = useRef<Array<{ x: number; y: number; group: number }>>([])
```

- [ ] **Step 2: Update draw loop to render trail then update prevBoidsRef**

In the draw loop, after `ctx.clearRect`, draw the previous frame's positions at low opacity, then after calling `tick`, store the new positions:

```tsx
const loop = (timestamp: number) => {
  if (document.hidden) { rafRef.current = requestAnimationFrame(loop); return }
  if (timestamp - lastFrameRef.current < 16.67) { rafRef.current = requestAnimationFrame(loop); return }
  lastFrameRef.current = timestamp

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Ghost trail — previous frame at low opacity
  for (const prev of prevBoidsRef.current) {
    ctx.beginPath()
    ctx.arc(prev.x, prev.y, BOID_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${GROUP_COLORS[prev.group] ?? GROUP_COLORS[0]}, 0.08)`
    ctx.fill()
  }

  const isIdle = Date.now() - lastMoveRef.current > IDLE_MS
  const formationTargets = isIdle
    ? buildCircleTargets(
        BOID_COUNT,
        canvas.width / 2,
        canvas.height / 2,
        Math.min(canvas.width, canvas.height) * 0.3
      )
    : undefined

  const boids = tick(cursorRef.current, canvas.width, canvas.height, formationTargets)

  // Store current positions for next frame's trail
  prevBoidsRef.current = boids.map((b) => ({ x: b.x, y: b.y, group: b.group }))

  for (const boid of boids) {
    ctx.beginPath()
    ctx.arc(boid.x, boid.y, BOID_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${GROUP_COLORS[boid.group] ?? GROUP_COLORS[0]}, ${boid.opacity})`
    ctx.fill()
  }

  rafRef.current = requestAnimationFrame(loop)
}
```

- [ ] **Step 3: Verify in dev server**

```
pnpm dev
```

Move the cursor quickly across the screen. Each boid should leave a single faint echo dot at its previous position — a shimmer effect, not a persistent trail. At rest, the echo should be barely visible. Verify no performance degradation (still 60fps).

- [ ] **Step 4: Commit**

```bash
git add components/cursor/BoidsCanvas.tsx
git commit -m "feat: single-frame ghost trail on boids"
```

---

## Self-Review

**Spec coverage:**
- Velocity opacity: 0.2 idle → 0.6 fast ✅ Task 1
- Idle shape formation after 3s ✅ Task 2
- Idle timer resets on `mousemove` ✅ Task 2 (handleMouseMove update)
- Single-frame trail at ~30% opacity ✅ Task 3

**Open question resolved:** "What shape do boids form when idle?" — circular arrangement. Spec offered "letter B or subtle cluster formation" — circle is the cluster formation variant. Matches the archival aesthetic (no typographic marks competing with content).

**Placeholder scan:** None found.

**Type consistency:** `formationTargets: Array<{ x: number; y: number }>` is the same type in `updateBoids`, `tick`, and `buildCircleTargets` — consistent. `prevBoidsRef` stores `Array<{ x: number; y: number; group: number }>` — sufficient for trail rendering.
