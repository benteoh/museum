# Museum of Little Things — Web Experience Improvements Spec
**Version 1.0 | 2026-06-28**

Builds on `2026-06-04-museum-of-little-things-design.md` and `2026-06-14-museum-day2-showcase-design.md`. Those documents remain the source of truth for colour/typography/motion tokens and the existing feature set. This spec covers eight improvements that close the gap between the current MVP and a world-class creative portfolio.

---

## Dependency Order

Some improvements must precede others. The full dependency graph:

```
01 Visual Brief
    ↓
05 Post-Processing ──→ 08 R3F Gallery
03 Physics Tuning ────→ 08 R3F Gallery
07 Audio (if yes) ────→ 08 R3F Gallery (optional)

02 Bespoke Previews   (independent)
04 Enhanced Boids     (independent)
06 Exit Transitions   (independent)
```

Safe to implement in any order: 02, 04, 06. All other work branches from 01.

---

## 01 — Visual Brief

**Type:** Prerequisite (no code)
**Unlocks:** 05, 08

Before any WebGL work begins, translate the aesthetic intent of the museum into hard technical constraints. Without this, every subsequent R3F and post-processing decision will be made by guessing.

### Deliverable

A `docs/superpowers/specs/visual-brief.md` file containing:

**Aesthetic-to-constraint table** — three columns: mood word → sensory target → technical value.

| Mood | Sensory target | Constraint |
|---|---|---|
| Quiet | Nothing competes for attention | Max transition duration: 900ms. No simultaneous animations. |
| Archival | Old, handled, real | Grain shader: Perlin noise at `amplitude 0.025–0.04`. No clean surfaces. |
| Heavy | Things have mass | Gallery spring: `stiffness 40–70, damping 18–24`. Tuned on device, not from memory. |
| Luxurious | Slow, deliberate, unhurried | Minimum transition duration: 500ms. No snappy anything except link underlines. |

The brief must resolve every row before implementation begins. Rows left blank are a blocker.

**Material targets** — exact PBR values for the two primary materials:

| Material | Roughness | Metalness | Transmission | Clearcoat | Notes |
|---|---|---|---|---|---|
| Aged paper | 0.75–0.85 | 0.0 | 0.0 | 0.0 | Warm grain texture required — no clean flat colour |
| Greek marble | 0.15–0.25 | 0.0 | 0.1–0.2 | 0.1 | Veining via roughness texture. Slight translucency. |
| Frosted glass | 0.08–0.12 | 0.0 | 0.85–0.95 | 0.0 | For gallery panel vitrines in the R3F scene |

Values are starting points. Lock them with Leva in-browser during 03 (Physics Tuning).

**Camera personality** — one sentence. Example: *"Slow documentary camera — slight resistance on start, graceful settle, never snappy."*

**Performance floor** — exact device target and frame rate. Example: *"2020 MacBook Air M1, 60fps. Mid-range Android acceptable at 30fps with reduced post-processing."*

**Audio decision** — yes or no, with one sentence on character if yes. Example: *"Yes. Ambient paper-and-stone texture, barely audible, starts on first scroll, stops with mute toggle."*

---

## 02 — Bespoke Per-Project Previews

**Type:** Current stack, no new dependencies
**Depends on:** Nothing
**Files affected:**
- `components/projects/previews/index.ts` — register components
- `components/projects/previews/DefaultPreview.tsx` — upgrade
- `components/projects/previews/DefaultPreview.css.ts` — simplify
- `components/projects/previews/<Slug>Preview.tsx` — one per project
- `components/projects/previews/<Slug>Preview.css.ts` — one per project

### DefaultPreview — Canvas Dot Field

Replace the CSS gradient drift with a Canvas 2D animated dot field. 70 dots oscillate using sin/cos with individual phase offsets, producing an organic breathing texture.

```tsx
// Dot shape:
type Dot = { x: number; y: number; phase: number; speed: number; radius: number }

// Draw loop:
// - t increments 0.005 per frame
// - ox = sin(t * d.speed + d.phase) * 18
// - oy = cos(t * d.speed * 0.7 + d.phase) * 12
// - fillStyle: heroColour + '30' (~19% opacity)
// - radius: 1–2.5px
```

Reduced-motion: skip rAF, fill canvas with `heroColour ?? '#151820'` once.

**CSS update:** `DefaultPreview.css.ts` drops the `drift` keyframe. Root style becomes:
```ts
export const root = style({ width: '100%', height: '100%', display: 'block' })
```

### Per-Project Previews

One animated `'use client'` React component per project, registered by slug. Components take no props (`ComponentType` — no arguments). Each must:

- Represent the **character** of the project, not just animate abstractly
- Respect `prefers-reduced-motion` — static fill, no rAF
- Never exceed 60fps (rAF loop, no `setInterval`)
- Render in any aspect ratio (canvas fills 100% × 100%)

**`museum-of-little-things` — Mini boids simulation**

A self-contained boids simulation: ~18 particles, cohesion + separation + alignment. Uses accent colour `#B8D4E8` at low opacity. The boids cursor is the signature of this site — the preview reflects that.

Extract the simulation into `components/projects/previews/boidsMath.ts` as a pure function:
```ts
type Particle = { x: number; y: number; vx: number; vy: number }
function tick(particles: Particle[], width: number, height: number): Particle[]
```

This is testable. The canvas component imports and calls it per frame.

**`skyhive` — Floating isometric voxel cubes**

12 isometric cubes drift upward at varied speeds (0.2–0.6px/frame), respawn at bottom when off-screen. Three-face isometric draw (top: `rgba(74,127,160,op)`, left: `rgba(26,47,74,op)`, right: `rgba(47,74,107,op)`). Cube size: 8–18px. Sort back-to-front by Y before drawing.

### Future projects

Every new project in `content/projects/*.mdx` should have either:
1. A bespoke component in `PREVIEW_COMPONENTS`, or
2. A `heroImage` (static/GIF), or
3. A `heroColour` (DefaultPreview tint)

Shipping a new project without any of the three is a content gap, not acceptable.

---

## 03 — Physics Feel Tuning

**Type:** In-browser refinement session
**Depends on:** Running dev server
**Files affected:**
- `hooks/useGallery.ts`
- `hooks/useBoids.ts`
- `components/gallery/GalleryTrack.tsx`

The spring values in the current spec (`stiffness: 60, damping: 20`) were written in a document, not felt on a device. This improvement locks them based on actual feel.

### Process

1. **Add Leva controls** to `useGallery` in development:

```ts
import { useControls } from 'leva'

// Inside useGallery, gated on process.env.NODE_ENV === 'development':
const { stiffness, damping, mass } = useControls('Gallery Spring', {
  stiffness: { value: 60, min: 10, max: 200 },
  damping:   { value: 20, min: 1,  max: 60  },
  mass:      { value: 1,  min: 0.1, max: 5  },
})
```

2. **Tune on a physical device** (not DevTools throttling). Target feel: *"heavy turntable coming to rest — fast start, slow settle."* Not snappy. Not sluggish.

3. **Tune the boids** separately:
   - `DISRUPTION_RADIUS`: currently 80px — test if this is too aggressive at different cursor speeds
   - `REFORM_TIMING`: currently 2000ms — test if this feels right

4. **Lock values, remove Leva, commit.**

### Acceptance criteria

- Gallery glide matches the brief camera personality (from 01)
- Panels don't feel like they snap or jerk at the end of a scroll gesture
- Boids scatter and reform feel natural at all cursor speeds (slow drift, fast swipe)

---

## 04 — Enhanced Boids

**Type:** Current stack
**Depends on:** Nothing
**Files affected:**
- `hooks/useBoids.ts`
- `components/cursor/BoidsCanvas.tsx`

Three additions to the existing boids system.

### Velocity-based opacity

Particle opacity scales with speed. Idle particles: 20% opacity. Fast-moving (post-scatter): 60% opacity. The flock's energy is readable at a glance.

```ts
// In the draw loop:
const speed = Math.sqrt(p.vx ** 2 + p.vy ** 2)
const MAX_SPEED = 3 // from existing constants
const opacity = 0.2 + (speed / MAX_SPEED) * 0.4
ctx.fillStyle = `rgba(184, 212, 232, ${opacity})`
```

### Shape formation when idle

After the cursor has been still for 3 seconds, particles drift toward a target formation. Cursor movement scatters them immediately.

- Target: a simple mark — either the letter B or a subtle cluster formation. Decision deferred to implementation (open question: what mark).
- Implementation: an array of `{ x: number, y: number }` target positions, one per particle. Each particle adds a small steering force toward its target when the idle timer is active.
- The idle timer resets to 0 on any `mousemove` event.

```ts
// Add to useBoids state:
let idleMs = 0
let lastMoveTime = Date.now()

// On each frame:
idleMs = Date.now() - lastMoveTime
const isIdle = idleMs > 3000
if (isIdle) {
  // add cohesion force toward FORMATION_TARGETS[i]
}
```

### Subtle trail

Each particle leaves a ghost at its previous position. Not a persistent trail — a single-frame shimmer.

Implementation: draw a second pass at 30% opacity with positions from the previous frame, before drawing the current frame. Store `prevParticles` between frames.

**Open question:** What shape do the boids form when idle? This must be decided before implementing shape formation. A simple spiral or letter are both viable; the choice should match the brief aesthetic.

---

## 05 — Post-Processing Layer

**Type:** Introduces WebGL
**Depends on:** 01 (visual brief — specifically grain intensity and CA level decisions)
**Files affected:**
- `app/layout.tsx` — wrap children in R3F canvas or overlay
- New: `components/canvas/PostCanvas.tsx` — R3F canvas with EffectComposer
- New: `components/canvas/GrainPass.tsx` — custom GLSL grain effect
- New: `components/canvas/VignettePass.tsx` — shader vignette replacing CSS radial-gradient
- `hooks/useGallery.ts` — expose scroll velocity for CA pass

This is the first WebGL addition. It adds a full-screen post-processing stack as a canvas layer that sits above the DOM. The R3F gallery (08) will later replace the CSS gallery and sit inside this same canvas.

### Architecture

```
app/layout.tsx
  ├── <PostCanvas />          ← full-screen R3F canvas, pointer-events: none
  │     └── EffectComposer
  │           ├── GrainPass       ← animated Perlin noise grain
  │           ├── VignettePass    ← replaces CSS radial-gradient
  │           └── ChromaticAberrationPass  ← driven by scroll velocity
  └── {children}              ← existing DOM content unchanged
```

The canvas is `position: fixed; inset: 0; z-index: [above content]; pointer-events: none`. DOM content renders below it unchanged.

### GrainPass — Custom GLSL

```glsl
// fragment shader:
uniform float uTime;
uniform float uIntensity;  // 0.025–0.04 per visual brief
varying vec2 vUv;

float noise(vec2 p) {
  return fract(sin(dot(p + uTime * 0.1, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  float grain = noise(vUv * 800.0) * 2.0 - 1.0;
  gl_FragColor = vec4(vec3(grain * uIntensity), 0.0);  // additive blend
}
```

The pass is additive: `blending: THREE.AdditiveBlending`. Grain moves (seeded by `uTime`) — not frozen.

### VignettePass

Replace `styles/global.css.ts` vignette overlay with a shader vignette for correct edge falloff.

```glsl
uniform float uStrength; // 0.6
uniform float uOffset;   // 0.5

void main() {
  vec2 uv = vUv * (1.0 - vUv);
  float vignette = uv.x * uv.y * 15.0;
  vignette = pow(vignette, uStrength);
  gl_FragColor = vec4(0.0, 0.0, 0.0, (1.0 - vignette) * uOffset);
}
```

### ChromaticAberrationPass

UV offset per channel on fast scroll. Intensity driven by a spring on scroll velocity (not raw delta — prevents jarring spikes).

```ts
// useGallery.ts addition:
const scrollVelocity = useVelocity(scrollProgress)
const caIntensity = useSpring(scrollVelocity, { stiffness: 80, damping: 20 })
// Pass caIntensity.get() * 0.003 as the max UV offset to the shader uniform
```

### Performance gating

Skip post-processing (render nothing) if:
- `prefers-reduced-motion: reduce`
- `navigator.hardwareConcurrency <= 2`
- `navigator.deviceMemory !== undefined && navigator.deviceMemory < 4`

---

## 06 — Exit Page Transitions

**Type:** App Router research + implementation
**Depends on:** Nothing
**Files affected:**
- `app/layout.tsx`
- `components/layout/PageTransition.tsx`
- `components/gallery/ExhibitionPanel.tsx`
- `app/projects/[slug]/page.tsx`

The current spec defers exit-on-navigate. This improvement resolves it.

### Approach — View Transitions API first

The View Transitions API (Chrome 111+) is the correct solution. It enables a panel-to-detail expand without fighting App Router's rendering model.

**Step 1:** Probe whether `document.startViewTransition` is available and whether it pairs cleanly with Next.js App Router's `router.push`. This requires a spike — implement a minimal test before committing to the approach.

**Implementation if VTA works:**

1. Add `view-transition-name: panel-{slug}` to `ExhibitionPanel` root
2. Add matching `view-transition-name: panel-hero` to the detail page header
3. Override the default cross-fade with a custom CSS transition:

```css
::view-transition-old(panel-hero) {
  animation: none;
}
::view-transition-new(panel-hero) {
  animation: expand-in 500ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

**Fallback if VTA doesn't work cleanly:**

A Zustand-controlled full-screen overlay in `layout.tsx`. On navigate: set `isTransitioning = true` → overlay fades in → navigation fires → overlay fades out on next page mount. Reliable, no App Router fighting, no expand animation.

Do not implement both. Pick one approach and be clean.

### Acceptance criteria

- Navigating from gallery to a project feels spatial — the user crosses into the work, not reloads
- Back navigation feels like returning to the room, not loading a new page
- Transition works at all scroll positions (not just when the panel is centred)

---

## 07 — Audio Design

**Type:** Decision-first
**Depends on:** 01 (visual brief — audio decision required)
**Files affected (if yes):**
- `app/layout.tsx` — AudioContext init + mute toggle state
- New: `hooks/useAmbientAudio.ts`
- `components/nav/Nav.tsx` — mute toggle icon

This section is conditional on the audio decision in 01. **Do not implement until the brief is complete.**

### If audio: yes

**Ambient texture only.** No UI click sounds. No triggered events. One looping ambient file — paper resonance and stone hum, barely audible. The kind of sound you notice when it stops.

**Implementation:**

```ts
// hooks/useAmbientAudio.ts
// Initialises AudioContext on first scroll gesture.
// Plays a looping ambient buffer at volume ~0.15.
// Exposes: { isMuted, toggleMute }
// Persists mute state in localStorage('museum-muted').
```

The AudioContext must be created inside a user gesture handler (click or scroll). Do not attempt to create it on mount — browsers will block it silently.

**Mute toggle:** A minimal icon in `Nav.tsx`, right side, after the nav links. Off by default — the ambient starts on first scroll and is immediately mutable. No autoplay assumption.

**If R3F is live (08 complete):** route audio through `THREE.PositionalAudio` attached to the gallery scene centre. The sound has a spatial location in the room, not just stereo.

**If R3F is not yet live:** use Web Audio API directly, no Three.js dependency.

### If audio: no

No implementation. Remove this section from future plan work.

---

## 08 — R3F Gallery

**Type:** Major milestone
**Depends on:** 01 (visual brief), 03 (spring values locked), 05 (post-processing scaffold)
**Files affected:**
- `components/gallery/GalleryTrack.tsx` — rewrite as R3F scene
- `components/gallery/ExhibitionPanel.tsx` — rewrite as R3F mesh
- `components/gallery/GalleryTrack.css.ts` — remove (CSS 3D no longer used)
- `hooks/useGallery.ts` — camera follow replaces translateX
- New: `components/gallery/GalleryScene.tsx` — R3F Canvas + scene root
- New: `components/gallery/PanelMesh.tsx` — MeshPhysicalMaterial panel + preview texture

Replaces the CSS 3D gallery (`rotateY` on `div`) with a proper WebGL scene. This is weeks of work, not hours. Do not start without 01 complete.

### Scene structure

```
<GalleryScene>                   ← R3F Canvas, drops into the PostCanvas from 05
  <Environment preset="city" />  ← HDRI lighting, no direct lights
  <group ref={trackRef}>         ← panels laid out in X, translateX follows scroll via spring camera
    {projects.map(p => (
      <PanelMesh key={p.slug} project={p} isActive={activeIndex === i} />
    ))}
  </group>
  <EffectComposer>               ← reuses passes from 05
    <DepthOfField focusDistance={focalDistance} bokehScale={2} />
    <GrainPass intensity={0.03} />
    <VignettePass />
  </EffectComposer>
</GalleryScene>
```

### PanelMesh

Each panel is a `MeshPhysicalMaterial` plane with a `RenderTexture` containing the project's `ProjectPreview` component (React → texture). This keeps the existing preview registry intact — bespoke canvas previews render into the texture.

```tsx
<mesh>
  <planeGeometry args={[panelWidth, panelHeight]} />
  <meshPhysicalMaterial
    roughness={0.1}
    metalness={0}
    transmission={0.9}
    ior={1.5}
    thickness={0.5}
    transparent
  />
</mesh>
```

Panel label (title, status, tags) is a second plane with a `CanvasTexture` — not DOM overlay.

### Camera follow

Camera x-position follows the scroll-derived `activeIndex` target via a spring. The camera slides; it does not orbit.

```ts
const targetX = activeIndex * (PANEL_WIDTH + GAP)
cameraX.set(targetX) // useSpring value from 03 tuning
camera.position.x = cameraX.get()
```

### Depth of field

Shallow DOF focused on the active panel. Other panels are slightly soft. Implemented as `DepthOfField` from `@react-three/postprocessing`. `focusDistance` updates when `activeIndex` changes, with a spring interpolation so focus shifts smoothly.

### Fallback

If `WebGLRenderingContext` is unavailable, render the existing CSS 3D gallery unchanged. Use a feature-detection wrapper:

```tsx
export function Gallery(props: GalleryProps) {
  const webgl = typeof window !== 'undefined' &&
    !!document.createElement('canvas').getContext('webgl2')
  return webgl ? <GalleryScene {...props} /> : <GalleryTrackCSS {...props} />
}
```

Do not remove the CSS gallery code until R3F is stable in production.

### Open questions (must be resolved in 01 before implementation)

- Glass panel: frosted (`roughness: 0.1`) or near-crystal (`roughness: 0.01`)?
- HDRI preset: city (neutral, modern) or sunset (warmer, more character)?
- ProjectPreview in gallery: rendered as RenderTexture (live React) or baked to CanvasTexture (static snapshot)?
- Performance: is 30fps on mobile acceptable, or does the gallery need an LOD fallback?

---

## Open Questions (Global)

- [ ] What glyph or mark do the boids form when idle? (04)
- [ ] Is the silence in the current experience deliberate or an omission? (07)
- [ ] Does `museum-of-little-things` preview use the bespoke boids component, or the heroImage? (02)
- [ ] Is View Transitions API acceptable as Chrome-first? (06)
