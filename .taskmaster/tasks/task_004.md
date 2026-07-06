# Task ID: 4

**Title:** Torn-Edge & Foxing Math Module

**Status:** pending

**Dependencies:** 2

**Priority:** medium

**Description:** Create pure tornEdge.ts with seeded PRNG, hash, torn-paper path, and foxing-spot functions; write unit tests

**Details:**

Create `components/paper/tornEdge.ts` (pure module, no React/DOM). Implement: (1) `mulberry32(seed: number): () => number` — deterministic PRNG using the mulberry32 algorithm, returns values in [0, 1); (2) `hashSeed(s: string): number` — FNV-1a hash converting a string (e.g. project slug) to an unsigned 32-bit integer seed; (3) `tornEdgePath(opts: {width, height, seed, roughness?, segments?}): string` — generates a closed SVG path (`M ... Z`) tracing the box perimeter with jittered points (roughness default 0.015, segments default 18). Points are clamped to [-roughness, size+roughness]. With width/height=1 the path is suitable for objectBoundingBox clipPath units. The path traces 4 edges (top L→R, right T→B, bottom R→L, left B→T), each with `segments` points, using the PRNG for perpendicular jitter. (4) `foxingSpots(opts: {width, height, seed, count?}): Array<{x, y, r, opacity}>` — uses the same PRNG to generate a deterministic scatter of faint radial age-spot coordinates and radii for "foxing" overlays (typically count 3-6, opacity ~0.03-0.08, r ~0.02-0.05 of the box). This function was explicitly listed as a free procedural asset in the design doc's appendix but missing from the original plan. Create `tests/components/paper/tornEdge.test.ts` with Vitest suites testing: mulberry32 determinism and [0,1) range, hashSeed determinism and uint32 output, tornEdgePath determinism, seed-variance, closed-path format, coordinate bounds, point count, and foxingSpots determinism/bounds. Run `pnpm test tests/components/paper/tornEdge.test.ts` to verify PASS.

**Test Strategy:**

Unit tests must pass: PRNG determinism, hash consistency, path format (starts M, ends Z), coordinates within roughness bounds, correct point count per edge, foxing spots within unit box. All math is pure and DOM-free.

## Subtasks

### 4.1. Create paper directory and mulberry32 PRNG function

**Status:** pending  
**Dependencies:** None  

Create the components/paper directory structure and implement the mulberry32 deterministic PRNG function that returns values in [0, 1)

**Details:**

Create `components/paper/tornEdge.ts` as a new TypeScript module. Implement the `mulberry32(seed: number): () => number` function using the mulberry32 algorithm. The function should take a 32-bit unsigned integer seed and return a closure that generates deterministic pseudo-random numbers in the range [0, 1) when called. This PRNG will be used by all other functions in the module to ensure deterministic, seed-based randomness for torn edges and foxing spots. The implementation should follow the standard mulberry32 algorithm with proper state management inside the closure.

### 4.2. Implement hashSeed FNV-1a hash function

**Status:** pending  
**Dependencies:** 4.1  

Add the hashSeed function that converts string slugs to unsigned 32-bit integer seeds using FNV-1a hashing algorithm

**Details:**

In `components/paper/tornEdge.ts`, implement `hashSeed(s: string): number` using the FNV-1a hash algorithm. The function should convert any string (e.g., a project slug like 'museum-of-little-things') into a deterministic unsigned 32-bit integer seed suitable for passing to mulberry32. Use FNV-1a constants: offset basis 2166136261, prime 16777619. Process each character code, applying XOR and multiplication, then convert the final result to unsigned 32-bit integer using `>>> 0`. This allows the same string to always produce the same seed, ensuring visual consistency across renders.

### 4.3. Implement tornEdgePath SVG path generator

**Status:** pending  
**Dependencies:** 4.1, 4.2  

Create the tornEdgePath function that generates a closed SVG path with jittered perimeter points for torn-paper effect

**Details:**

In `components/paper/tornEdge.ts`, implement `tornEdgePath(opts: {width: number, height: number, seed: number, roughness?: number, segments?: number}): string`. Default roughness to 0.015, segments to 18. Use mulberry32(seed) to create a PRNG. Generate a closed SVG path string starting with 'M' and ending with 'Z' that traces the box perimeter (top L→R, right T→B, bottom R→L, left B→T). For each of the 4 edges, create `segments` points with perpendicular jitter controlled by roughness. Clamp all points to [-roughness, size+roughness] range. When width/height = 1, the path works in objectBoundingBox units for SVG clipPath. Return the complete path string suitable for use in SVG path d attribute.

### 4.4. Implement foxingSpots scatter generator

**Status:** pending  
**Dependencies:** 4.1, 4.2  

Add the foxingSpots function to generate deterministic age-spot coordinates for paper texture overlays

**Details:**

In `components/paper/tornEdge.ts`, implement `foxingSpots(opts: {width: number, height: number, seed: number, count?: number}): Array<{x: number, y: number, r: number, opacity: number}>`. Default count to a random value between 3-6 (seeded). Use mulberry32(seed) to create a PRNG. Generate `count` spots with: x and y positions within [0, width] and [0, height]; radius r between ~0.02-0.05 of the box dimensions; opacity between ~0.03-0.08 for subtle foxing effect. All values must be deterministic based on seed. These spots will be rendered as radial gradients to create aged-paper texture overlays. The function provides procedural asset generation as specified in the design doc appendix.

### 4.5. Write comprehensive unit tests for tornEdge module

**Status:** pending  
**Dependencies:** 4.1, 4.2, 4.3, 4.4  

Create Vitest test suite covering all tornEdge functions with determinism, bounds, format, and output validation tests

**Details:**

Create `tests/components/paper/tornEdge.test.ts` following the existing test pattern from `tests/components/projects/previews/boidsMath.test.ts`. Import functions from '@/components/paper/tornEdge'. Write test suites for: (1) mulberry32 - test that same seed produces same sequence, output is always in [0, 1), different seeds produce different sequences; (2) hashSeed - test determinism (same string → same number), output is uint32 (0 to 2^32-1), different strings produce different hashes; (3) tornEdgePath - test determinism per seed, seed variance, path format (starts with M, ends with Z, is a closed path), coordinate bounds respect roughness parameter, point count = 4*segments; (4) foxingSpots - test determinism per seed, spot count in expected range, x/y within width/height, r and opacity in expected ranges. Run `pnpm test tests/components/paper/tornEdge.test.ts` to verify all tests PASS.
