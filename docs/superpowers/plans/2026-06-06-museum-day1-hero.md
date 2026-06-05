# Museum of Little Things — Day 1: Foundation + Hero

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap the Next.js 14 project with the full tech stack, implement the design system, and build the hero experience (boids canvas, title, vignette, nav) to a working, visually correct state in the browser.

**Architecture:** Next.js 14 App Router with Vanilla Extract (zero-runtime CSS-in-TS), Velite (MDX content at build time), Framer Motion (animations), Zustand (cursor state). Boids physics runs in a pure `useBoids` hook; a `<canvas>` overlay renders them. Hero uses Framer Motion `useMotionValue` + `useTransform` to combine load-in animations with scroll-linked fade effects.

**Tech Stack:** Next.js 14, pnpm, TypeScript, Vanilla Extract, Velite, Framer Motion, Zustand, Vitest, React Testing Library, jsdom

---

## File Map

| File | Responsibility |
|---|---|
| `next.config.ts` | Vanilla Extract plugin (outermost) + Velite webpack plugin |
| `velite.config.ts` | Velite collection schema, MDX compilation config |
| `vitest.config.ts` | Vitest setup with jsdom + React |
| `tests/setup.ts` | `@testing-library/jest-dom` matchers |
| `styles/tokens.css.ts` | All CSS custom properties via `createGlobalTheme` |
| `styles/global.css.ts` | Reset, body, scrollbar |
| `styles/typography.css.ts` | Heading/paragraph base styles |
| `lib/motion.ts` | Motion token constants |
| `lib/content/types.ts` | Project discriminated union |
| `lib/content/index.ts` | Re-exports Velite generated output |
| `lib/content/queries.ts` | `getAllProjects`, `getFeaturedProjects`, `getProjectBySlug`, `getAllTags` |
| `hooks/useBoids.ts` | Boids physics — pure logic, no rendering |
| `hooks/useCursor.ts` | Zustand store for cursor position |
| `components/cursor/BoidsCanvas.tsx` | Canvas renderer consuming `useBoids` |
| `components/cursor/BoidsCanvas.css.ts` | Fixed full-viewport canvas styles |
| `components/nav/Nav.tsx` | Desktop nav, scroll background, link hover |
| `components/nav/Nav.css.ts` | Nav layout and transition styles |
| `components/nav/MobileOverlay.tsx` | Full-screen mobile menu |
| `components/nav/MobileOverlay.css.ts` | Mobile overlay styles |
| `components/hero/Hero.tsx` | Hero section with boids, title, vignette, scroll indicator |
| `components/hero/Hero.css.ts` | Hero layout styles |
| `app/layout.tsx` | Root layout: fonts, Nav, BoidsCanvas, body class |
| `app/page.tsx` | Home page: Hero section only (gallery deferred to Day 2) |
| `app/about/page.tsx` | Placeholder page |
| `app/thoughts/page.tsx` | Placeholder page |
| `app/projects/page.tsx` | Stub (full implementation Day 2) |
| `content/projects/museum-of-little-things.mdx` | Seed project for dev testing |
| `public/projects/museum-of-little-things/hero.jpg` | Placeholder hero image |

---

## Task 1: Scaffold Next.js Project

**Files:**
- Create: entire project via `create-next-app`

- [ ] **Step 1: Run create-next-app in the museum directory**

```bash
pnpm create next-app@latest . --typescript --no-tailwind --eslint --app --no-src-dir --import-alias="@/*" --use-pnpm
```

When prompted interactively, accept defaults. The `.` means scaffold into the current directory. If it asks about the directory not being empty (docs/ exists), confirm yes.

- [ ] **Step 2: Verify the project compiles**

```bash
pnpm build
```

Expected: build succeeds with default Next.js content. Ignore any ESLint warnings.

- [ ] **Step 3: Commit the scaffold**

```bash
git add -A
git commit -m "feat: scaffold Next.js 14 App Router project"
```

---

## Task 2: Install Dependencies

**Files:**
- Modify: `package.json` (via pnpm add)

- [ ] **Step 1: Install runtime dependencies**

```bash
pnpm add framer-motion zustand @vanilla-extract/css @vanilla-extract/next-plugin velite
```

- [ ] **Step 2: Install dev dependencies**

```bash
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react
```

- [ ] **Step 3: Verify installs resolved cleanly**

```bash
pnpm list --depth=0
```

Expected: all packages listed, no peer dependency errors in the output (warnings are OK).

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat: install Vanilla Extract, Velite, Framer Motion, Zustand, Vitest"
```

---

## Task 3: Configure Build (next.config.ts, velite.config.ts, vitest.config.ts)

**Files:**
- Modify: `next.config.ts`
- Create: `velite.config.ts`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Modify: `tsconfig.json`

- [ ] **Step 1: Replace next.config.ts**

```ts
// next.config.ts
import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin'
import type { NextConfig } from 'next'
import type { Compiler } from 'webpack'

const withVanillaExtract = createVanillaExtractPlugin()

class VeliteWebpackPlugin {
  apply(compiler: Compiler) {
    let built = false
    compiler.hooks.beforeCompile.tapPromise('VeliteWebpackPlugin', async () => {
      if (built) return
      built = true
      const { build } = await import('velite')
      await build({ watch: compiler.options.mode === 'development' })
    })
  }
}

const nextConfig: NextConfig = {
  webpack(config) {
    config.plugins.push(new VeliteWebpackPlugin())
    return config
  },
}

export default withVanillaExtract(nextConfig)
```

- [ ] **Step 2: Create velite.config.ts (initial — full schema added in Task 6)**

```ts
// velite.config.ts
import { defineCollection, defineConfig, s } from 'velite'

const projects = defineCollection({
  name: 'Project',
  pattern: 'projects/**/*.mdx',
  schema: s.object({
    type: s.enum(['iframe']),
    title: s.string(),
    slug: s.string(),
    description: s.string(),
    heroImage: s.string(),
    heroColour: s.string().optional(),
    tags: s.array(s.string()),
    links: s
      .object({
        github: s.string().url().optional(),
        live: s.string().url().optional(),
        source: s.string().url().optional(),
      })
      .optional(),
    status: s.enum(['live', 'wip', 'archived']),
    featured: s.boolean().default(false),
    featuredOrder: s.number().optional(),
    publishedAt: s.isodate(),
    curatorNote: s.string().optional(),
    iframeUrl: s.string().url().optional(),
    iframeHeight: s.number().optional(),
    iframeMobileNote: s.string().optional(),
    body: s.mdx(),
  }),
})

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { projects },
})
```

- [ ] **Step 3: Create vitest.config.ts**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    exclude: ['**/node_modules/**', '**/.next/**', '**/.velite/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 4: Create tests/setup.ts**

```ts
// tests/setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add path aliases and .velite to tsconfig.json**

Open `tsconfig.json` and update the `paths` section inside `compilerOptions` to:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@content": ["./.velite"],
      "@content/*": ["./.velite/*"]
    }
  }
}
```

Also add `.velite` to the `exclude` array:
```json
{
  "exclude": ["node_modules", ".velite"]
}
```

- [ ] **Step 6: Add .velite to .gitignore**

Append to `.gitignore`:
```
# Velite generated output
.velite/
```

- [ ] **Step 7: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:ui": "vitest --ui"
```

- [ ] **Step 8: Commit**

```bash
git add next.config.ts velite.config.ts vitest.config.ts tests/setup.ts tsconfig.json .gitignore package.json
git commit -m "feat: configure Vanilla Extract, Velite, Vitest build pipeline"
```

---

## Task 4: Design Tokens

**Files:**
- Create: `styles/tokens.css.ts`
- Create: `styles/global.css.ts`
- Create: `styles/typography.css.ts`

Note: `next/font` injects CSS variables `--font-space-grotesk`, `--font-instrument-sans`, `--font-jetbrains-mono` at runtime via `app/layout.tsx` (Task 13). The font tokens here reference those variables.

- [ ] **Step 1: Create styles/tokens.css.ts**

```ts
// styles/tokens.css.ts
import { createGlobalTheme } from '@vanilla-extract/css'

export const vars = createGlobalTheme(':root', {
  color: {
    bg: '#0D0F14',
    surface: '#151820',
    border: '#1E2330',
    accent: '#B8D4E8',
    accentDim: '#6A9AB8',
    textPrimary: '#E8EDF2',
    textSecondary: '#6B7280',
    monoTag: '#3D5A73',
    statusLive: '#4ADE80',
    statusWip: '#F59E0B',
  },
  font: {
    display: 'var(--font-space-grotesk)',
    body: 'var(--font-instrument-sans)',
    mono: 'var(--font-jetbrains-mono)',
  },
  space: {
    px1: '4px',
    px2: '8px',
    px3: '12px',
    px4: '16px',
    px6: '24px',
    px8: '32px',
    px12: '48px',
    px16: '64px',
    px24: '96px',
    px32: '128px',
  },
})
```

- [ ] **Step 2: Create styles/global.css.ts**

```ts
// styles/global.css.ts
import { globalStyle } from '@vanilla-extract/css'
import { vars } from './tokens.css'

globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
})

globalStyle('html', {
  scrollBehavior: 'smooth',
})

globalStyle('body', {
  backgroundColor: vars.color.bg,
  color: vars.color.textPrimary,
  fontFamily: vars.font.body,
  lineHeight: '1.6',
  overflowX: 'hidden',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})

globalStyle('::-webkit-scrollbar', {
  width: '6px',
})

globalStyle('::-webkit-scrollbar-track', {
  background: vars.color.bg,
})

globalStyle('::-webkit-scrollbar-thumb', {
  background: vars.color.border,
  borderRadius: '3px',
})

globalStyle('a', {
  color: 'inherit',
  textDecoration: 'none',
})
```

- [ ] **Step 3: Create styles/typography.css.ts**

```ts
// styles/typography.css.ts
import { globalStyle } from '@vanilla-extract/css'
import { vars } from './tokens.css'

globalStyle('h1, h2, h3, h4, h5, h6', {
  fontFamily: vars.font.display,
  fontWeight: 300,
  lineHeight: 1.2,
  color: vars.color.textPrimary,
})

globalStyle('p', {
  fontFamily: vars.font.body,
  lineHeight: 1.75,
  color: vars.color.textSecondary,
})

globalStyle('code, pre, kbd, samp', {
  fontFamily: vars.font.mono,
})
```

- [ ] **Step 4: Commit**

```bash
git add styles/
git commit -m "feat: add design tokens, global reset, typography base styles"
```

---

## Task 5: Motion Tokens + Content Types

These two files have no dependencies on each other and can be written together.

**Files:**
- Create: `lib/motion.ts`
- Create: `lib/content/types.ts`

- [ ] **Step 1: Create lib/motion.ts**

```ts
// lib/motion.ts
export const tokens = {
  snappy:    { duration: 0.15, ease: [0.16, 1, 0.3, 1] as const },
  standard:  { duration: 0.5,  ease: [0.16, 1, 0.3, 1] as const },
  cinematic: { duration: 0.9,  ease: [0.16, 1, 0.3, 1] as const },
  drift:     { duration: 2.0,  ease: [0.16, 1, 0.3, 1] as const },
} as const

export type MotionToken = keyof typeof tokens
```

- [ ] **Step 2: Create lib/content/types.ts**

```ts
// lib/content/types.ts
import type React from 'react'

type BaseProject = {
  title: string
  slug: string
  description: string
  heroImage: string
  heroColour?: string
  tags: string[]
  links?: {
    github?: string
    live?: string
    source?: string
  }
  status: 'live' | 'wip' | 'archived'
  featured: boolean
  featuredOrder?: number
  publishedAt: string
  curatorNote?: string
  body: React.ComponentType
}

type IframeProject = BaseProject & {
  type: 'iframe'
  iframeUrl: string
  iframeHeight?: number
  iframeMobileNote?: string
}

export type Project = IframeProject
```

- [ ] **Step 3: Commit**

```bash
git add lib/
git commit -m "feat: add motion tokens and content type definitions"
```

---

## Task 6: Seed Content + Content Layer

**Files:**
- Create: `content/projects/museum-of-little-things.mdx`
- Create: `lib/content/index.ts`
- Create: `lib/content/queries.ts`

Note: A real placeholder hero image is needed. Copy any JPEG into `public/projects/museum-of-little-things/hero.jpg`. A solid-colour 1200×800 PNG works fine for dev purposes.

- [ ] **Step 1: Create placeholder hero image directory and copy in an image**

```bash
mkdir -p public/projects/museum-of-little-things
```

Copy any image (screenshot, placeholder) to `public/projects/museum-of-little-things/hero.jpg`. For dev, a 1×1 pixel JPEG is sufficient — Next.js Image handles missing images gracefully in dev.

- [ ] **Step 2: Create the seed MDX file**

```mdx
---
type: iframe
title: Museum of Little Things
slug: museum-of-little-things
description: A personal portfolio built as a spatial gallery of work.
heroImage: /projects/museum-of-little-things/hero.jpg
heroColour: "#0D0F14"
tags:
  - Next.js
  - TypeScript
  - Vanilla Extract
links:
  github: https://github.com/benteoh/museum
status: live
featured: true
featuredOrder: 1
publishedAt: "2024-01-01"
curatorNote: A collection of things built with care.
iframeUrl: https://example.com
iframeHeight: 800
---

This site is itself the exhibit. Built to showcase the craft of building things well.

## The Idea

A portfolio that is a proof of taste, not just a list of projects.
```

Save to `content/projects/museum-of-little-things.mdx`.

- [ ] **Step 3: Create lib/content/index.ts**

```ts
// lib/content/index.ts
// Re-exports Velite's generated output. .velite/ is generated at build time.
// Run `pnpm build` or `pnpm dev` to generate before importing in tests.
export { projects } from '../.velite'
```

- [ ] **Step 4: Create lib/content/queries.ts**

```ts
// lib/content/queries.ts
import type { Project } from './types'

// In Server Components, import projects directly from the generated output.
// These functions accept the projects array as an argument so they can be
// tested without the Velite build running.

export function getAllProjects(projects: Project[]): Project[] {
  return [...projects].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export function getFeaturedProjects(projects: Project[]): Project[] {
  return projects
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99))
}

export function getProjectBySlug(projects: Project[], slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

export function getAllTags(projects: Project[]): string[] {
  const tags = new Set(projects.flatMap((p) => p.tags))
  return [...tags].sort()
}

export function getCuratorNote(projects: Project[]): string {
  const featured = getFeaturedProjects(projects)
  return featured[0]?.curatorNote ?? 'A collection of things built with care.'
}
```

- [ ] **Step 5: Write failing tests**

Create `tests/lib/content/queries.test.ts`:

```ts
// tests/lib/content/queries.test.ts
import { describe, it, expect } from 'vitest'
import type { Project } from '@/lib/content/types'
import {
  getAllProjects,
  getFeaturedProjects,
  getProjectBySlug,
  getAllTags,
  getCuratorNote,
} from '@/lib/content/queries'

const mockProjects: Project[] = [
  {
    type: 'iframe',
    title: 'Alpha',
    slug: 'alpha',
    description: 'First project',
    heroImage: '/alpha/hero.jpg',
    tags: ['TypeScript', 'React'],
    status: 'live',
    featured: true,
    featuredOrder: 2,
    publishedAt: '2024-01-01',
    curatorNote: 'Alpha note',
    iframeUrl: 'https://alpha.com',
    body: () => null,
  } as unknown as Project,
  {
    type: 'iframe',
    title: 'Beta',
    slug: 'beta',
    description: 'Second project',
    heroImage: '/beta/hero.jpg',
    tags: ['Next.js', 'TypeScript'],
    status: 'wip',
    featured: true,
    featuredOrder: 1,
    publishedAt: '2024-06-01',
    curatorNote: 'Beta note',
    iframeUrl: 'https://beta.com',
    body: () => null,
  } as unknown as Project,
  {
    type: 'iframe',
    title: 'Gamma',
    slug: 'gamma',
    description: 'Third project',
    heroImage: '/gamma/hero.jpg',
    tags: ['Rust'],
    status: 'live',
    featured: false,
    publishedAt: '2023-06-01',
    iframeUrl: 'https://gamma.com',
    body: () => null,
  } as unknown as Project,
]

describe('getAllProjects', () => {
  it('returns projects sorted by publishedAt descending', () => {
    const result = getAllProjects(mockProjects)
    expect(result[0].slug).toBe('beta')
    expect(result[1].slug).toBe('alpha')
    expect(result[2].slug).toBe('gamma')
  })
})

describe('getFeaturedProjects', () => {
  it('returns only featured projects sorted by featuredOrder ascending', () => {
    const result = getFeaturedProjects(mockProjects)
    expect(result).toHaveLength(2)
    expect(result[0].slug).toBe('beta')  // featuredOrder: 1
    expect(result[1].slug).toBe('alpha') // featuredOrder: 2
  })

  it('excludes non-featured projects', () => {
    const result = getFeaturedProjects(mockProjects)
    expect(result.find(p => p.slug === 'gamma')).toBeUndefined()
  })
})

describe('getProjectBySlug', () => {
  it('returns the correct project', () => {
    const result = getProjectBySlug(mockProjects, 'alpha')
    expect(result?.title).toBe('Alpha')
  })

  it('returns undefined for unknown slug', () => {
    const result = getProjectBySlug(mockProjects, 'does-not-exist')
    expect(result).toBeUndefined()
  })
})

describe('getAllTags', () => {
  it('returns unique tags sorted alphabetically', () => {
    const result = getAllTags(mockProjects)
    expect(result).toEqual(['Next.js', 'React', 'Rust', 'TypeScript'])
  })
})

describe('getCuratorNote', () => {
  it('returns the curatorNote from the first featured project', () => {
    const result = getCuratorNote(mockProjects)
    expect(result).toBe('Beta note')
  })

  it('falls back to default when no curatorNote on featured project', () => {
    const projectsWithoutNote = mockProjects.map(p => ({ ...p, curatorNote: undefined }))
    const result = getCuratorNote(projectsWithoutNote)
    expect(result).toBe('A collection of things built with care.')
  })
})
```

- [ ] **Step 6: Run tests to verify they fail**

```bash
pnpm test tests/lib/content/queries.test.ts
```

Expected: FAIL — `@/lib/content/queries` not found (file doesn't exist yet if running out of order) OR all tests pass since we wrote tests and implementation in the same step. If tests pass, that's fine — proceed.

- [ ] **Step 7: Run all tests**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
git add content/ public/projects/ lib/content/ tests/lib/
git commit -m "feat: add content layer, Velite schema, seed project, query functions"
```

---

## Task 7: useBoids Physics Hook

**Files:**
- Create: `hooks/useBoids.ts`
- Create: `tests/hooks/useBoids.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/hooks/useBoids.test.ts`:

```ts
// tests/hooks/useBoids.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createBoid, applyBoidRules, updateBoids } from '@/hooks/useBoids'

describe('createBoid', () => {
  it('creates a boid within given bounds', () => {
    const boid = createBoid(800, 600)
    expect(boid.x).toBeGreaterThanOrEqual(0)
    expect(boid.x).toBeLessThanOrEqual(800)
    expect(boid.y).toBeGreaterThanOrEqual(0)
    expect(boid.y).toBeLessThanOrEqual(600)
  })

  it('creates a boid with speed within bounds', () => {
    const boid = createBoid(800, 600)
    const speed = Math.sqrt(boid.vx ** 2 + boid.vy ** 2)
    expect(speed).toBeGreaterThan(0)
    expect(speed).toBeLessThanOrEqual(2)
  })
})

describe('applyBoidRules', () => {
  it('returns a velocity delta object', () => {
    const boids = Array.from({ length: 5 }, () => createBoid(800, 600))
    const result = applyBoidRules(boids[0], boids, { x: -1, y: -1 })
    expect(result).toHaveProperty('dx')
    expect(result).toHaveProperty('dy')
  })

  it('applies separation when cursor is within disruption radius', () => {
    const boid = { x: 100, y: 100, vx: 0, vy: 0, opacity: 0.2 }
    const others = [{ ...boid }]
    const cursor = { x: 110, y: 110 } // within 80px radius
    const result = applyBoidRules(boid, others, cursor)
    // Separation force should push away from cursor
    expect(typeof result.dx).toBe('number')
    expect(typeof result.dy).toBe('number')
  })
})

describe('updateBoids', () => {
  it('returns same number of boids', () => {
    const boids = Array.from({ length: 10 }, () => createBoid(800, 600))
    const updated = updateBoids(boids, { x: -1, y: -1 }, 800, 600)
    expect(updated).toHaveLength(10)
  })

  it('wraps boids that go off-screen', () => {
    const boid = { x: 850, y: 300, vx: 2, vy: 0, opacity: 0.2 }
    const updated = updateBoids([boid], { x: -1, y: -1 }, 800, 600)
    expect(updated[0].x).toBeLessThan(800)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test tests/hooks/useBoids.test.ts
```

Expected: FAIL — `@/hooks/useBoids` not found.

- [ ] **Step 3: Implement hooks/useBoids.ts**

```ts
// hooks/useBoids.ts
'use client'

import { useRef, useCallback } from 'react'

const PERCEPTION_RADIUS = 80
const SEPARATION_RADIUS = 30
const DISRUPTION_RADIUS = 80
const MAX_SPEED = 2
const MAX_FORCE = 0.05

export type Boid = {
  x: number
  y: number
  vx: number
  vy: number
  opacity: number
}

export type CursorPos = { x: number; y: number }

export function createBoid(width: number, height: number): Boid {
  const angle = Math.random() * Math.PI * 2
  const speed = 0.5 + Math.random() * 1.5
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    opacity: 0.2,
  }
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2)
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

export function applyBoidRules(
  boid: Boid,
  all: Boid[],
  cursor: CursorPos
): { dx: number; dy: number; opacity: number } {
  let cohX = 0, cohY = 0, cohCount = 0
  let sepX = 0, sepY = 0
  let aliVx = 0, aliVy = 0, aliCount = 0
  let cursorFx = 0, cursorFy = 0

  for (const other of all) {
    if (other === boid) continue
    const d = dist(boid.x, boid.y, other.x, other.y)

    if (d < PERCEPTION_RADIUS) {
      cohX += other.x
      cohY += other.y
      cohCount++

      aliVx += other.vx
      aliVy += other.vy
      aliCount++
    }

    if (d < SEPARATION_RADIUS && d > 0) {
      sepX += (boid.x - other.x) / d
      sepY += (boid.y - other.y) / d
    }
  }

  let dx = 0
  let dy = 0

  // Cohesion
  if (cohCount > 0) {
    const targetX = cohX / cohCount - boid.x
    const targetY = cohY / cohCount - boid.y
    dx += targetX * 0.0005
    dy += targetY * 0.0005
  }

  // Separation
  dx += sepX * 0.05
  dy += sepY * 0.05

  // Alignment
  if (aliCount > 0) {
    dx += (aliVx / aliCount - boid.vx) * 0.05
    dy += (aliVy / aliCount - boid.vy) * 0.05
  }

  // Cursor disruption
  const cursorDist = dist(boid.x, boid.y, cursor.x, cursor.y)
  let targetOpacity = 0.2

  if (cursor.x >= 0 && cursor.y >= 0 && cursorDist < DISRUPTION_RADIUS) {
    const force = (1 - cursorDist / DISRUPTION_RADIUS) * 0.3
    if (cursorDist > 0) {
      cursorFx = ((boid.x - cursor.x) / cursorDist) * force
      cursorFy = ((boid.y - cursor.y) / cursorDist) * force
    }
    dx += cursorFx
    dy += cursorFy
    targetOpacity = 0.6
  }

  // Clamp forces
  dx = clamp(dx, -MAX_FORCE, MAX_FORCE)
  dy = clamp(dy, -MAX_FORCE, MAX_FORCE)

  return { dx, dy, opacity: targetOpacity }
}

export function updateBoids(
  boids: Boid[],
  cursor: CursorPos,
  width: number,
  height: number
): Boid[] {
  return boids.map((boid) => {
    const { dx, dy, opacity } = applyBoidRules(boid, boids, cursor)

    let vx = boid.vx + dx
    let vy = boid.vy + dy

    // Clamp to max speed
    const speed = Math.sqrt(vx ** 2 + vy ** 2)
    if (speed > MAX_SPEED) {
      vx = (vx / speed) * MAX_SPEED
      vy = (vy / speed) * MAX_SPEED
    }

    let x = boid.x + vx
    let y = boid.y + vy

    // Wrap around edges
    if (x < 0) x += width
    if (x > width) x -= width
    if (y < 0) y += height
    if (y > height) y -= height

    // Lerp opacity toward target
    const newOpacity = boid.opacity + (opacity - boid.opacity) * 0.05

    return { x, y, vx, vy, opacity: newOpacity }
  })
}

export function useBoids(count: number) {
  const boidsRef = useRef<Boid[]>([])

  const init = useCallback((width: number, height: number) => {
    boidsRef.current = Array.from({ length: count }, () => createBoid(width, height))
  }, [count])

  const tick = useCallback((cursor: CursorPos, width: number, height: number) => {
    boidsRef.current = updateBoids(boidsRef.current, cursor, width, height)
    return boidsRef.current
  }, [])

  return { init, tick, boids: boidsRef }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test tests/hooks/useBoids.test.ts
```

Expected: all 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add hooks/useBoids.ts tests/hooks/useBoids.test.ts
git commit -m "feat: implement useBoids physics hook with tests"
```

---

## Task 8: useCursor Zustand Store

**Files:**
- Create: `hooks/useCursor.ts`

No tests needed — this is a thin Zustand wrapper with no logic to unit-test.

- [ ] **Step 1: Create hooks/useCursor.ts**

```ts
// hooks/useCursor.ts
'use client'

import { create } from 'zustand'

type CursorStore = {
  x: number
  y: number
  setPosition: (x: number, y: number) => void
}

export const useCursorStore = create<CursorStore>((set) => ({
  x: -1,
  y: -1,
  setPosition: (x, y) => set({ x, y }),
}))

export function useCursor() {
  return useCursorStore((state) => ({ x: state.x, y: state.y }))
}

export function useCursorUpdater() {
  return useCursorStore((state) => state.setPosition)
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/useCursor.ts
git commit -m "feat: add useCursor Zustand store for global cursor position"
```

---

## Task 9: BoidsCanvas + BoidsCanvasWrapper Components

**Files:**
- Create: `components/cursor/BoidsCanvas.tsx`
- Create: `components/cursor/BoidsCanvas.css.ts`
- Create: `components/cursor/BoidsCanvasWrapper.tsx`

- [ ] **Step 1: Create components/cursor/BoidsCanvas.css.ts**

```ts
// components/cursor/BoidsCanvas.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const canvas = style({
  position: 'fixed',
  inset: 0,
  width: '100vw',
  height: '100vh',
  zIndex: 9999,
  pointerEvents: 'none',
})
```

- [ ] **Step 2: Create components/cursor/BoidsCanvas.tsx**

```tsx
// components/cursor/BoidsCanvas.tsx
'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useBoids } from '@/hooks/useBoids'
import { useCursorStore, useCursorUpdater } from '@/hooks/useCursor'
import * as styles from './BoidsCanvas.css'

const BOID_COUNT = 40
const BOID_RADIUS = 3
const BOID_COLOUR = '#B8D4E8'

export function BoidsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const lastFrameRef = useRef<number>(0)
  const { init, tick } = useBoids(BOID_COUNT)
  const setPosition = useCursorUpdater()
  const cursorRef = useRef({ x: -1, y: -1 })

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY }
      setPosition(e.clientX, e.clientY)
    },
    [setPosition]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    init(canvas.width, canvas.height)
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)

    const loop = (timestamp: number) => {
      if (document.hidden) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      // Cap at 60fps
      if (timestamp - lastFrameRef.current < 16.67) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }
      lastFrameRef.current = timestamp

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const boids = tick(cursorRef.current, canvas.width, canvas.height)

      for (const boid of boids) {
        ctx.beginPath()
        ctx.arc(boid.x, boid.y, BOID_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(184, 212, 232, ${boid.opacity})`
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [init, tick, handleMouseMove])

  return <canvas ref={canvasRef} className={styles.canvas} />
}
```

- [ ] **Step 3: Create components/cursor/BoidsCanvasWrapper.tsx**

This wrapper handles two things: the load-in fade (opacity 0→1 over 2s) and the scroll-linked fade (opacity 1→0 over the first 40% of scroll). Both are multiplied together as a single final opacity so they compose correctly.

```tsx
// components/cursor/BoidsCanvasWrapper.tsx
'use client'

import { useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionValue, animate } from 'framer-motion'
import { BoidsCanvas } from './BoidsCanvas'
import { tokens } from '@/lib/motion'

export function BoidsCanvasWrapper() {
  const { scrollY } = useScroll()
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800

  // Load progress: animates 0→1 on mount over 2s (drift token)
  const loadProgress = useMotionValue(0)

  // Scroll-linked opacity: 1 at top, 0 at 40% scroll
  const scrollOpacity = useTransform(scrollY, [0, vh * 0.4], [1, 0])

  // Final opacity = loadProgress × scrollOpacity
  // — invisible until loaded, then fades with scroll
  const finalOpacity = useTransform(
    [loadProgress, scrollOpacity],
    ([l, s]) => (l as number) * (s as number)
  )

  useEffect(() => {
    animate(loadProgress, 1, {
      duration: tokens.drift.duration,
      ease: [...tokens.drift.ease],
    })
  }, [loadProgress])

  return (
    <motion.div style={{ opacity: finalOpacity }}>
      <BoidsCanvas />
    </motion.div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/cursor/
git commit -m "feat: implement BoidsCanvas and BoidsCanvasWrapper with load+scroll fade"
```

---

## Task 10: Navigation Component

**Files:**
- Create: `components/nav/Nav.tsx`
- Create: `components/nav/Nav.css.ts`
- Create: `components/nav/MobileOverlay.tsx`
- Create: `components/nav/MobileOverlay.css.ts`

- [ ] **Step 1: Create components/nav/Nav.css.ts**

```ts
// components/nav/Nav.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const nav = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.space.px4} ${vars.space.px6}`,
  transition: `background-color 500ms cubic-bezier(0.16, 1, 0.3, 1),
               backdrop-filter 500ms cubic-bezier(0.16, 1, 0.3, 1)`,
})

export const navScrolled = style({
  backgroundColor: `rgba(21, 24, 32, 0.95)`,
  backdropFilter: 'blur(12px)',
})

export const brand = style({
  fontFamily: vars.font.display,
  fontSize: '0.875rem',
  fontWeight: 500,
  color: vars.color.textPrimary,
  letterSpacing: '0.01em',
})

export const links = style({
  display: 'flex',
  gap: vars.space.px6,
  '@media': {
    '(max-width: 640px)': {
      display: 'none',
    },
  },
})

export const link = style({
  position: 'relative',
  fontFamily: vars.font.body,
  fontSize: '0.875rem',
  color: vars.color.textSecondary,
  transition: `color 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  ':hover': {
    color: vars.color.textPrimary,
  },
  '::after': {
    content: '""',
    position: 'absolute',
    bottom: '-2px',
    left: 0,
    right: 0,
    height: '1px',
    backgroundColor: vars.color.accent,
    transformOrigin: 'left',
    transform: 'scaleX(0)',
    transition: `transform 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  },
  ':hover::after': {
    transform: 'scaleX(1)',
  },
})

export const hamburger = style({
  display: 'none',
  flexDirection: 'column',
  gap: '5px',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  padding: vars.space.px2,
  '@media': {
    '(max-width: 640px)': {
      display: 'flex',
    },
  },
})

export const hamburgerLine = style({
  width: '20px',
  height: '1px',
  backgroundColor: vars.color.textPrimary,
  transition: `background-color 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
})
```

- [ ] **Step 2: Create components/nav/MobileOverlay.css.ts**

```ts
// components/nav/MobileOverlay.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const overlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: 200,
  backgroundColor: vars.color.bg,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
})

export const closeButton = style({
  position: 'absolute',
  top: vars.space.px4,
  right: vars.space.px6,
  background: 'none',
  border: 'none',
  color: vars.color.textSecondary,
  fontSize: '1.5rem',
  cursor: 'pointer',
  padding: vars.space.px2,
})

export const linkList = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.space.px8,
})

export const mobileLink = style({
  fontFamily: vars.font.display,
  fontSize: '2.5rem',
  fontWeight: 300,
  color: vars.color.textPrimary,
  transition: `color 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
  ':hover': {
    color: vars.color.accent,
  },
})
```

- [ ] **Step 3: Create components/nav/MobileOverlay.tsx**

```tsx
// components/nav/MobileOverlay.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import * as styles from './MobileOverlay.css'
import { tokens } from '@/lib/motion'

const navLinks = [
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
  { href: '/thoughts', label: 'Thoughts' },
]

type Props = {
  isOpen: boolean
  onClose: () => void
}

export function MobileOverlay({ isOpen, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={tokens.cinematic}
          onClick={onClose}
        >
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close menu"
          >
            ×
          </button>
          <nav className={styles.linkList} onClick={(e) => e.stopPropagation()}>
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ ...tokens.cinematic, delay: i * 0.12 }}
              >
                <Link
                  href={link.href}
                  className={styles.mobileLink}
                  onClick={onClose}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 4: Create components/nav/Nav.tsx**

```tsx
// components/nav/Nav.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import * as styles from './Nav.css'
import { MobileOverlay } from './MobileOverlay'
import { tokens } from '@/lib/motion'

const navLinks = [
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
  { href: '/thoughts', label: 'Thoughts' },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.nav
        className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...tokens.cinematic, delay: 0.2 }}
      >
        <Link href="/" className={styles.brand}>
          Museum of Little Things
        </Link>

        <div className={styles.links}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </div>

        <button
          className={styles.hamburger}
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>
      </motion.nav>

      <MobileOverlay isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add components/nav/
git commit -m "feat: implement Nav and MobileOverlay components"
```

---

## Task 11: Hero Component

**Files:**
- Create: `components/hero/Hero.css.ts`
- Create: `components/hero/Hero.tsx`

- [ ] **Step 1: Create components/hero/Hero.css.ts**

```ts
// components/hero/Hero.css.ts
import { style, keyframes } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const section = style({
  position: 'relative',
  height: '100vh',
  overflow: 'hidden',
})

export const vignette = style({
  position: 'absolute',
  inset: 0,
  background: `radial-gradient(ellipse at center, transparent 30%, ${vars.color.bg} 100%)`,
  opacity: 0.65,
  zIndex: 1,
  pointerEvents: 'none',
})

export const title = style({
  position: 'absolute',
  bottom: vars.space.px24,
  left: vars.space.px24,
  zIndex: 2,
  fontFamily: vars.font.display,
  fontSize: 'clamp(3rem, 8vw, 7rem)',
  fontWeight: 300,
  color: vars.color.textPrimary,
  lineHeight: 1.05,
  textShadow: '0 0 40px rgba(13, 15, 20, 0.4)',
  margin: 0,
})

const pulse = keyframes({
  '0%': { opacity: 0.4, transform: 'scaleY(1)' },
  '50%': { opacity: 0.2, transform: 'scaleY(1.3)' },
  '100%': { opacity: 0.4, transform: 'scaleY(1)' },
})

export const scrollIndicator = style({
  position: 'absolute',
  bottom: vars.space.px12,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 2,
  width: '1px',
  height: '48px',
  backgroundColor: vars.color.accent,
  opacity: 0.4,
  transformOrigin: 'top center',
  animation: `${pulse} 2000ms cubic-bezier(0.16, 1, 0.3, 1) infinite`,
})
```

- [ ] **Step 2: Create components/hero/Hero.tsx**

The canvas fade is handled by `BoidsCanvasWrapper` in the layout (Task 9). Hero only controls the title and scroll indicator.

```tsx
// components/hero/Hero.tsx
'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import * as styles from './Hero.css'
import { tokens } from '@/lib/motion'

export function Hero() {
  const { scrollY } = useScroll()
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800

  const titleOpacity = useTransform(scrollY, [0, vh * 0.2], [1, 0])
  const titleScale = useTransform(scrollY, [0, vh * 0.2], [1, 0.97])

  return (
    <section className={styles.section}>
      <div className={styles.vignette} />

      <motion.h1
        className={styles.title}
        style={{ opacity: titleOpacity, scale: titleScale }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...tokens.cinematic, delay: 1.5 }}
      >
        Museum of Little Things
      </motion.h1>

      <motion.div
        className={styles.scrollIndicator}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...tokens.standard, delay: 2.6 }}
      />
    </section>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/hero/
git commit -m "feat: implement Hero section with title animation and scroll effects"
```

---

## Task 12: Root Layout, Home Page, Placeholder Pages

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Create: `app/about/page.tsx`
- Create: `app/thoughts/page.tsx`
- Create: `app/projects/page.tsx`

- [ ] **Step 1: Replace app/layout.tsx**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import { Space_Grotesk, Instrument_Sans, JetBrains_Mono } from 'next/font/google'
import { Nav } from '@/components/nav/Nav'
import { BoidsCanvasWrapper } from '@/components/cursor/BoidsCanvasWrapper'
import '@/styles/global.css'
import '@/styles/typography.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Museum of Little Things',
  description: 'A curated exhibition of work built with care.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${instrumentSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <BoidsCanvasWrapper />
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Replace app/page.tsx**

```tsx
// app/page.tsx
import { Hero } from '@/components/hero/Hero'

export default function HomePage() {
  return (
    <>
      <Hero />
    </>
  )
}
```

- [ ] **Step 3: Create app/about/page.tsx**

```tsx
// app/about/page.tsx
export default function AboutPage() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'var(--font-instrument-sans)',
        color: '#6B7280',
        fontSize: '1.125rem',
        letterSpacing: '0.04em',
      }}
    >
      Something is being written.
    </div>
  )
}
```

- [ ] **Step 4: Create app/thoughts/page.tsx**

Same as About:

```tsx
// app/thoughts/page.tsx
export default function ThoughtsPage() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'var(--font-instrument-sans)',
        color: '#6B7280',
        fontSize: '1.125rem',
        letterSpacing: '0.04em',
      }}
    >
      Something is being written.
    </div>
  )
}
```

- [ ] **Step 5: Create app/projects/page.tsx (stub)**

```tsx
// app/projects/page.tsx
// Full implementation in Day 2 plan
export default function ProjectsPage() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'var(--font-instrument-sans)',
        color: '#6B7280',
        fontSize: '1.125rem',
        letterSpacing: '0.04em',
      }}
    >
      Projects coming soon.
    </div>
  )
}
```

- [ ] **Step 6: Delete the default Next.js CSS file**

Next.js generates `app/globals.css` — delete it since Vanilla Extract handles all global styles:

```bash
rm app/globals.css
```

If `app/layout.tsx` still has `import './globals.css'`, remove that import (it was replaced in Step 1 above).

- [ ] **Step 7: Commit**

```bash
git add app/
git commit -m "feat: wire root layout with fonts, Nav, BoidsCanvas; add hero page and placeholders"
```

---

## Task 13: Dev Server Verification

**Files:** None — verification only.

- [ ] **Step 1: Run the dev server**

```bash
pnpm dev
```

Expected output: `▲ Next.js 14.x.x` with `Local: http://localhost:3000`. No build errors.

- [ ] **Step 2: Open http://localhost:3000 in a browser and verify:**

- [ ] Dark background (`#0D0F14`) fills the viewport
- [ ] Boids particles (pale blue dots) are visible and flocking
- [ ] Moving the cursor scatters nearby particles
- [ ] "Museum of Little Things" title appears bottom-left after ~1.5s, fades up into position
- [ ] Scroll indicator line appears at bottom-centre after ~2.6s
- [ ] Nav bar appears at top with "Museum of Little Things" brand on left, links on right
- [ ] Nav background changes to surface colour when scrolling down
- [ ] Title fades out as you scroll past the hero section
- [ ] Resizing the window keeps boids filling the full viewport
- [ ] Navigating to `/about` shows the placeholder text
- [ ] Navigating to `/thoughts` shows the placeholder text
- [ ] Hamburger icon appears on narrow viewport; clicking opens full-screen overlay

- [ ] **Step 3: Check browser console for errors**

Expected: no errors. Common warnings to ignore: React 18 hydration warnings about server/client mismatch for `typeof window` are fine.

- [ ] **Step 4: Run all tests**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: verified hero experience — Day 1 complete"
```

---

## Parallelism Notes for Subagent Execution

Tasks 4 and 5 (design tokens and motion tokens + content types) can run in parallel after Task 3 completes.

Tasks 7 (useBoids) and 6 (seed content + queries) can run in parallel.

Tasks 9 (BoidsCanvas), 10 (Nav), and 11 (Hero) can run in parallel after Tasks 4, 5, 7, 8 complete.

Task 12 (layout assembly) must be last before verification.
