# Task ID: 5

**Title:** TornSheet Clip Component with Foxing Overlay

**Status:** pending

**Dependencies:** 2, 4

**Priority:** medium

**Description:** Create TornSheet.tsx wrapper that clips children to torn-edge path via SVG clipPath, renders paper-lip shadow and foxing overlay

**Details:**

Create `components/paper/TornSheet.tsx` (client component). Props: `{ seed: string; className?: string; children: React.ReactNode }`. Use `useId()` to generate a unique clipPath ID, sanitize it for SVG. Use `useMemo` to call `tornEdgePath({ width: 1, height: 1, seed: hashSeed(seed) })` and `foxingSpots({ width: 1, height: 1, seed: hashSeed(seed) + 1 })` (offset the seed slightly so foxing differs from the edge). Return a div with `style={{ clipPath: url(#clipId) }}` containing: (1) an inline <svg aria-hidden> with <defs><clipPath id={clipId} clipPathUnits="objectBoundingBox"><path d={tornPath} /></clipPath></defs>; (2) a positioned "paper lip" inset shadow (via a pseudo-element or a layered div with a radial gradient along the clip edge, styled to suggest depth, using vars.color.sheetShadow or a similar token); (3) the foxing overlay: absolutely positioned radial-gradient circles at the foxing coordinates with low opacity (~0.04-0.06), tinted with vars.color.inkFaint or a similar aged-parchment tone; (4) the children. Create `components/paper/TornSheet.css.ts` with vanilla-extract styles for root (relative, 100% width/height), defs (absolute, 0 size), lip shadow layer, and foxing layer. Create `tests/components/paper/TornSheet.test.tsx` with RTL tests verifying: children render, clipPath exists with objectBoundingBox units, style.clipPath references the ID, same seed produces same path, foxing spots render as expected. Run `pnpm test tests/components/paper/TornSheet.test.tsx` to verify PASS.

**Test Strategy:**

RTL tests: children appear in document, clipPath element exists with correct units, clipped element references clipPath ID, deterministic path per seed, foxing spots rendered. Visual check in Storybook or via the specimen page (Task 7): torn edges visible, subtle paper-lip shadow suggests depth, faint age spots visible on close inspection.

## Subtasks

### 5.1. Create TornSheet component structure and clipPath logic

**Status:** pending  
**Dependencies:** None  

Create the core TornSheet.tsx client component with useId for unique clipPath IDs and useMemo for deterministic path generation

**Details:**

Create `components/paper/TornSheet.tsx` as a client component with 'use client' directive. Define props interface `{ seed: string; className?: string; children: React.ReactNode }`. Use React.useId() to generate a unique clipPath ID and sanitize it by removing colons (replace ':' with '_') to ensure SVG compatibility. Use useMemo to call `tornEdgePath({ width: 1, height: 1, seed: hashSeed(seed) })` and `foxingSpots({ width: 1, height: 1, seed: hashSeed(seed) + 1 })`, importing these functions from `./tornEdge`. The component returns a div with inline style `{{ clipPath: 'url(#' + sanitizedId + ')' }}` and will contain the children plus SVG defs (to be added in next subtask).

### 5.2. Add inline SVG clipPath definition to TornSheet

**Status:** pending  
**Dependencies:** 5.1  

Implement the inline SVG with clipPath definition using objectBoundingBox units for the torn-edge clipping

**Details:**

Within the TornSheet component's returned div, add an inline `<svg>` element with `aria-hidden="true"` and `style={{ position: 'absolute', width: 0, height: 0 }}`. Inside the SVG, add `<defs><clipPath id={sanitizedId} clipPathUnits="objectBoundingBox"><path d={tornPath} /></clipPath></defs>`. The clipPathUnits="objectBoundingBox" ensures the path (normalized to 0-1 range) scales with the container. The tornPath comes from the useMemo hook defined in subtask 1.

### 5.3. Create vanilla-extract styles for TornSheet layers

**Status:** pending  
**Dependencies:** 5.1  

Create TornSheet.css.ts with vanilla-extract styles for root container, paper-lip shadow layer, and foxing overlay layer

**Details:**

Create `components/paper/TornSheet.css.ts`. Import `style` from '@vanilla-extract/css' and `vars` from '@/styles/tokens.css'. Define `export const root = style({ position: 'relative', width: '100%', height: '100%' })` for the main container. Define `export const svgDefs = style({ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' })` for the hidden SVG. Define `export const paperLip = style({ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 12px 2px rgba(56, 44, 25, 0.18)' })` to create the subtle depth shadow along clipped edges using the sheetShadow color from the paper-world palette (will reference vars.color.sheetShadow once tokens are updated). Define `export const foxingLayer = style({ position: 'absolute', inset: 0, pointerEvents: 'none' })` for the container that will hold foxing spot divs.

### 5.4. Implement foxing spots overlay rendering

**Status:** pending  
**Dependencies:** 5.2, 5.3  

Add foxing spots as absolutely positioned radial-gradient elements within the TornSheet component

**Details:**

In TornSheet.tsx, after the inline SVG and before the children, add a div with className={styles.foxingLayer}. Inside this div, map over the foxingSpots array (from useMemo) and render a div for each spot with key={i}, inline style setting position: 'absolute', left: `${spot.x * 100}%`, top: `${spot.y * 100}%`, width: `${spot.radius * 200}%` (diameter in percentage), height: `${spot.radius * 200}%`, transform: 'translate(-50%, -50%)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(156, 140, 107, 0.06) 0%, transparent 70%)', pointerEvents: 'none'. The color rgba(156,140,107,0.06) corresponds to inkFaint at ~6% opacity per the visual brief constraint for aged-parchment foxing. After the foxing layer, add the paper-lip shadow div with className={styles.paperLip}, then finally render {children}.

### 5.5. Write comprehensive Vitest tests for TornSheet component

**Status:** pending  
**Dependencies:** 5.4  

Create TornSheet.test.tsx with React Testing Library tests covering clipPath generation, determinism, and foxing rendering

**Details:**

Create `tests/components/paper/TornSheet.test.tsx`. Import describe, it, expect from 'vitest', render, screen from '@testing-library/react', and TornSheet from '@/components/paper/TornSheet'. Write test suite with: (1) 'renders children' - render TornSheet with test child text, verify screen.getByText finds it; (2) 'creates SVG clipPath with objectBoundingBox units' - render component, query for clipPath element, verify clipPathUnits="objectBoundingBox" and path d attribute is non-empty; (3) 'applies clipPath to container via inline style' - render, get container element, verify style.clipPath matches pattern 'url(#...)'; (4) 'same seed produces same torn path' - render two instances with same seed='test-seed', extract both clipPath path d values, expect them to be identical; (5) 'different seeds produce different paths' - render with seed='a' and seed='b', extract path d values, expect them to differ; (6) 'renders foxing spots' - render component, query container for child divs with radial-gradient background (use getAllByRole or container.querySelectorAll), verify at least one foxing spot exists. Run `pnpm test tests/components/paper/TornSheet.test.tsx` and verify all tests PASS.
