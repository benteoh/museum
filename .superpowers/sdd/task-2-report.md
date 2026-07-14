# Task 2 report — redraw project previews and wire dual worlds

## Status

Implemented and verified on branch `ink-previews`, starting from clean head `a8f503809d5983f70b55fdb638f092d9ebb8d34f`.

## Delivered

- Replaced all three canvas/night-gallery previews with deterministic da Vinci-style SVG studies.
- `MuseumOfLittleThingsPreview` now renders an aedicula/elevation, seeded exhibit glyphs, mirror-writing captions and leaders, plus six heavily calmed visitor motes driven by `boidsMath`.
- `SkyhivePreview` now renders isometric wireframe cubes, construction axes, section hatching and dimension marks, with one quiet CSS assembly/explode idle motion on the full tier.
- `DefaultPreview` now renders seeded ruled mirror-writing and a circle/square/polygon geometry study. Its geometry seed combines slug and `heroColour` when supplied.
- All previews accept `world: 'paper' | 'glass'`; the SVG geometry is unchanged across worlds and only the shared ink treatment changes.
- `ProjectPreview` defaults to paper, passes the world to bespoke/default previews, stays pointer-inert/decorative, and preserves bespoke → hero image → default resolution.
- `VisionScene` alone supplies `world="glass"`; paper consumers continue using the default.
- Removed every direct `matchMedia` call from `components/projects/previews/`; each preview uses `useDeviceTier()`.
- Full tier uses declarative SVG draw-on. Reduced/static render fully drawn and still. Default has no idle loop.

## TDD evidence

### Initial RED

Command:

```text
pnpm test -- tests/components/projects/previews/boidsMath.test.ts tests/components/projects/previews/previewContracts.test.tsx
```

Result: exit 1, 11 expected behavioral failures (66 existing tests passed):

- injected random source was ignored;
- calm speed ceiling was ignored;
- SVG study/world markers did not exist;
- Vision glass and ProjectPreview paper threading did not exist;
- deterministic default geometry and tier draw state did not exist;
- Museum visibility-gated rAF did not exist.

The failures were against existing imports and running components, not syntax or missing-module failures.

### Initial GREEN

Command:

```text
pnpm exec vitest run tests/components/projects/previews/boidsMath.test.ts tests/components/projects/previews/previewContracts.test.tsx
```

Result: exit 0, 2 files / 17 tests passed.

### Entrance/idle sequencing RED → GREEN

Self-review identified that Museum motes initially began at the same time as SVG draw-on. A new assertion required no rAF until the 1.5-second entrance settled.

- RED: exit 1, 1 expected failure (`requestAnimationFrame` called immediately).
- GREEN: exit 0, 1 file / 9 tests passed after adding entrance-delay state.

The final lifecycle contract also verifies offscreen cancellation, immediate resume after the completed entrance, and cancellation on `document.hidden`.

## Files changed

- `.superpowers/sdd/task-2-report.md`
- `components/projects/ProjectPreview.tsx`
- `components/projects/previews/DefaultPreview.tsx`
- `components/projects/previews/MuseumOfLittleThingsPreview.tsx`
- `components/projects/previews/SkyhivePreview.tsx`
- `components/projects/previews/boidsMath.ts`
- `components/projects/previews/index.ts`
- `components/projects/previews/PreviewStudy.css.ts` (new shared SVG motion/presentation)
- `components/projects/previews/DefaultPreview.css.ts` (removed obsolete canvas style)
- `components/vision/VisionScene.tsx`
- `tests/components/projects/previews/boidsMath.test.ts`
- `tests/components/projects/previews/previewContracts.test.tsx` (new)

## Performance-loop reasoning

- Default and Skyhive do not use rAF. Their draw-on uses SVG dashoffset CSS animation, so there is no JavaScript repaint loop after entrance.
- Skyhive's only idle motion is one cube group transformed by CSS; reduced/static never receive its animation class.
- Museum is the only preview with rAF. It updates six SVG circle attributes and calls the existing pure `boidsMath.tick` with `maxSpeed: 0.08` and `maxForce: 0.004`.
- Museum schedules no rAF before it is intersecting. It waits 1.5 seconds for draw-on to settle, cancels the scheduled frame offscreen or when `document.hidden`, and resumes only when visible. Reduced/static do not install the observer or schedule animation work.
- No canvas is used, avoiding full-surface canvas paints within backdrop-filter panes.
- A source scan found zero `matchMedia` references in `components/projects/previews/` and only Museum contains `requestAnimationFrame` there.

## Verification

- Focused RED/GREEN commands: recorded above.
- Touched-file ESLint: exit 0, no output.
- `git diff --check`: exit 0.
- Preview `matchMedia` scan: no matches.
- Fresh `pnpm test`: exit 0 — 11 files, 77 tests passed.
- Fresh `pnpm build`: exit 0 — Next.js 16.2.7 compiled, TypeScript passed, and 9/9 static pages generated.

## Self-review

- Rechecked the Task 2 brief line by line and preserved `resolvePreview` unchanged.
- Verified that paper/glass tests compare geometry while requiring different ink treatments.
- Verified decorative roots are `aria-hidden`, SVGs are non-focusable, and shared preview CSS is pointer-inert.
- Confirmed no docs/taskmaster files were touched.

## Concerns

- Next build emits the repository's existing multiple-lockfile/workspace-root inference warning; it does not affect the successful build.
- This work package did not run a browser screenshot pass or CDP performance trace; those were not requested in the Task 2 brief and docs/taskmaster work is explicitly reserved for Task 3. The loop architecture and lifecycle are covered by deterministic unit/component contracts.
