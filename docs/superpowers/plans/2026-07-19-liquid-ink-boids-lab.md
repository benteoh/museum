# Liquid Ink Boids — Lab Plan

**Date:** 2026-07-19
**Status:** Spike built and traced 2026-07-19 — **awaiting owner keep/reject
review** (see "Lab notes — 2026-07-19 run" at the end for evidence)
**Supersedes:** the placement question in
`docs/superpowers/specs/2026-07-18-boids-effect-spike-shortlist.md` (see
"Decision context" below — the shortlist stays as decision evidence)
**Roadmap:** on a keep verdict, this sharpens the open Phase 3
flight-study-boids slot in Taskmaster; on reject, that slot closes with a
closeout like the kinetic-inscription record.

## Goal

One spike, two halves that are judged together:

1. **The ink-goo renderer.** Make the ambient boids read as **liquid
   iron-gall ink** — malleable droplets that merge, stretch, and split with
   surface tension — instead of 120 flat circles. Placement-independent: it
   upgrades the boids everywhere they already exist.
2. **Vista Release.** Use that material to stage one authored moment: at the
   desk→vista handoff the ink dust becomes a **distant murmuration over
   Florence** — a single dark, continuously deforming body above the skyline,
   which is what a real starling flock looks like at distance and what the
   goo threshold produces for free from a compacted flock.

The renderer is built first because the murmuration depends on it, but the
spike is scoped and reviewed as one thing: the owner sees the full journey
(liquid ink over paper → release → murmuration over the vista) before the
keep/reject call. One internal checkpoint (end of stage 1) exists only to
abort early if the goo fundamentally fails — not to hold a second approval.

## Decision context (resolved — do not relitigate)

- The five placement ideas in the 2026-07-18 shortlist were judged against a
  stricter bar: *would this read as taste or as tech demo on a
  Bruno-Simon-class portfolio?* Every idea where particles assemble into a
  picture (bird, diagram, chevron, perimeter arcs) fails it — a picture drawn
  in 3px dots is pure-procedural imagery, the exact thing the project's
  asset-first rule rejects. Formation ideas are dead. Do not resurrect them.
- The kinetic-inscription closeout
  (`docs/superpowers/specs/2026-07-17-kinetic-inscription-spike-design.md`)
  rules still bind: no gating text or interaction on decoration; motion
  decorates an already-complete state, visualizes a real process, or responds
  to explicit user action. Both halves comply — the material upgrade decorates
  nothing new, and the release responds to the visitor's own scroll at a
  scripted camera move.
- The perceived cheapness was diagnosed as **material, not placement**:
  placement cannot fix hard-edged circles. Hence renderer first, and no
  placement work that isn't the vista moment.
- The visual target is malleability (the "3D blob" quality — merging, surface
  tension, organic softness), **not** the Dribbble 3D-blob look. No gloss, no
  iridescence, no specular highlight. Matte ink on paper scenes; matte warm
  ember tones in dusk scenes. The site's material is ink —
  `components/overture/InkSpots.tsx` already names its dots iron-gall blots;
  the boids become the same substance.

## Read before writing any code

1. `AGENTS.md` — this Next.js version differs from training data; check
   `node_modules/next/dist/docs/` for anything Next-specific.
2. `docs/superpowers/specs/2026-07-02-living-codex-design.md` — "The craft
   bar" section (acceptance criteria, not aspirations) and the Vision Gallery
   revision.
3. The code being changed:
   - `components/cursor/BoidsCanvas.tsx` — renderer: 120 boids, radius 3,
     flat `arc()` fills + a ghost-trail pass; reads `useSceneStore` per frame
     for `SCENE_COLORS`; idle-circle formation after 3s of no cursor movement.
   - `components/cursor/BoidsCanvas.css.ts` — the canvas is `position: fixed`,
     `zIndex: 9999` (above **everything**, including the vista glass frames —
     load-bearing fact for stage 2).
   - `components/cursor/BoidsCanvasWrapper.tsx` — tier gate (`full` only) and
     opacity plumbing.
   - `hooks/useBoids.ts` — the sim. Note `W_FORMATION = 0.002` (very weak),
     rock-paper-scissors chase/flee groups, toroidal edge wrap at
     `updateBoids` (wrap breaks any directional/settled behaviour — stage 2
     must bypass it for banded boids).
   - `hooks/useBoidsVisibility.ts` — `SCENE_PRESENCE` (paper 1 / desk 0 /
     vista 0.45) and the paper-world scroll fade.
   - `hooks/useScene.ts`, `lib/deviceTier.ts`.
4. Perf methodology: the stage-1 trace approach recorded in the living-codex
   design doc appendix — 4× CPU throttle, headless Playwright + CDP. The goo
   pass adds a full-viewport filter; tracing is part of the spike, not the
   hardening.

## Shared constraints

- One simulation, one canvas. No second particle system.
- `full` tier only, unchanged: `BoidsCanvasWrapper` already returns `null`
  otherwise. Reduced/static tiers are untouched by this spike.
- Colour literals mirror tokens with a comment naming the token, per the
  existing `SCENE_COLORS` documented exception.
- Boids stay `pointer-events: none`, decorative, and never occlude captions,
  links, or previews.
- `pnpm test` and `pnpm build` green at every commit; commit per work package.
- Spike code is **disposable until the keep verdict** — favour the smallest
  change that answers the visual question; do not build abstractions for
  hypothetical future formations.

---

## Stage 1 — the ink-goo renderer

**Question this stage answers:** do 120 boids rendered as soft,
velocity-stretched ink droplets fused by a blur+threshold ("goo") pass read as
premium liquid ink on the paper scene at 60fps — yes or no?

### Technique

1. **Soft sprites, not hard circles.** Pre-render one radial-gradient droplet
   sprite to a small offscreen canvas at init (opaque ink core → transparent
   edge). Per frame, `drawImage` it per boid — cheaper than 120 gradient
   fills, and the softness is what the threshold needs.
2. **Squash and stretch.** Draw each sprite elongated along the velocity
   vector (rotate by `atan2(vy, vx)`, scale `1 + k·speed` along, `1/(1 +
   k·speed)` across). Fast boids become ink flicks; settled boids relax to
   round blots. The sim already provides `vx/vy`; no physics changes.
3. **The goo threshold.** Blur + alpha-threshold so overlapping soft sprites
   fuse into single droplets with necking as they separate. Two candidate
   pipelines — the spike must pick one by measurement, not preference:
   - **CSS filter on the canvas element:** an inline SVG filter
     (`feGaussianBlur` + `feColorMatrix` alpha threshold, the standard goo
     matrix) applied via `filter: url(#goo)` on the canvas node. GPU-
     composited, works in Safari (where `ctx.filter` support is unreliable),
     zero per-frame JS cost. First choice.
   - **Low-res offscreen composite:** draw sprites to a ⅓–¼-scale offscreen
     canvas, threshold, upscale to the main canvas. Fallback if the
     full-viewport CSS filter is too expensive under 4× throttle; the
     downsample also hides softness cheaply.
4. **One ink tone per scene.** The alpha threshold works per-colour, so the
   three rock-paper-scissors group hues collapse to a single ink colour per
   scene (mirroring `textPrimary` on paper, the existing dusk glow tone on
   desk/vista), with per-group *alpha* variance retained for depth. Decision
   is provisional: if flat-tone ink reads dead, try three offscreen passes
   (one per group) before rejecting — but three full-viewport filter passes
   must survive the perf trace.
5. **Ghost trail: audit under goo.** The previous-positions trail pass will
   fuse into the main pass and either reads as beautiful ink smear or as mud.
   Try it both ways; cut it without ceremony if it muddies — it exists to add
   life the squash-and-stretch may now provide better.

### Work packages

**A1 — renderer swap behind a flag.** Sprite + stretch + goo in
`BoidsCanvas.tsx`, switchable against the current circle renderer (a local
constant is fine — this is a spike, not a feature flag system). Both filter
pipelines wired so they can be A/B'd in the same build.

**A2 — visual pass.** Playwright screenshots at rest, mid-cursor-disturbance,
and idle-circle formation, on the paper scene and the vista scene, at 100%
zoom and 375px. The judgment criteria:

- Two boids passing close visibly **merge and pull apart with a neck**.
- Motion reads as liquid (flicks, blots), not as blurry circles.
- The idle circle formation, seen through goo, reads as a quiet ink ring —
  if it now reads as a rubber band, note it; retuning the idle formation is a
  hardening task, not a spike blocker.
- Matte throughout. If anyone would call it "blobby" in the Dribbble sense,
  the tone/threshold is wrong.

**A3 — perf trace.** Stage-1 methodology (4× CPU throttle, Playwright + CDP)
on the home page with the goo renderer active, both pipelines. Record frame
times in the lab notes. The winner must hold 60fps-class frame budget on the
throttled trace.

### Internal checkpoint (abort-early, not approval)

If A2 shows the goo fundamentally failing (no convincing merge at any
threshold, or neither pipeline survives A3), stop here: that is a reject
verdict for the whole spike and stage 2 never starts. Otherwise proceed
directly — do not wait for owner review between stages.

**Effort:** ~1 focused day.

---

## Stage 2 — Vista Release (murmuration over Florence)

**Question this stage answers:** at the desk→vista handoff, does retargeting a
subset of the flock into a compact horizon band — fused by the goo pass into
one deforming dark silhouette — read as a distant murmuration over the city,
discovered a beat after the look-up lands?

### Design

- **The moment:** scene store flips to `vista` (already published per frame to
  the renderer). ~40 boids ease into a clamped y-band above the skyline;
  the remainder fade out. `SCENE_PRESENCE.vista` (0.45) already quiets the
  layer; the murmuration subset may need its own presence value.
- **The material:** banded boids get tighter cohesion and lower `MAX_SPEED`
  so the goo threshold fuses them into a single undulating body that
  stretches, splits, and re-merges as the sim runs. No formation targets, no
  shapes — the rock-paper-scissors dynamics inside a compact band *are* the
  murmuration.
- **Quiet, then settled:** cursor disruption off for banded boids (a visitor's
  mouse should not scatter birds a kilometre away). The murmuration persists
  through the vista scene as slow ambient life, per the existing
  vista-presence behaviour — the *release* is the one authored moment; the
  settled state is background.
- **Reverse scroll:** scene flips back to `desk`/`paper` → band constraint
  releases and presence handles the fade, exactly as scene transitions do
  today. No replay choreography.

### Known problems the spike must solve (found in code, not speculative)

1. **Toroidal wrap.** `updateBoids` wraps positions at viewport edges —
   banded boids near the band edge would teleport. Banded mode needs a soft
   clamp (steer-back force) instead of wrap for its members.
2. **Stacking order.** The canvas is `zIndex: 9999` — above the vista glass
   frames. A murmuration that draws *over* glass panes breaks the depth
   illusion. Recommended fix: scene-conditional z-index on the wrapper
   (paper: above all, as cursor-layer dust; vista: beneath the rail/frames,
   above the vista backdrop). Verify the cursor-dust behaviour on paper
   scenes is unaffected and nothing else depends on the 9999 layer.
3. **Sim modes.** This introduces the first per-boid behavioural split
   (banded vs free vs fading). Keep it to a single `mode` field on `Boid`
   and a per-mode force blend in `updateBoids` — resist a state-machine
   abstraction until production hardening.

### Work packages

**B1 — banded mode in the sim.** `mode` field, soft band clamp, cohesion/speed
overrides, cursor-disruption bypass; unit tests alongside the existing
`useBoids` tests for the clamp (no wrap, no escape) and mode transitions.

**B2 — the release.** Scene-driven retarget on `desk→vista`, subset selection,
remainder fade, scene-conditional z-index. Tune compaction until the goo pass
holds the flock as one body ≥80% of the time, splitting occasionally — always
one blob reads static, always fragmented reads as noise.

**B3 — visual + perf pass.** Screenshots through the full scroll journey
(paper → desk → vista → reverse), 100% zoom + 375px; confirm the murmuration
never crosses a frame, caption, or the curator note at common viewport sizes;
re-run the perf trace on the vista rail (the goo filter now composites under
`backdrop-filter` panes — the stage-1 ripple lesson applies).

**Effort:** 1–2 focused days.

---

## The keep/reject gate (one review, whole spike)

Owner reviews the live dev build end-to-end — liquid ink over the Overture,
the desk stillness, the release, the settled murmuration, reverse scroll —
with the A2/B3 screenshot sets and A3/B3 trace numbers in hand.

- **Keep** → production hardening (below) is scheduled; the spike branch
  becomes the PR base.
- **Keep the renderer, reject the release** is a legitimate partial verdict —
  the ink-goo renderer stands alone. Stage 2 code is deleted; the murmuration
  gets a short closeout note.
- **Reject** → delete the spike code, append a closeout to the shortlist
  spec, boids remain circles.

**Total spike effort:** 2–3 focused days to the gate.

## Production hardening (only after a keep — separate PR scope)

Not part of the spike; listed so the gate stays honest about remaining cost:

- Remove the renderer flag and the rejected filter pipeline.
- Idle-circle formation retune under goo (or replace with a looser idle
  drift if the ring reads mechanical).
- Resize/orientation behaviour for the band; `document.hidden` and offscreen
  pauses re-verified with the filter active.
- Tests: sprite/stretch math, threshold pipeline choice recorded, banded-mode
  edge cases (viewport shrink below band, scene flapping desk↔vista).
- Design-doc appendix: shipped ink values (sprite radius, threshold matrix,
  band geometry, presence values) + trace numbers.
- Taskmaster: sharpen the Phase 3 flight-study-boids slot into this shipped
  scope; update the 2026-07-18 shortlist status to point here.

**Estimated hardening effort:** 2–3 days after the gate.

## Out of scope (do not build)

- Any particle formation that depicts an image (bird, wing, diagram, text,
  arrows) — rejected direction, twice now.
- The other shortlist placements (Living Frame, Collection Threshold,
  Curator's Diagram, Specimen Window).
- "Wake of the Turning Page" (sheet-edge air displacement in the Overture) —
  parked as a possible ~1-day follow-up *after* hardening ships; noted here
  so it isn't re-derived, not so it gets built now.
- New generated image assets; R3F; changes to reduced/static tiers; changes
  to `InkSpots`, previews, or the Overture sheet choreography.

## Branch / PR

Branch `liquid-ink-lab` off `master`. Spike commits stay on the branch;
nothing merges before the gate. On a keep, one PR titled **"Living Codex:
liquid ink boids + vista murmuration"** (or renderer-only on a partial keep)
— spike evidence (screenshots, trace numbers, pipeline decision) in the
description. On a full reject, the closeout note merges alone (docs-only PR)
and the branch is deleted.

## Definition of done (spike)

Renderer flag in place with both pipelines A/B-able; banded mode unit-tested;
release tuned per B2; screenshot sets for A2 and B3 plus trace numbers for
both scenes recorded in lab notes; gate verdict written into this file's
status line. Every commit green on `pnpm test` / `pnpm build`.

---

## Lab notes — 2026-07-19 run

Built on branch `liquid-ink-lab`. Evidence WebPs in
`docs/superpowers/labs/liquid-ink/` (1440×900, headless Chromium against the
dev server; capture + trace scripts alongside).

### What shipped in the spike

- Goo renderer live behind `RENDER_MODE = 'goo'` in `BoidsCanvas.tsx`;
  legacy circles kept. Pipeline A (full-res canvas + CSS `filter: url(#boids-goo)`)
  selected — pipeline B's `GOO_SCALE` knob is wired but unused at 1.
- Banded/fading sim modes in `useBoids.ts`, 6 new unit tests (14 total green).
- Vista release: nearest-to-band selection (long transits read as smudges
  crossing the panes — first-40 selection was visibly worse), dispersal kick
  on vista exit (without it the fused flock slides over the manuscripts as
  one ink blot while cohesion decays).
- Stacking: wrapper zIndex 9999 → 1 during vista; `track`/`stackContent` at 2.

### Tuning that the screenshots drove (values are load-bearing)

- `GOO_BLUR` 4.5 / `SPRITE_RADIUS` 3.4×dot / threshold `22a − 8`. First
  attempt (blur 7, radius 2.6×) **culled every isolated droplet** — blur must
  stay well under sprite radius or a lone boid's blurred peak alpha lands
  below the cutoff and only clusters survive.
- Vista ink = textPrimary dark, not duskText: distant birds read as dark
  silhouettes against the bright sky; the light glint tone was invisible.
- `W_BAND_CLAMP` 0.025 > straggler cohesion, or the flock sags below its
  band and grazes the frame tops.

### A3 trace (4× CPU throttle, headless Chromium + CDP, rAF-sampled over 5s)

| Scene | Static export (prod) | Dev server |
| --- | ---: | ---: |
| Paper, flock active | **60.2 fps** | 5.6 fps |
| Vista, murmuration settled | **60.2 fps** | 42.4 fps |
| Paper, legacy circles (baseline) | — | 6.4 fps |

Prod holds a locked 60 everywhere; the dev numbers are dev-build overhead
(goo ≈ circles within ~12% at the same scene). Pipeline A passes; B not
needed.

### What the owner should judge on the live build

1. Paper scene: droplets merge/neck/split; flicks when disturbed
   (02/03-paper webps). Density and droplet size are taste calls.
2. The release beat and the settled murmuration — one deforming body with
   occasional outliers (04/05-vista webps).
3. Return to paper: dispersal kick scatters the flock; brief dark motes over
   the manuscripts read as intended material (07-paper-return webp predates
   the kick — it shows the fused-blot failure the kick fixes).

### Known rough edges (hardening scope, not spike blockers)

- **Idle ring under goo**: forms slowly (weak `W_FORMATION` by design) and
  reads loose; retune or replace per the hardening list.
- **Mobile band**: the viewport-fixed band can overlay the desk still or the
  stacked frames at the desk/vista boundary; recommend disabling banding
  below the rail breakpoint (keep the dust) unless the owner wants it tuned.
- **Scene flapping at the vista's scroll boundaries** re-runs the release;
  harmless visually after the nearest-selection change but should be
  debounced in hardening.
- **Scroll-restoration jumps**: after a large instant jump the Overture's
  sprung progress re-publishes `desk` for ~1s and can briefly override
  `vista` (pre-existing publisher race, exposed by headless testing; real
  touch/wheel scrolling re-publishes continuously and self-corrects).
