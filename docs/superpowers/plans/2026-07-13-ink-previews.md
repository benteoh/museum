# Ink Previews — Implementation Plan
**2026-07-13 | Self-contained prompt for the implementing agent. One PR, one shot.**

**Goal:** re-skin the project preview registry as **da Vinci studies** — self-drawing line diagrams with mirror-writing annotations — replacing the pre-rebrand night-gallery canvases (ice-blue boids on dark, steel-blue cubes on navy) that currently float inside the glass frames over the golden vista. This is Phase 2 ("Ink previews") of the Living Codex design, adapted for the Vision Gallery pivot.

## Read before writing any code

1. `AGENTS.md` — this Next.js version differs from training data; read `node_modules/next/dist/docs/` for anything Next-specific.
2. `docs/superpowers/specs/2026-07-02-living-codex-design.md` — the phase table (Phase 2), **"The craft bar"** (acceptance criteria, not aspirations), the **"2026-07-11 revision — The Vision Gallery"** section, and its **"Shipped values — Stage 1"** appendix (the world these previews now live in).
3. `docs/superpowers/specs/2026-06-14-museum-day2-showcase-design.md` §2 "The Preview Model" — `ProjectPreview` resolution order (bespoke component → `heroImage` → `DefaultPreview`), registry, and the non-interactive rule. These previews render inside links; they must stay `pointer-events`-inert and own no interaction.
4. `docs/superpowers/specs/visual-brief.md` — palette tokens, type, motion constraints.
5. The code being replaced: `components/projects/previews/` (all files), `components/projects/ProjectPreview.tsx`, and the three consumers — `components/vision/VisionScene.tsx` (glass pane, `plate` slot), `components/projects/ProjectCard.tsx` (index, paper world), `components/project-detail/IframeWrapper.tsx` (detail page placeholder).
6. `components/overture/StudyDrawing.tsx` — the house vocabulary for procedural manuscript line-work (pseudo mirror-writing, seeded geometry via `mulberry32`/`hashSeed` from `components/paper/tornEdge`). Reuse its idioms; extract shared helpers rather than duplicating.

## The design decision (resolved — do not relitigate)

Phase 2 was written pre-pivot, when previews sat on paper. They now render in **two worlds**, so every study gets **one geometry, two ink treatments**, selected by a `world` prop on `ProjectPreview` (default `'paper'`, threaded through to the preview components):

- **`world="paper"`** (index cards, detail placeholder): iron-gall sepia strokes on the parchment surface — a study in his notebook. Ink literals mirror `textPrimary`/`accent`/`monoTag`.
- **`world="glass"`** (Vision panes): the same drawing as **warm luminous strokes on a transparent/near-transparent ground** — a golden-hour blueprint of an imagined future, glowing faintly inside the glass. Stroke literals mirror `duskText`/`duskTorch`; keep any glow subtle (the pane already has specular effects — craft bar #8, one subject per frame: the preview is the pane's *content*, not a competing spectacle).

`VisionScene` passes `world="glass"`; the other two consumers pass nothing (paper default). The narrative rationale (paper = his process, glass = what he imagined) gets a short **"Ink previews — dual register"** subsection appended to the Vision Gallery section of the design doc as part of this PR.

## Constraints (non-negotiable)

- **Kill the capability sniffs.** All three existing previews call `window.matchMedia('(prefers-reduced-motion)')` directly. Every re-skinned preview reads `useDeviceTier()` instead (craft bar #5): `full` = draw-on entrance + one quiet idle motion; `reduced` = fully-drawn static study (a draw-on entrance is autonomous motion — drop it); `static` = same fully-drawn static study.
- Springs, if any, stay in the locked range (stiffness 40–70, damping 18–24); the draw-on itself should be duration/ease-based line drawing, not springs.
- Colour through `vars.color.*`; canvas/SVG stroke literals that mirror a token are the documented exception — say which token, in a comment, per file.
- **Perf is part of the deliverable.** Previews live inside `backdrop-filter` panes; a perpetually-painting canvas forces pane re-raster (stage 1 shipped a fix for exactly this class of bug — see the "Shipped values" appendix, ripple filter). Requirements: rAF loops pause when the element is offscreen (IntersectionObserver) and when `document.hidden`; idle state after the draw-on should paint *nothing per-frame* unless its one idle motion is actually moving; re-run the stage-1 trace methodology on the vision rail after the change (4× CPU throttle, headless Playwright + CDP) and record numbers in the PR. No regression vs the stage-1 appendix numbers.
- Previews stay decorative: no pointer handlers, no focus targets (the pane link owns interaction).
- `pnpm test` and `pnpm build` green at every commit. Commit per work package.

## Current state

- Registry `components/projects/previews/index.ts`: `museum-of-little-things` → boids canvas (`#B8D4E8` on dark), `skyhive` → isometric cubes (`#0d1520` navy bg). Both night-gallery palette, both wrong in both worlds now.
- `DefaultPreview.tsx`: calm dot-field canvas tinted by `heroColour` — acceptable colour-wise but off-register; it becomes the generic study.
- `resolvePreview.ts` + tests: resolution logic — **behaviour unchanged**, do not touch the resolution order.
- `boidsMath.ts` (in `previews/`): particle math used by the m-o-l-t preview; keep it (tests exist), reuse where a study wants moving motes.

## Work packages

**A — the study kit.** A small shared module in `components/projects/previews/` (e.g. `studyKit.ts` + optional shared css): seeded pseudo-mirror-writing line blocks, self-drawing stroke helpers (SVG `stroke-dasharray`/`dashoffset` preferred — cheap, no per-frame canvas repaint; canvas only where geometry demands it), force-arrow primitive, and the dual-ink palette pairs (paper/glass) with token-mirror comments. Extract/share with `StudyDrawing` where sensible instead of copying.

**B — the three previews, re-drawn.**
1. `MuseumOfLittleThingsPreview` — a study *of a museum of little things*: e.g. a small plan/elevation sketch (aedicula, plinths) with tiny seeded exhibit glyphs, visitors as drifting ink motes (reuse `boidsMath`, heavily calmed — this is the one idle motion), mirror-writing captions with leader lines.
2. `SkyhivePreview` — keep the isometric-cube identity but as **line-work stereometry**: wireframe hive cubes with construction lines, section hatching, dimension marks; idle motion = one cube group slowly assembling/exploding along its axis, or nothing if it can't stay quiet.
3. `DefaultPreview` — the generic study for future projects: seeded (by `heroColour`-derived hue accent + slug if available, else colour only) composition of a ruled mirror-writing block + one geometric diagram (circle-in-square / polygon study) that draws itself. Must look intentional, not lorem-ipsum.

Each accepts `{ world: 'paper' | 'glass' }`; wire the prop through `ProjectPreview` and set `world="glass"` in `VisionScene` only.

**C — verify, trace, document.**
1. Visual pass with Playwright screenshots at 100% zoom in **all three contexts × both worlds where applicable**: home vision rail (glass), `/projects` index (paper), a project detail page placeholder (paper). Also mobile stack (375px) and the static-tier grid (2-core emulation). Iterate until the studies read as drawings, not decorations.
2. Tier QA: full (draw-on visible on scroll-in), reduced (`prefers-reduced-motion` emulation: fully drawn, still), static (fully drawn, still).
3. Perf trace per the constraint above; numbers in the PR description.
4. Append the **"Ink previews — dual register"** subsection to the design doc (decision + shipped stroke palettes + idle-motion inventory); tick/annotate anything relevant in `.taskmaster/tasks/tasks.json` (task 7 stays open — not this PR).

## Out of scope (do not build)

- The frame→detail transition, Exhibit/detail-page rebuild, index re-skin beyond what the new previews change visually.
- Any change to `resolvePreview` order, MDX schema, or `heroImage` handling (image previews still win over `DefaultPreview`).
- The tilt video / stage 2; boids cursor layer; `StudyDrawing` refactors beyond helper extraction.
- New generated image assets — this package is procedural code only.

## Branch / PR

Branch `ink-previews` off `vision-home-plan` (stage 1 lives there; if PR #5 has merged by the time you start, branch off `master` instead). Open one PR titled **"Living Codex: ink previews (dual register)"** — base `vision-home-plan` if #5 is unmerged, else `master` — describing the register decision, trace numbers, and any deviations from this plan.

## Definition of done

`pnpm test` and `pnpm build` green; all three previews + default re-drawn with dual ink registers and reading well in screenshots across contexts, tiers, and both worlds; zero `matchMedia` sniffs left in `previews/`; rail perf traced with no regression vs the stage-1 appendix; spec subsection appended; one PR up.
