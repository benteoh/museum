# Task ID: 6

**Title:** Scatter Math & Manuscript ExhibitionPanel

**Status:** pending

**Dependencies:** 2, 4, 5

**Priority:** medium

**Description:** Create scatter.ts for desk-scatter transforms, re-skin ExhibitionPanel with TornSheet and manuscript styling

**Details:**

Create `components/paper/scatter.ts` (pure module). Export `sheetScatter(index: number): {rotate: number, dx: number, dy: number}`. Use `mulberry32((index+1)*7919)` to get a seeded PRNG per index. Return rotate in ±3.5°, dx in ±12px, dy in ±16px — deterministic "strewn on a desk" transforms. Create `tests/components/paper/scatter.test.ts` verifying determinism per index, variance across indices, and bounds for the first 50 indices. Run test to verify PASS. Rewrite `components/gallery/ExhibitionPanel.css.ts`: replace the old glass-vitrine styles with manuscript-sheet styles using vars.color.surface (sheet bg), vars.color.inkFaint (border), vars.color.textPrimary/monoTag (text/tags), vars.font.display (title), vars.font.hand (tags), vars.color.sheetShadow (drop-shadow, not box-shadow, to follow torn clip). Define link (drop-shadow filter with hover lift), sheetWrap (clamp width 320px-560px, height 70vh), sheet (flex column, surface bg), plate (flex-1 preview area), colophon (caption strip with border-top, padding, gap). Rewrite `components/gallery/ExhibitionPanel.tsx`: import TornSheet, sheetScatter. Replace the old rotateY vitrine tilt with the 2D scatter. On motion.article, animate `{ rotate: isActive ? scatter.rotate*0.3 : scatter.rotate, x: scatter.dx, y: scatter.dy, scale: isActive ? 1.03 : 1 }`. Wrap the sheet content in <TornSheet seed={project.slug}>. The sheet div contains: (1) a `plate` div with <ProjectPreview> (unchanged props); (2) a `colophon` div with the title (h3) and tags (meta spans). ExhibitionPanelSkeleton uses the same structure with <Skeleton>. GalleryTrack.tsx is UNTOUCHED (props unchanged). Run `pnpm test` (expect PASS for all suites including existing galleryMath, resolvePreview, useBoids), `pnpm build` (expect success), `pnpm dev` visual check: home gallery shows torn-edged sheets on parchment with individual rotation/offset, active sheet straightens slightly and scales up.

**Test Strategy:**

Unit tests for scatter (determinism, bounds). All existing test suites pass. Build succeeds. Visual verification: home gallery (/) shows manuscript sheets with torn edges, desk scatter (slight rotation/offset per sheet), active sheet animates (straightens, scales). Foxing spots visible on sheets. Dark canvas previews acceptable (Phase 2 will re-skin them to ink).

## Subtasks

### 6.1. Create scatter.ts module with sheetScatter function

**Status:** pending  
**Dependencies:** None  

Implement the pure scatter math module that generates deterministic 2D transforms for desk-scatter effect using seeded PRNG

**Details:**

Create `components/paper/scatter.ts` as a pure module. Implement `mulberry32(seed: number)` PRNG function that returns a deterministic random generator. Export `sheetScatter(index: number): {rotate: number, dx: number, dy: number}` function that uses `mulberry32((index+1)*7919)` to get a seeded PRNG per index. Generate rotate in range ±3.5°, dx in range ±12px, dy in range ±16px. The transforms must be deterministic (same index always produces same output) to create a stable "strewn on a desk" visual effect. Pattern follows the existing `boidsMath.ts` pure module structure.

### 6.2. Write scatter.test.ts with determinism and bounds verification

**Status:** pending  
**Dependencies:** 6.1  

Create comprehensive unit tests for the scatter module following the project's vitest testing patterns

**Details:**

Create `tests/components/paper/scatter.test.ts` following the pattern of `tests/components/projects/previews/boidsMath.test.ts`. Write test suites using vitest (describe/it/expect) that verify: (1) `sheetScatter` is deterministic - calling with same index multiple times returns identical rotate/dx/dy values; (2) variance across indices - different indices (0-49) produce different transform values; (3) bounds checking - for indices 0-49, verify rotate is within [-3.5, 3.5], dx within [-12, 12], dy within [-16, 16]. Run `pnpm test` to verify all tests PASS including existing suites (galleryMath, resolvePreview, useBoids, boidsMath).

### 6.3. Rewrite ExhibitionPanel.css.ts with manuscript-sheet styles

**Status:** pending  
**Dependencies:** None  

Replace glass-vitrine styling with manuscript-sheet aesthetic using paper-world color tokens and torn-edge shadow effects

**Details:**

Rewrite `components/gallery/ExhibitionPanel.css.ts` to replace the old glass-vitrine aesthetic. Import `vars` from `@/styles/tokens.css`. Update `link` style: add `filter: drop-shadow(...)` using `vars.color.sheetShadow` (rgba(56,44,25,0.18)) with hover lift effect (adjust shadow on hover). Create `sheetWrap` style: width clamp(320px, 40vw, 560px), height 70vh. Create `sheet` style: flex column layout, background `vars.color.surface`, no border-radius (torn edges come from TornSheet clip). Create `plate` style: flex-1 for preview area. Create `colophon` style: caption strip with border-top using `vars.color.inkFaint`, padding and gap from `vars.space.*`. Update `title` to use `vars.font.display`, `vars.color.textPrimary`. Update `meta` to use `vars.font.hand` for tags, `vars.color.monoTag`. Remove old `panel` and `glass` styles completely.

### 6.4. Rewrite ExhibitionPanel.tsx with TornSheet and 2D scatter animations

**Status:** pending  
**Dependencies:** 6.1, 6.3  

Replace rotateY vitrine tilt with 2D desk-scatter transforms, integrate TornSheet wrapper, restructure DOM with plate/colophon layout

**Details:**

Rewrite `components/gallery/ExhibitionPanel.tsx`. Import `TornSheet` from `@/components/paper/TornSheet` and `sheetScatter` from `@/components/paper/scatter`. In `ExhibitionPanel` component: compute `scatter = sheetScatter(index)` at component top. Replace the `rotateY` calculation with 2D transforms - remove old `rotateY` and `MAX_TILT` logic. Update `motion.article` animate prop to: `{ rotate: isActive ? scatter.rotate*0.3 : scatter.rotate, x: scatter.dx, y: scatter.dy, scale: isActive ? 1.03 : 1 }` (active sheet straightens to 30% rotation and scales up). Restructure DOM: wrap content in `<TornSheet seed={project.slug}>`, create a `sheet` div containing (1) `plate` div with `<ProjectPreview>` (unchanged props), (2) `colophon` div with title (h3) and tags (meta spans). Update `ExhibitionPanelSkeleton` to match structure with `<Skeleton>`. Ensure `GalleryTrack.tsx` passes same props (project, index, activeIndex) - no changes needed there.

### 6.5. Run full test suite, build, and visual verification

**Status:** pending  
**Dependencies:** 6.2, 6.4  

Execute complete validation: unit tests, production build, and visual verification of manuscript gallery on home page

**Details:**

Run `pnpm test` to verify ALL test suites pass: existing tests (galleryMath, resolvePreview, useBoids, boidsMath) plus new scatter.test.ts. Run `pnpm build` to verify production build succeeds with no errors. Run `pnpm dev` and navigate to home page (`/`) for visual verification: (1) gallery displays manuscript sheets with torn edges from TornSheet component, (2) each sheet has individual desk-scatter transform (slight rotation and x/y offset), (3) active sheet (center) animates smoothly - straightens rotation to 30% and scales to 1.03, (4) foxing spots visible on sheets from TornSheet overlay, (5) manuscript color palette applied (parchment surface, ink colors, proper typography). Verify no console errors and smooth animations.
