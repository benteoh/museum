# Task ID: 8

**Title:** Night-Gallery Colour Literal Sweep

**Status:** pending

**Dependencies:** 2, 3, 6

**Priority:** medium

**Description:** Replace all hardcoded old-palette hex/rgba literals with vars.color.* tokens across app/, components/, styles/

**Details:**

Use Grep tool to search app/, components/, styles/, hooks/, lib/ for old night-gallery color literals: #0D0F14, #151820, #1E2330, #B8D4E8, #6A9AB8, #3D5A73, #E8EDF2, and rgba patterns like rgba(13,15,20, rgba(184,212,232, rgba(21,24,32. List every hit with file:line. For each hit, replace with the equivalent vars.color.* token per the mapping: #0D0F14 → vars.color.bg (or vars.color.sheetShadow for shadows), #151820 → vars.color.surface, #1E2330 → vars.color.border, #B8D4E8 → vars.color.accent (or vars.color.accentDim for dimmer uses), #6A9AB8 → vars.color.accentDim, #3D5A73 → vars.color.monoTag, #E8EDF2 → vars.color.textPrimary. TWO DOCUMENTED EXCEPTIONS (defer to later phases, leave as-is, note in commit message): (1) hooks/useBoids.ts and components/cursor/BoidsCanvas.tsx particle color literals (boids re-skin to ink is Phase 3); (2) canvas preview components (components/projects/previews/*Preview.tsx) — the ink re-draw is Phase 2. For DefaultPreview.tsx, ONLY change reduced-motion/background fallbacks if they reference the old surface color: replace with the literal '#F3ECD8' (canvas can't read vars, use a comment pointing at vars.color.surface). Known files to check: components/gallery/GalleryTrack.css.ts, components/projects/previews/DefaultPreview.tsx, app/projects/[slug]/page.css.ts, components/project-detail/IframeWrapper.css.ts, components/nav/Nav.css.ts, components/hero/Hero.css.ts, components/projects/ProjectCard.css.ts, components/gallery/ExhibitionPanel.css.ts. After replacements, run `pnpm test` (expect PASS), `pnpm build` (expect success), `pnpm dev` full-site visual pass: check /, /projects, and /projects/[slug] for no leftover dark-navy patches, text legible on parchment everywhere, status badges readable. Detail pages render in paper world for now (marble-dusk is Phase 5).

**Test Strategy:**

All test suites pass. Build succeeds. Visual verification: /, /projects, and at least one detail page (/projects/skyhive or similar) show no old dark-navy colors, all text legible on parchment, status badges (verdigris/ochre) readable. Grep for old literals should return only the two documented exceptions (boids, canvas previews) with comments explaining deferral.

## Subtasks

### 8.1. Audit and document all old-palette color literals

**Status:** pending  
**Dependencies:** None  

Use Grep to comprehensively search app/, components/, styles/ for all old night-gallery color literals and create a complete file:line inventory

**Details:**

Run Grep searches for hex patterns (#0D0F14, #151820, #1E2330, #B8D4E8, #6A9AB8, #3D5A73, #E8EDF2) and rgba patterns (rgba(13,15,20, rgba(184,212,232, rgba(21,24,32). Document every hit with file:line reference. Exclude documented exceptions: hooks/useBoids.ts, components/cursor/BoidsCanvas.tsx, components/projects/previews/*Preview.tsx (except DefaultPreview.tsx reduced-motion fallback), docs/**, content/**, public/**. Expected files to fix: components/projects/ProjectCard.css.ts:41, components/hero/Hero.css.ts:31, components/nav/Nav.css.ts:20, components/gallery/ExhibitionPanel.css.ts:17,20,34,35,40,41, components/projects/previews/DefaultPreview.tsx:19,29,51,54. Create a mapping table showing old literal → new vars.color.* token for each occurrence.

### 8.2. Replace rgba shadow literals in ProjectCard and Hero

**Status:** pending  
**Dependencies:** 8.1  

Update badge backdrop in ProjectCard.css.ts and text shadow in Hero.css.ts to use vars.color tokens

**Details:**

In components/projects/ProjectCard.css.ts:41, replace 'rgba(13, 15, 20, 0.55)' with a vars.color.sheetShadow token or construct from vars.color.bg if needed (note: new palette uses rgba(56,44,25,0.18) for sheetShadow). In components/hero/Hero.css.ts:31, replace '0 0 40px rgba(13, 15, 20, 0.4)' text shadow with equivalent using vars.color.sheetShadow or similar. Since the new palette's sheetShadow is lighter (0.18 alpha), assess if the shadow intensities need adjustment to maintain visual hierarchy on parchment background.

### 8.3. Replace surface rgba in Nav.css.ts scrolled state

**Status:** pending  
**Dependencies:** 8.1  

Update Nav.css.ts navScrolled background to use vars.color.surface with appropriate alpha

**Details:**

In components/nav/Nav.css.ts:20, replace 'rgba(21, 24, 32, 0.95)' with vars.color.surface token. The new surface color is #F3ECD8 (parchment), so construct the rgba using the RGB values (243,236,216,0.95) or define a new token if needed. Ensure backdrop-filter blur (line 21) complements the new translucent parchment nav background.

### 8.4. Replace all rgba literals in ExhibitionPanel.css.ts

**Status:** pending  
**Dependencies:** 8.1  

Update shadow and glass overlay rgba values in ExhibitionPanel to use vars.color tokens

**Details:**

In components/gallery/ExhibitionPanel.css.ts, replace: line 17 '0 8px 24px rgba(13, 15, 20, 0.6)' → use vars.color.sheetShadow with adjusted alpha, line 20 '0 12px 32px rgba(13, 15, 20, 0.8)' → stronger sheetShadow variant, line 34 'rgba(13, 15, 20, 0.15)' → glass background using vars.color.bg or sheetShadow, line 35 '1px solid rgba(184, 212, 232, 0.08)' → vars.color.accent with low alpha, line 40 'rgba(13, 15, 20, 0.06)' → hover glass background, line 41 'rgba(184, 212, 232, 0.14)' → hover border color using vars.color.accent. Since new palette is warm parchment-based, these overlays need to shift from cold blue-black to warm brown-based shadows.

### 8.5. Update DefaultPreview.tsx fallback color and run full validation

**Status:** pending  
**Dependencies:** 8.2, 8.3, 8.4  

Replace DefaultPreview.tsx surface fallback with literal '#F3ECD8' and run comprehensive test suite and visual verification

**Details:**

In components/projects/previews/DefaultPreview.tsx:19, replace 'heroColour ?? "#151820"' with 'heroColour ?? "#F3ECD8"' (use literal because canvas cannot read CSS vars). Add a comment: '// Fallback to vars.color.surface (#F3ECD8) — canvas cannot read CSS custom properties'. Also update lines 29, 51 where colour is used for fillStyle, and line 54 where colour + '30' creates the dot overlay (ensure hex concatenation works with new 6-char hex). Run `pnpm test` (expect all pass), `pnpm build` (expect success), then `pnpm dev` for full-site visual pass: verify / (home), /projects (index), and at least one /projects/[slug] detail page show no leftover dark-navy patches, all text legible on parchment, status badges (verdigris/ochre) readable, no visual regressions. Grep for old literals again to confirm only documented exceptions remain.
