# The Living Codex — Design
**Version 1.0 | 2026-07-02**

A full art-direction rebrand of Museum of Little Things: **da Vinci manuscript + ancient Greek marble + physics**. The site becomes a Renaissance notebook whose pages tear away to reveal a marble hall where projects are exhibited as living artefacts.

Supersedes the *visual direction* of `visual-brief.md` v1 (dark night-gallery palette). The *engineering scaffolding* of `2026-06-28-web-experience-improvements.md` (post-processing, springs, R3F gallery, exit transitions) survives, re-aimed at the new aesthetic.

---

## Decisions locked during brainstorming

| Question | Decision |
|---|---|
| Scope | **Full rebrand** — dark cool-blue theme replaced entirely |
| Meaning of "physics" | Both: simulated physical materials (paper with mass) **and** da Vinci's physics as visual subject (diagrams, force arrows, mirror writing) |
| Audience | **Awwwards-style showpiece** — the experience itself is the flagship project |
| Exhibit veil reveal | **Ink dissolve** — wireframe completes its line-draw, then washes into the live app |
| Palette | **Dual-world**: bright warm parchment for the paper world (home/index); darker torch-lit marble dusk for detail pages. The tear transition carries you between them and must sell the shift. |
| Tear choreography | **Tear away to marble** — the clicked sheet rips open along an organic edge; the tear widens to fill the viewport, revealing the marble hall behind the paper |
| Boids idle glyph | **Flight-study bird** — a bird from the flight codices; legibility with drifting particles to be validated with a sketch during Phase 3 |
| Mobile stance | **Adapted, not reduced** — same world (parchment, ink previews, tear, veil); sheets stack in a scrollable pile, tap replaces hover, no cursor boids/physics |

## Core metaphor

**Draft → artefact.** Sketches of your thinking on paper; monuments of shipped work in marble. Paper = process, marble = product. The tear between them is the navigation.

---

## Experience blueprint

### The Overture — landing entrance (proposed, unscheduled)
Before the workbench settles, the very first viewport shows depth: several manuscript sheets (torn edges, scatter — reusing Phase 1's `tornEdge.ts`/`scatter.ts`) strewn across a **wooden desk/table** — decided over a marble/statuesque backdrop, so the overture stays entirely inside the paper world; no dusk palette appears until the tear. This also means the "protect the tear's payoff" rule is satisfied by construction — there's no marble here to spend early.

**Scroll behaviour:** as the visitor scrolls, the foreground sheets separate and drift apart, converging into a single manuscript.

**Click-to-blow:** clicking anywhere on the screen puffs air at the desk, scattering/fluttering the papers — a tactile gesture that leans on the same "paper has mass" physics the brief already locks in (Heavy mood, spring-driven, never snaps). Reads as delight/ambience layered on top of the scroll-driven convergence, not a replacement for it.

**Handoff:** the single manuscript the sheets converge to does **not** dissolve away — it becomes the seed for the project gallery itself. The Overture and Home — The Workbench are one continuous scroll, not two spliced clips: the desk resolves into the workbench, and that last manuscript anchors (or is) the first gallery sheet.

**Sequencing note:** not slotted into the Phase 0-7 numbering above — it depends on Phase 1's scatter/torn-edge math and benefits from Phase 3's physics groundwork (drift/separation and the blow gesture both read better with mass-driven springs than linear tweens). Schedule it once those are far enough along; treat it as its own plan/PRD when it is.

**Open questions:**
- Click-to-blow repeatability: one-shot gesture that kicks off the transition into scroll, or an ambient effect the visitor can trigger repeatedly at any point while the sheets are still on the desk?
- Click-to-blow on mobile: tap is the obvious equivalent, but needs its own confirmation — does a tap accidentally fire it during normal scrolling, or does it need a deliberate hold/gesture?
- Motion budget: scroll-driven separation (and the blow gesture's aftermath) is necessarily longer and more continuous than the brief's "max transition duration: 900ms, no simultaneous animations" constraint (aimed at discrete transitions, not a scroll-linked sequence) — needs an explicit exception carved out for this sequence, not a silent violation.
- Mobile scroll adaptation: per the mobile rule below, no cursor-driven flutter/lift since that's desktop-only physics — scroll-driven separation itself should work natively.

### Home — The Workbench
> **⚠ Superseded 2026-07-11 as the *project gallery* medium** — see the "2026-07-11 revision — The Vision Gallery" section below. Projects are no longer strewn manuscript sheets (they read as knockoffs of the overture's manuscripts); they become glassy floating frames over a golden-hour Florence vista, reached by a generated look-down → look-up camera move from the workbench. The overture (parting manuscripts) and everything below about paper *material* stands.

Warm parchment ground. Featured projects are manuscript sheets strewn across the surface — rotated, overlapping, torn-edged (procedural SVG masks), casting soft shadows. Each sheet carries a self-drawing ink diagram (the existing preview registry, re-skinned). Cursor proximity makes sheets lift and flutter with mass (spring transforms on the existing gallery hooks).

### The Tear — signature transition
Clicking a sheet rips it open along an organic procedural edge; the tear widens to fill the viewport, revealing the darker marble hall *behind the paper*. The palette shift (bright parchment → marble dusk) happens inside this transition — it is what sells the dual-world design. Delivered via the in-flight `components/page-transition/` + exit-transitions work (spec 06).

### Detail pages — The Exhibit (see dedicated section below)
Project mounted between Greek columns like an exhibited artefact, in the darker torch-lit marble-dusk palette. The activated live app becomes the brightest thing in the room — the exhibit literally glows.

### Index — The Codex
Table of contents: ruled lines, folio numbers, hand-italic annotations as tag filters.

### Boids — Ink
The cursor flock re-skins from pale-blue dots to iron-gall ink particles. Idle formation changes from the plain circle to a **flight-study bird** glyph from the flight codices. Glyph legibility with drifting particles must be validated with a target-point sketch early in Phase 3; if 120 particles can't hold the outline readably, thin the outline points or fall back to the Vitruvian circle-in-square.

### Mobile — adapted, not reduced
Same world on phones: parchment ground, ink previews, tear transition, exhibit veil. Adaptations: sheets stack in a scrollable pile instead of a strewn desk; tap replaces hover for sheet lift and veil activation; no cursor boids or paper flutter physics. Every phase's plan must state its mobile adaptation explicitly.

### Existing spec, re-aimed
- Grain shader (05) → paper fibre, warmed
- Vignette (05) → candlelit reading desk
- Springs (03) → paper mass
- R3F gallery (08) → marble hall, becomes optional Phase 7 rather than prerequisite
- Audio (07) → unchanged: paper resonance + stone hum, default off

---

## Project pages — "The Exhibit"

**Problem:** a live modern web app dropped raw into a parchment world shatters the illusion. **Rule: the app is never shown cold** — always framed, veiled, and revealed inside the metaphor.

Four layers, cheapest illusion first:

### a. The aedicula frame
The iframe sits in a marble niche — flanking columns, lintel, carved plaque below (*"Exhibit №4 — SkyHive, 2026"*) replacing the current plain `IframeWrapper` chrome. DOM + layered CC0 marble textures, no WebGL. The case-study MDX body becomes **marginalia**: ink annotations in the gutter beside the exhibit rather than a block above it.

### b. The veil — ink dissolve reveal
The exhibit starts covered by a translucent tracing-paper leaf carrying an **ink wireframe drawing of the actual app's UI** (traced SVG from a screenshot, animated stroke-by-stroke as it scrolls into view). On click, the drawing completes its final strokes, then **dissolves/washes into the live app beneath** — the study comes to life. One interaction solves three problems:

1. **Aesthetic seam** — the app is introduced as a drawing coming alive, not a jarring embed.
2. **Scroll capture** — the iframe is inert until deliberately activated.
3. **Performance** — the iframe mounts on activation, not page load.

Per-project asset: one traced SVG wireframe per embedded project. Fallback if absent: generic veil texture (plain tracing paper + title in mirror writing), same dissolve.

### c. Atmosphere continuity
The global grain/vignette overlay (`pointer-events: none`, from 05) sits above the iframe so the embed breathes the room's air. Un-activated exhibits carry a whisper of sepia "exhibit lighting" (CSS filter) that lifts to full fidelity once activated.

### d. The handshake — native embeds for own apps
New optional frontmatter flag `embedTheme: true` → the museum appends `?museum=1` to `iframeUrl`; the project reads it and renders chrome-less / adopts parchment accents. Projects that support it feel native; third-party embeds still look right behind layers a–c.

### Supporting behaviours
- **"Step inside"** control on the plaque: marble frame slides away, app goes full-viewport, thin inscription bar to return.
- **Blocked frames** (X-Frame-Options — existing detection in `IframeWrapper` kept): fallback restyled as an *"exhibit on loan — view at source"* placard.
- `iframeHeight` and `iframeMobileNote` respected; the mobile note becomes a curator's margin note.

---

## The craft bar (applies to every phase)

Standards that separate an award-level experience from a competent re-skin. Distilled from the Learning notes (`../Brain/Learning/Software Engineering/` — Motion Design Principles in 3D, Physics Feel and Interaction Design, Performance Budget Discipline, Material Language). Every phase plan is measured against these; they are acceptance criteria, not aspirations.

1. **The entrance is a designed moment.** Nothing pops in. The home gallery's sheets *settle* onto the desk (staggered springs); later phases must choreograph their own first two seconds with the same care.
2. **Anticipation and follow-through, always.** Primary motion gets a small counter-movement before it starts and secondary elements (shadows, children, particles) that stop *after* it stops. One uniform transform on a card is the tell of a template, not a world.
3. **Weight = ~80–120ms.** Satisfying responses have a tiny delay that reads as mass, not lag. Springs stay inside the brief's locked range (stiffness 40–70, damping 18–24) unless a phase plan argues an exception.
4. **Stable at any scroll position.** The user controls timing. Jump-scrolled instantly, paused halfway, interrupted mid-animation — every scroll-linked scene must be legible and unbroken at any point. Test the extremes explicitly.
5. **The performance floor is executable, not prose.** One tested module (`lib/deviceTier.ts`, Phase 0-1) decides `full | reduced | static`; every animation consumer reads it. No component invents its own capability sniff.
6. **Measured, never vibed.** Before a phase ships: a DevTools trace of its heaviest interaction at 4× CPU throttle, checked against the 60fps desktop / 30fps mid-range floor. Findings recorded; regressions filed as tasks, not accepted silently.
7. **Nothing pristine.** Aged materials read as real because of imperfection — foxing, jitter, torn edges, per-tag rotation. Every new surface asks: what's its patina?
8. **Staging: one subject per frame.** At any moment there is exactly one thing the viewer is meant to look at. If vignette, grain, scatter and an active sheet compete, something gets cut.

---

## Phases (each shippable)

| Phase | What | Builds on |
|---|---|---|
| **0. Re-brief** | Rewrite `visual-brief.md` → v2: parchment/ink/marble palette, new type system, revised material table. No code. | Spec 01 |
| **1. Paper ground** | New tokens (parchment bg, sepia ink, marble ivory), typography swap, procedural paper texture, torn-edge sheet component. Home gallery re-laid as strewn sheets — static first. | `tokens.css.ts`, `ExhibitionPanel` |
| **2. Ink previews** | Preview registry re-skinned: self-drawing SVG/canvas line diagrams per project, mirror-writing annotations, force arrows. | `previews/`, `boidsMath` |
| **3. Paper physics** | Cursor lift/flutter springs on sheets; boids → ink particles + new idle glyph. | `useBoids`, spec 03/04 |
| **4. The Tear** | Procedural tear mask animation + View Transition into detail page. | `page-transition/`, spec 06 |
| **5. The Exhibit** | Detail-page rebuild: aedicula frame, veil + ink-dissolve reveal, marginalia layout, handshake, "Step inside". | `IframeWrapper`, this spec |
| **6. Atmosphere** | Post-processing re-tuned (paper-fibre grain, warm vignette, subtle sepia grade); optional ambient audio. | Spec 05/07 |
| **7. Marble hall (optional)** | Full R3F scene per spec 08, warm HDRI, marble PBR from the v2 brief. | Spec 08 |

Phases 1–5 deliver the game-changer. 6–7 deepen it.

---

## Assets (all free / public domain)

- **Da Vinci notebooks (public domain):** Codex Atlanticus (Biblioteca Ambrosiana), Codex Arundel (British Library digitised viewer), Codex Forster (V&A), Madrid Codices, Wikimedia Commons high-res scans. Use as paper-texture reference and diagram vocabulary to **trace/redraw as SVG** (crisper, recolourable, animatable) rather than embedding scans.
- **Marble PBR:** Poly Haven / ambientCG CC0 sets (albedo + roughness + normal). Smithsonian Open Access (3d.si.edu) and Met Open Access for CC0 photos/3D scans of classical columns.
- **HDRI:** Poly Haven CC0 — warm/candlelit preset to be chosen in the v2 brief (v1's "studio" likely too cold now).
- **Type (Google Fonts):** **Cinzel** for marble headings (based on Trajan's Column inscriptions); **EB Garamond** or **Cormorant** for body; a hand-italic (**Homemade Apple** / **Caveat**) for annotations, used sparingly.
- **Procedural (zero assets):** paper grain (planned noise shader, warmed), torn edges (procedural SVG paths), ink strokes (stroke-dashoffset / canvas), foxing spots (seeded noise).
- **Existing code that survives:** `boidsMath.ts`, preview registry, `IframeWrapper` plumbing (blocked-frame detection, lazy load, fallback), `page-transition/`, all spring/motion tokens.

---

## Implementation options — Tear, Overture & click-to-blow (undecided)

Not locked decisions — a menu of real options surfaced while researching tech/algorithms for these three effects specifically (The Tear, The Overture, click-to-blow). Phase 0-1 is unaffected either way: torn edges and desk scatter stay cheap DOM/SVG regardless of what's chosen here. Resolve this menu when Phase 4 (and, if relevant, the Overture and Phase 7) actually get scoped — several of these forks constrain each other, noted below.

**1. Renderer for the Tear (and optionally the Overture's desk scene):**
- **DOM/SVG** (current Phase 0-1 approach, extended): animated torn-edge clip-path + the View Transition API for the palette/DOM swap. Cheapest, zero new dependencies, but can't do a true fold-reveals-the-back-face effect.
- **React Three Fiber (three.js) + drei's `shaderMaterial`**: a GPU vertex/fragment shader plane using `gl_FrontFacing` to show paper on the front and marble on the back as it folds past 90° — the exact technique behind the Nov 2025 Codrops fold/curl case study that inspired this idea. Natural growth path into Phase 7's optional full 3D marble hall (same renderer/scene graph).
- **PixiJS (WebGL2, 2D-native) or a raw WebGL2 canvas**: same fold/curl shader math, far lighter bundle than three.js/R3F — but Phase 7's marble hall would need a second renderer or a rewrite if it's ever built.
- *Fork to resolve together:* only commit to R3F now if Phase 7 is realistically happening; otherwise PixiJS/raw WebGL gets the same tear effect for less weight.

**2. Fallback for reduced motion / low-end hardware:**
- If the Tear becomes a WebGL shader effect, the DOM/SVG torn-edge path already built in Phase 0-1 (`tornEdge.ts`, `TornSheet`) is a ready-made fallback for `prefers-reduced-motion` and the existing static-fallback tier (`hardwareConcurrency ≤ 2` / `deviceMemory < 4GB`) — reuse, not a second build.

**3. Scroll choreography** (the Overture's convergence; any scroll-linked build-up on the Tear):
- **GSAP + ScrollTrigger** — what the actual Codrops fold/curl source uses.
- **Theatre.js** — visual timeline scrubbing in-browser, outputs a scroll-progress-to-timeline mapping; more visual/less code-first than GSAP.
- **Native CSS `animation-timeline: scroll()`** — zero-JS, browser-native, but landing support is still Chromium-led; candidate for the simpler DOM-only parts with a JS fallback.
- **Framer Motion's own `useScroll`/`useTransform`/`useVelocity`** — already in the stack, no new dependency; the "add nothing new yet" option.
- **Lenis** — smooth-scroll plus a shared velocity store multiple systems (shader uniforms, DOM parallax) can read from; usually paired with the R3F option above.

**4. Click-to-blow physics:**
- **Hand-rolled velocity integrator** (impulse + damping each frame) — same pattern as the existing `useBoids.ts`, no new dependency, consistent with Phase 1's house style of pure seeded math (`scatter.ts`, `tornEdge.ts`).
- **matter.js / planck.js** — lightweight 2D rigid-body engines, JS not WASM; closest fit if the papers stay in 2D DOM/canvas space.
- **@react-three/rapier** — WASM rigid-body physics; only makes sense paired with the R3F renderer option, and its performance ceiling alongside scroll + post-processing in one scene is an open question, not a verified pattern.
- **Build the gesture visually in Spline**, export as R3F code — a prototyping shortcut worth trying before hand-coding.
- **GSAP's InertiaPlugin/Physics2DPlugin** — paid (Club GreenSock); the only option here with a licensing cost attached.

**5. Shader authoring** (if the R3F/WebGL path is chosen):
- **Raw GLSL via drei's `shaderMaterial`** — well-documented, what the reference technique uses.
- **TSL (Three.js Shading Language)** — the modern replacement for hand-patched materials; worth spiking before defaulting to raw GLSL on a new build.

**6. Marble/paper texture source** (if a shader-material route is chosen):
- **Procedural**: noise-based veining generated in-shader (Perlin/simplex) — infinite variation, no asset pipeline, more shader math; exact veining formula is still unresolved.
- **Baked/photographed PBR**: Quixel Mixer or Poly Haven — already the design spec's committed source for HDRI + marble PBR (see Assets, above) — simpler shaders, requires the asset pipeline (Blender bake → KTX2 compression for mobile).

**7. Dev tooling** (applies regardless of renderer choice, if any GLSL gets written):
- **Leva** for live uniform tuning during development — the tool most likely to make iteration on tear/blow feel tractable at all.

---

## Open questions (resolve in Phase 0 brief or first relevant plan)

- [ ] Exact hex values for both palettes: bright parchment world (paper, ink, annotation accents) and marble-dusk world (stone, shadow, torch warmth) (Phase 0)
- [ ] Bird glyph target points: does the flight-study outline hold with 120 particles? Fallback: Vitruvian circle-in-square (Phase 3)
- [ ] HDRI preset: which warm Poly Haven environment (Phase 0, needed only for Phase 7)
- [ ] Which projects get traced SVG wireframes first (Phase 5)

---

## 2026-07-11 revision — The Vision Gallery

**Status: agreed during lab iterations. Supersedes the strewn-pile "Workbench shuffle" as the project gallery medium. The Overture (parting manuscripts) is retained.**

### Why the pivot

The project sheets in the pile read as a cheap knockoff of the hero manuscripts — same medium, worse execution, competing with the thing they follow. Instead of improving them, the projects change medium entirely: **paper is his process; glass visions are what he imagined.** Projects stop being more paper and become the futures da Vinci saw.

### The narrative spine

The visitor is behind da Vinci's eyes. One continuous scroll:

1. **The Overture** *(kept as built in the lab)* — huge manuscripts part and sweep away as you scroll. Change from the earlier seam design: ALL five sheets exit (the codex-atlanticus "lands on the pile" handoff is retired — there is no pile to seed). The parting reveals not a DOM desk but…
2. **The Desk (looking down)** — a generated still, bird's-eye POV of his own workbench: black leather boots with buckle-shine from the setting sun, worn terracotta floor tiles, the empty well-used oak workbench. The stillness after the papers clear. Site title composited as DOM type over the still's reserved calm area (never baked into the image).
3. **The Lift (looking up)** — he raises his gaze: generated video, camera tilting up from the boots/desk to the view from his Florentine home — fields, cypresses, the city and Duomo in golden-hour haze. *The parallel: Florence is where he trained; this site is where I build myself.* Curator line lives here, as a hand-note over the vista.
4. **The Vision (the projects)** — over the settled horizon vista, the projects materialise as **glassy frames** — as he might have imagined them. A horizontal rail driven by continued vertical scroll, left to right. They float with a gentle cloud-like bobble (never cloud-shaped). Cursor movement over a pane feeds a **water ripple across the glass** — the scene's one signature interaction. Click: into the project detail (transition TBD — candidate: the ripple swells to fill the frame and washes into the live app, harmonising with the Exhibit veil's ink-dissolve).
5. **Coda / invitation** — open; design when the rail feels right.

### Medium & mechanics per beat

| Beat | Material (generated) | Life (code) |
|---|---|---|
| Overture | 5 manuscript scans *(have — WebP in `public/lab/overture/`)* | Parting choreography, torn edges, ink spots *(built — `components/lab/DeskScene`)* |
| The Desk | `vision-desk` still, 16:9 ≥2560px | DOM title overlay; entrance grade/vignette |
| The Lift | `vision-tilt` video (4–6s, first/last frame conditioned on the two stills) | Scroll integration — see open question 1 |
| The Vision | `vision-horizon` still as backdrop | Glass frames *(built — `components/lab/VisionScene`)*: liquid glass holding live `ProjectPreview`s; per-slug float personality; cursor tilt; movement-fed ripple displacement; chromatic edge split |

**Asset-first token inversion:** the vista's colour tokens (`vista*` family, or reuse of `duskTorch`/`duskText`) get **sampled from the approved stills**, not decided beforehand — the generated material is the source of truth, tokens follow it.

### Tier behaviour

- `full` — video lift, bobbing frames, ripple.
- `reduced` — stills crossfade in place of the video; frames static, ripple replaced by a simple glass highlight on hover.
- `static` — `vision-horizon` still + static frame grid. No video ever downloads.

### Mobile

Vertical rail instead of horizontal; tilt video needs a 9:16 generation variant (or a centre-crop check); tap = bobble+ripple.

### Promotion plan (two stages, gated on assets)

- **Stage 1 — home becomes Overture + Vision** *(blocker: `vision-horizon` still only)*: rebuild `app/page.tsx` as `DeskScene` → `VisionScene`; Hero/CuratorLine/GalleryTrack/ExhibitionPanel/`scatter.ts` deleted; glass frames become real links with keyboard focus; mobile vertical rail; preload/LCP strategy; `reduced`/`static` QA; 4× CPU throttle trace; precision spec written from lab values; `/lab` deleted.
- **Stage 2 — the Lift** *(blockers: `vision-desk` still + tilt video)*: inserts the looking-down beat and video transition between the two movements. Isolated by design — the risky video-scroll engineering never blocks stage 1.

### Open questions (resolve in the lab, in this order)

1. **How scroll drives the Lift.** Options: (a) scrubbed frame-sequence on canvas (~90 extracted frames — jump-scroll safe, but heavy), (b) play-once video triggered at a scroll threshold (light, but fights the scroll-owns-time principle), (c) reduced-tier crossfade promoted to all tiers if (a)/(b) both disappoint. Decide with a real video in hand.
2. **Frame-to-detail transition** — ripple-wash into the app vs. the tear? The tear was designed for paper; glass may want its own verb. Must not orphan the Exhibit veil concept above.
3. **Overture → Desk reveal** — do the parting papers reveal the still directly (parchment ground fades during the last parting beats), or is there a residual desk-DOM beat? Instinct: direct reveal, the still *is* the desk.
4. **Title placement** — on the Desk still (beat 2) vs. carried into the vista. Instinct: title on the desk, curator note on the vista.
5. **Rail density** — how many frames on screen; one-subject-per-frame staging under bobble motion.

### What this retires / keeps

- **Retired:** pile shuffle as project gallery; the atlanticus pile-seed seam; portrait "workbench project sheet with cartouche" asset plan.
- **Kept:** the entire Overture (choreography, tears, ink, entrance settle); `TornSheet`/`tornEdge`/`InkSpots`; deviceTier gating.
- **Unchanged:** detail pages (Exhibit/aedicula/veil), index (Codex), boids plan.

Generation prompts for all Vision assets live in `overture-asset-prompts.md` (stills before video — the tilt video is conditioned on the two approved stills).

---

## Parked direction — Physical Paper (WebGL)

**Status: agreed direction, deferred past the current phase (Overture + Vision promotion).**

The route from "themed page" to "award page" for the hero manuscripts: paper becomes physically modelled in WebGL.

### The four behaviours

1. **Scroll pull-away** — scrolling applies force that peels sheets off the pile.
2. **Bend / curl / fold** — sheets are flexible surfaces, not rigid rectangles.
3. **Lighting on a flexing plane** — light responds to curvature; paper is flexible across its width but rigid lengthwise.
4. **Cursor interaction** — nearby paper pushes away, springs back.

### The critical implementation decision: procedural deformation, NOT cloth simulation

A real cloth sim (position-based dynamics, constraint solving) is the trap: jittery, un-art-directable, expensive, and history-dependent (breaks craft-bar #4 — stable at any scroll position). Instead: **plane mesh deformed in the vertex shader by a handful of scalar parameters, each driven by springs** (locked range: stiffness 40–70, damping 18–24).

- **Curl**: paper is a developable surface — bends around one axis at a time, rigid along its length (behaviour 3 exactly). Cylindrical bend in a vertex shader, ~10 lines. Inherently prevents fake-looking double-curves.
- **Pull-away**: scroll velocity pins the leading edge; the body lags and curls behind it, like a page lifted off a stack.
- **Cursor push**: radial field displacing nearby vertices, sprung return. Geometry analogue of the boids' cursor awareness.
- **Lighting**: recompute normals on the bent surface + one warm directional (candle/lamp) → sheen travels across the page as it flexes. The payoff no 2D approach can imitate.

Deterministic, art-directable per frame, ~5 sheets × 2k vertices (trivial), stable when jump-scrolled.

### Scope discipline

- **Overture only.** Hero sheets are decorative (no links, no live content) — perfect WebGL citizens. Interactive content stays DOM.
- **The 2D DOM overture becomes the `reduced` tier**, not dead code. `full` → WebGL bending paper; `reduced` → DOM parting; `static` → settled composition. `lib/deviceTier.ts` already gates this.
- **Tears migrate**: `tornEdgePath` renders to an alpha-mask texture (fibre rim bakeable in), so torn silhouettes and per-seed determinism survive.
- **Assets carry over untouched**: the generated scans become mesh textures.

### Cost & entry point

New deps: `three`, `@react-three/fiber` (+ selective drei). Shader work is the skill-intensive part; several lab rounds. When resumed, start with a minimal spike: **one** sheet — scan texture, torn alpha mask, curl parameter, warm directional light, cursor push. Aligns with Phase 3 (paper physics) groundwork and de-risks Phase 7 (R3F marble hall).

### Related, also parked

- **Candlelight cursor reveal** (Lithos-style two-image soft mask): warm light following the cursor brightens parchment / reveals faint mirror-writing beneath drawings. Hold until base material lands (one-signature-mechanic rule).
- **Click-to-blow** (see Overture section above): natural fit once the push-field exists.
