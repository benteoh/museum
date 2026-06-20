# Museum Day 2 — Preview Primitive + Home Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the home exhibition gallery — a sticky, horizontally-scrolling, 3D-perspective track of project panels — backed by a shared `ProjectPreview` primitive that resolves to a bespoke component, an image/GIF, or an animated fallback.

**Architecture:** Server Component (`app/page.tsx`) fetches featured projects via `queries.ts` and passes plain data to client components. A `useGallery` hook owns scroll→track mapping (pure cores extracted for tests); `GalleryTrack` lays out `ExhibitionPanel`s; `ProjectPreview` decides each panel's visual. Styling is Vanilla Extract; motion is Framer Motion. Covers spec sub-projects A + B (`docs/superpowers/specs/2026-06-14-museum-day2-showcase-design.md`).

**Tech Stack:** Next.js 16 (App Router), React 19, Framer Motion 12, Vanilla Extract, Velite, Vitest.

---

## File Structure

**Create:**
- `components/projects/resolvePreview.ts` — pure preview-source chooser
- `components/projects/ProjectPreview.tsx` + `.css.ts` — the shared preview primitive
- `components/projects/previews/index.ts` — bespoke preview registry
- `components/projects/previews/DefaultPreview.tsx` + `.css.ts` — animated fallback
- `hooks/galleryMath.ts` — pure `scrollDistance` + `activeIndexAt`
- `hooks/useGallery.ts` — scroll/spring wiring
- `components/gallery/ExhibitionPanel.tsx` + `.css.ts` — one vitrine (+ skeleton)
- `components/gallery/GalleryTrack.tsx` + `.css.ts` — sticky track
- `components/home/CuratorLine.tsx` + `.css.ts` — Moment 2
- `components/home/Invitation.tsx` + `.css.ts` — Moment N+1
- `tests/components/resolvePreview.test.ts`
- `tests/hooks/galleryMath.test.ts`

**Modify:**
- `lib/content/types.ts` — fix `body` type (string), re-export Velite type
- `components/projects/ProjectCard.tsx` — add `heroImage` to `ProjectCardData`, render `ProjectPreview`
- `components/projects/ProjectCard.css.ts` — preview-fill style
- `app/page.tsx` — compose Hero → CuratorLine → GalleryTrack → Invitation

---

## Sub-project A — Preview Primitive + Type Fix

### Task A1: Fix the Project content type

**Files:**
- Modify: `lib/content/types.ts`

Velite emits `body` as a compiled JS **string**, not a React component. The hand-written type says `React.ComponentType`, which is wrong. Re-export Velite's generated type as the source of truth while keeping an app-facing alias.

- [ ] **Step 1: Replace `lib/content/types.ts` contents**

```ts
// lib/content/types.ts
// Velite generates the authoritative Project type from velite.config.ts.
// Re-export it so the app and the generated data never drift.
export type { Project } from '../../.velite'

// Convenience aliases used across the UI.
export type ProjectStatus = 'live' | 'wip' | 'archived'
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: PASS (no errors). `queries.ts` already operates structurally on these fields; `body` is now correctly `string`.

- [ ] **Step 3: Run tests**

Run: `pnpm test`
Expected: PASS (14 tests, unchanged).

- [ ] **Step 4: Commit**

```bash
git add lib/content/types.ts
git commit -m "fix: align Project body type with Velite output (string)"
```

---

### Task A2: `resolvePreview` pure function (TDD)

**Files:**
- Create: `components/projects/resolvePreview.ts`
- Test: `tests/components/resolvePreview.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/components/resolvePreview.test.ts
import { describe, it, expect } from 'vitest'
import { resolvePreview } from '@/components/projects/resolvePreview'

describe('resolvePreview', () => {
  it('chooses component when a bespoke preview exists', () => {
    expect(resolvePreview({ hasComponent: true, heroImage: '/x.png' })).toBe('component')
  })

  it('chooses image when no component but heroImage present', () => {
    expect(resolvePreview({ hasComponent: false, heroImage: '/x.gif' })).toBe('image')
  })

  it('falls back to default when neither is present', () => {
    expect(resolvePreview({ hasComponent: false })).toBe('default')
  })

  it('treats empty-string heroImage as absent', () => {
    expect(resolvePreview({ hasComponent: false, heroImage: '' })).toBe('default')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/components/resolvePreview.test.ts`
Expected: FAIL — cannot find module `resolvePreview`.

- [ ] **Step 3: Write minimal implementation**

```ts
// components/projects/resolvePreview.ts
export type PreviewKind = 'component' | 'image' | 'default'

export function resolvePreview(opts: {
  hasComponent: boolean
  heroImage?: string
}): PreviewKind {
  if (opts.hasComponent) return 'component'
  if (opts.heroImage) return 'image'
  return 'default'
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/components/resolvePreview.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add components/projects/resolvePreview.ts tests/components/resolvePreview.test.ts
git commit -m "feat: add resolvePreview source chooser with tests"
```

---

### Task A3: Preview registry + `DefaultPreview`

**Files:**
- Create: `components/projects/previews/index.ts`
- Create: `components/projects/previews/DefaultPreview.css.ts`
- Create: `components/projects/previews/DefaultPreview.tsx`

- [ ] **Step 1: Create the registry**

```ts
// components/projects/previews/index.ts
import type { ComponentType } from 'react'

// Bespoke per-project animated previews live here as client components,
// keyed by project slug. Empty until a project earns a custom preview.
export const PREVIEW_COMPONENTS: Record<string, ComponentType> = {}
```

- [ ] **Step 2: Create the DefaultPreview styles**

```ts
// components/projects/previews/DefaultPreview.css.ts
import { style, keyframes } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

const drift = keyframes({
  '0%, 100%': { backgroundPosition: '0% 50%' },
  '50%': { backgroundPosition: '100% 50%' },
})

export const root = style({
  width: '100%',
  height: '100%',
  // --tint is set inline per project; falls back to the surface colour.
  background: `linear-gradient(135deg, var(--tint, ${vars.color.surface}), ${vars.color.bg})`,
  backgroundSize: '200% 200%',
  animation: `${drift} 8000ms ${vars.ease.out} infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
})
```

- [ ] **Step 3: Create the DefaultPreview component**

```tsx
// components/projects/previews/DefaultPreview.tsx
'use client'

import type { CSSProperties } from 'react'
import * as styles from './DefaultPreview.css'

/** Calm animated fill shown when a project has no component or image. */
export function DefaultPreview({ heroColour }: { heroColour?: string }) {
  const style = heroColour ? ({ '--tint': heroColour } as CSSProperties) : undefined
  return <div className={styles.root} style={style} aria-hidden />
}
```

- [ ] **Step 4: Verify typecheck + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: PASS, no errors.

- [ ] **Step 5: Commit**

```bash
git add components/projects/previews/
git commit -m "feat: add preview registry and animated DefaultPreview"
```

---

### Task A4: `ProjectPreview` component

**Files:**
- Create: `components/projects/ProjectPreview.css.ts`
- Create: `components/projects/ProjectPreview.tsx`

- [ ] **Step 1: Create the styles**

```ts
// components/projects/ProjectPreview.css.ts
import { style } from '@vanilla-extract/css'

export const root = style({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  pointerEvents: 'none', // panels own interaction; preview is decorative
})

export const image = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
})
```

- [ ] **Step 2: Create the component**

```tsx
// components/projects/ProjectPreview.tsx
'use client'

import { PREVIEW_COMPONENTS } from './previews'
import { DefaultPreview } from './previews/DefaultPreview'
import { resolvePreview } from './resolvePreview'
import * as styles from './ProjectPreview.css'

type Props = {
  slug: string
  heroImage?: string
  heroColour?: string
  title: string
}

/** Resolves a project's visual: bespoke component → image/GIF → animated fallback. */
export function ProjectPreview({ slug, heroImage, heroColour, title }: Props) {
  const Custom = PREVIEW_COMPONENTS[slug]
  const kind = resolvePreview({ hasComponent: Boolean(Custom), heroImage })

  return (
    <div className={styles.root}>
      {kind === 'component' && Custom ? (
        <Custom />
      ) : kind === 'image' ? (
        // eslint-disable-next-line @next/next/no-img-element -- GIFs/SVerify need raw <img>, not next/image
        <img className={styles.image} src={heroImage} alt={title} />
      ) : (
        <DefaultPreview heroColour={heroColour} />
      )}
    </div>
  )
}
```

> Note: the eslint-disable comment is required — `@next/next/no-img-element` would otherwise fail `pnpm lint`. Fix the typo in the comment to read `SVGs/GIFs need raw <img>` when implementing.

- [ ] **Step 3: Verify typecheck + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/projects/ProjectPreview.tsx components/projects/ProjectPreview.css.ts
git commit -m "feat: add ProjectPreview primitive"
```

---

### Task A5: Wire `ProjectPreview` into `ProjectCard`

**Files:**
- Modify: `components/projects/ProjectCard.tsx`
- Modify: `components/projects/ProjectCard.css.ts`

- [ ] **Step 1: Add `heroImage` to `ProjectCardData` and render the preview**

Replace the `ProjectCardData` type and the `panel` block in `components/projects/ProjectCard.tsx`. The type gains `heroImage`:

```tsx
export type ProjectCardData = {
  slug: string
  title: string
  description: string
  heroImage?: string
  heroColour?: string
  tags: string[]
  status: ProjectStatus
}
```

And the panel renders `ProjectPreview` behind the badge (add `import { ProjectPreview } from './ProjectPreview'` at the top):

```tsx
      <div className={styles.panel}>
        <ProjectPreview
          slug={project.slug}
          heroImage={project.heroImage}
          heroColour={project.heroColour}
          title={project.title}
        />
        <span className={styles.badge}>
          <span className={styles.badgeDot} style={{ backgroundColor: status.colour }} />
          {status.label}
        </span>
      </div>
```

- [ ] **Step 2: Update panel styles**

In `components/projects/ProjectCard.css.ts`, the `panel` keeps its aspect ratio and becomes a positioning context (drop the gradient `backgroundImage`, since `ProjectPreview` now fills it):

```ts
export const panel = style({
  position: 'relative',
  aspectRatio: '16 / 10',
  overflow: 'hidden',
  backgroundColor: vars.color.surface,
})
```

Leave `badge`, `badgeDot`, `body`, `title`, `description`, `tags`, `tag` unchanged. The badge already has `zIndex`-free stacking; since `ProjectPreview.root` is absolute and the badge follows it in source order, the badge paints on top.

- [ ] **Step 3: Verify build (Velite + Next) and tests**

Run: `npx tsc --noEmit && pnpm lint && pnpm test`
Expected: PASS. The `/projects` placeholder page (passes no data → skeletons) is unaffected.

- [ ] **Step 4: Commit**

```bash
git add components/projects/ProjectCard.tsx components/projects/ProjectCard.css.ts
git commit -m "feat: render ProjectPreview inside ProjectCard"
```

---

## Sub-project B — Home Exhibition Gallery

### Task B1: Gallery math pure functions (TDD)

**Files:**
- Create: `hooks/galleryMath.ts`
- Test: `tests/hooks/galleryMath.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/hooks/galleryMath.test.ts
import { describe, it, expect } from 'vitest'
import { scrollDistance, activeIndexAt } from '@/hooks/galleryMath'

describe('scrollDistance', () => {
  it('is the overflow beyond the viewport', () => {
    expect(scrollDistance(3000, 1200)).toBe(1800)
  })

  it('clamps to zero when the track fits the viewport', () => {
    expect(scrollDistance(800, 1200)).toBe(0)
  })
})

describe('activeIndexAt', () => {
  it('maps progress 0 to the first panel', () => {
    expect(activeIndexAt(0, 5)).toBe(0)
  })

  it('maps progress 1 to the last panel', () => {
    expect(activeIndexAt(1, 5)).toBe(4)
  })

  it('rounds to the nearest panel mid-track', () => {
    expect(activeIndexAt(0.5, 5)).toBe(2)
  })

  it('returns 0 for a non-positive panel count', () => {
    expect(activeIndexAt(0.5, 0)).toBe(0)
  })

  it('clamps out-of-range progress', () => {
    expect(activeIndexAt(1.5, 3)).toBe(2)
    expect(activeIndexAt(-0.5, 3)).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/hooks/galleryMath.test.ts`
Expected: FAIL — cannot find module `galleryMath`.

- [ ] **Step 3: Write minimal implementation**

```ts
// hooks/galleryMath.ts

/** Horizontal pixels the track must travel: overflow beyond the viewport, never negative. */
export function scrollDistance(trackWidth: number, viewportWidth: number): number {
  return Math.max(0, trackWidth - viewportWidth)
}

/** Nearest panel index for a 0→1 scroll progress. */
export function activeIndexAt(progress: number, panelCount: number): number {
  if (panelCount <= 0) return 0
  const clamped = Math.max(0, Math.min(1, progress))
  const index = Math.round(clamped * (panelCount - 1))
  return Math.max(0, Math.min(panelCount - 1, index))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/hooks/galleryMath.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add hooks/galleryMath.ts tests/hooks/galleryMath.test.ts
git commit -m "feat: add gallery math (scrollDistance, activeIndexAt) with tests"
```

---

### Task B2: `useGallery` hook

**Files:**
- Create: `hooks/useGallery.ts`

- [ ] **Step 1: Write the hook**

```ts
// hooks/useGallery.ts
'use client'

import { useEffect, useRef, useState } from 'react'
import {
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
  type MotionValue,
} from 'framer-motion'
import { scrollDistance, activeIndexAt } from './galleryMath'

type GalleryControls = {
  sectionRef: React.RefObject<HTMLDivElement | null>
  trackRef: React.RefObject<HTMLDivElement | null>
  x: MotionValue<number>
  activeIndex: number
}

/**
 * Drives the horizontal gallery: maps vertical scroll over the sticky section
 * to a sprung horizontal translate, and tracks the centred panel index.
 */
export function useGallery(panelCount: number): GalleryControls {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [distance, setDistance] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current
      if (!track) return
      setDistance(scrollDistance(track.scrollWidth, window.innerWidth))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [panelCount])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const rawX = useTransform(scrollYProgress, [0, 1], [0, -distance])
  const x = useSpring(rawX, { stiffness: 60, damping: 20 })

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    setActiveIndex(activeIndexAt(progress, panelCount))
  })

  return { sectionRef, trackRef, x, activeIndex }
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add hooks/useGallery.ts
git commit -m "feat: add useGallery scroll-to-track hook"
```

---

### Task B3: `ExhibitionPanel` (+ skeleton)

**Files:**
- Create: `components/gallery/ExhibitionPanel.css.ts`
- Create: `components/gallery/ExhibitionPanel.tsx`

- [ ] **Step 1: Create the styles**

```ts
// components/gallery/ExhibitionPanel.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const link = style({
  flex: '0 0 auto',
  display: 'block',
})

export const panel = style({
  position: 'relative',
  width: 'clamp(320px, 40vw, 560px)',
  height: '70vh',
  borderRadius: '12px',
  overflow: 'hidden',
  backgroundColor: vars.color.surface,
  boxShadow: '0 8px 24px rgba(13, 15, 20, 0.6)',
  transition: `box-shadow 500ms ${vars.ease.out}`,
  ':hover': {
    boxShadow: '0 12px 32px rgba(13, 15, 20, 0.8)',
  },
})

// Vitrine glass overlay (spec v2.1 §2.5).
export const glass = style({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  gap: vars.space.px2,
  padding: vars.space.px6,
  backdropFilter: 'blur(4px)',
  background: 'rgba(13, 15, 20, 0.15)',
  border: '1px solid rgba(184, 212, 232, 0.08)',
  borderRadius: '12px',
  transition: `background 500ms ${vars.ease.out}, border-color 500ms ${vars.ease.out}`,
  selectors: {
    [`${panel}:hover &`]: {
      background: 'rgba(13, 15, 20, 0.06)',
      borderColor: 'rgba(184, 212, 232, 0.14)',
    },
  },
})

export const title = style({
  fontFamily: vars.font.display,
  fontSize: '1.75rem',
  fontWeight: 500,
  letterSpacing: '-0.02em',
  color: vars.color.textPrimary,
})

export const meta = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space.px2,
  fontFamily: vars.font.mono,
  fontSize: '0.6875rem',
  letterSpacing: '0.04em',
  color: vars.color.monoTag,
})
```

- [ ] **Step 2: Create the component (and skeleton)**

```tsx
// components/gallery/ExhibitionPanel.tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ProjectPreview } from '@/components/projects/ProjectPreview'
import type { ProjectCardData } from '@/components/projects/ProjectCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { tokens } from '@/lib/motion'
import * as styles from './ExhibitionPanel.css'

const MAX_TILT = 8

type Props = {
  project: ProjectCardData
  index: number
  activeIndex: number
}

export function ExhibitionPanel({ project, index, activeIndex }: Props) {
  const offset = index - activeIndex
  const rotateY = Math.max(-MAX_TILT, Math.min(MAX_TILT, -offset * MAX_TILT))
  const isActive = offset === 0

  return (
    <Link href={`/projects/${project.slug}`} className={styles.link}>
      <motion.article
        className={styles.panel}
        animate={{ rotateY, scale: isActive ? 1.02 : 1 }}
        transition={tokens.standard}
      >
        <ProjectPreview
          slug={project.slug}
          heroImage={project.heroImage}
          heroColour={project.heroColour}
          title={project.title}
        />
        <div className={styles.glass}>
          <h3 className={styles.title}>{project.title}</h3>
          <div className={styles.meta}>
            {project.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </motion.article>
    </Link>
  )
}

/** Placeholder vitrine shown when there is no project content yet. */
export function ExhibitionPanelSkeleton() {
  return (
    <div className={styles.link}>
      <div className={styles.panel}>
        <Skeleton width="100%" height="100%" radius="0" />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify typecheck + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/gallery/ExhibitionPanel.tsx components/gallery/ExhibitionPanel.css.ts
git commit -m "feat: add ExhibitionPanel vitrine with 3D tilt and skeleton"
```

---

### Task B4: `GalleryTrack`

**Files:**
- Create: `components/gallery/GalleryTrack.css.ts`
- Create: `components/gallery/GalleryTrack.tsx`

- [ ] **Step 1: Create the styles**

```ts
// components/gallery/GalleryTrack.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

// Height is set inline (depends on panel count) to allocate scroll length.
export const section = style({
  position: 'relative',
})

export const sticky = style({
  position: 'sticky',
  top: 0,
  height: '100vh',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  perspective: '1200px',
})

export const track = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.px16, // 64px
  paddingLeft: vars.space.px32, // 128px threshold inset
  paddingRight: vars.space.px32,
  transformStyle: 'preserve-3d',
  willChange: 'transform',
})
```

- [ ] **Step 2: Create the component**

```tsx
// components/gallery/GalleryTrack.tsx
'use client'

import { motion } from 'framer-motion'
import type { ProjectCardData } from '@/components/projects/ProjectCard'
import { useGallery } from '@/hooks/useGallery'
import { ExhibitionPanel, ExhibitionPanelSkeleton } from './ExhibitionPanel'
import * as styles from './GalleryTrack.css'

const PLACEHOLDER_COUNT = 4

export function GalleryTrack({ projects }: { projects: ProjectCardData[] }) {
  const isEmpty = projects.length === 0
  const panelCount = isEmpty ? PLACEHOLDER_COUNT : projects.length
  const { sectionRef, trackRef, x, activeIndex } = useGallery(panelCount)

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      style={{ height: `${(panelCount + 1) * 100}vh` }}
    >
      <div className={styles.sticky}>
        <motion.div ref={trackRef} className={styles.track} style={{ x }}>
          {isEmpty
            ? Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
                <ExhibitionPanelSkeleton key={i} />
              ))
            : projects.map((project, index) => (
                <ExhibitionPanel
                  key={project.slug}
                  project={project}
                  index={index}
                  activeIndex={activeIndex}
                />
              ))}
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify typecheck + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/gallery/GalleryTrack.tsx components/gallery/GalleryTrack.css.ts
git commit -m "feat: add sticky horizontal GalleryTrack"
```

---

### Task B5: `CuratorLine` (Moment 2)

**Files:**
- Create: `components/home/CuratorLine.css.ts`
- Create: `components/home/CuratorLine.tsx`

- [ ] **Step 1: Create the styles**

```ts
// components/home/CuratorLine.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const section = style({
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `0 ${vars.space.px6}`,
})

export const line = style({
  maxWidth: '42rem',
  textAlign: 'center',
  fontFamily: vars.font.body,
  fontSize: '1.125rem',
  lineHeight: 1.7,
  letterSpacing: '0.04em',
  color: vars.color.textSecondary,
})
```

- [ ] **Step 2: Create the component**

```tsx
// components/home/CuratorLine.tsx
'use client'

import { motion } from 'framer-motion'
import { tokens } from '@/lib/motion'
import * as styles from './CuratorLine.css'

export function CuratorLine({ note }: { note: string }) {
  return (
    <section className={styles.section}>
      <motion.p
        className={styles.line}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ amount: 0.6 }}
        transition={tokens.standard}
      >
        {note}
      </motion.p>
    </section>
  )
}
```

- [ ] **Step 3: Verify typecheck + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/home/CuratorLine.tsx components/home/CuratorLine.css.ts
git commit -m "feat: add CuratorLine home moment"
```

---

### Task B6: `Invitation` (Moment N+1)

**Files:**
- Create: `components/home/Invitation.css.ts`
- Create: `components/home/Invitation.tsx`

- [ ] **Step 1: Create the styles**

```ts
// components/home/Invitation.css.ts
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/tokens.css'

export const section = style({
  height: '80vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

export const link = style({
  position: 'relative',
  fontFamily: vars.font.body,
  fontSize: '1.125rem',
  letterSpacing: '0.04em',
  color: vars.color.textSecondary,
  transition: `color 150ms ${vars.ease.out}`,
  ':hover': {
    color: vars.color.textPrimary,
  },
  '::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '-4px',
    height: '1px',
    backgroundColor: vars.color.accent,
    transformOrigin: 'left',
    transform: 'scaleX(0)',
    transition: `transform 150ms ${vars.ease.out}`,
  },
  selectors: {
    '&:hover::after': {
      transform: 'scaleX(1)',
    },
  },
})
```

- [ ] **Step 2: Create the component**

This is a Server Component (no hooks; hover is pure CSS).

```tsx
// components/home/Invitation.tsx
import Link from 'next/link'
import * as styles from './Invitation.css'

export function Invitation() {
  return (
    <section className={styles.section}>
      <Link href="/projects" className={styles.link}>
        Browse the full collection
      </Link>
    </section>
  )
}
```

- [ ] **Step 3: Verify typecheck + lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/home/Invitation.tsx components/home/Invitation.css.ts
git commit -m "feat: add Invitation home moment"
```

---

### Task B7: Compose the home page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
// app/page.tsx
import { Hero } from '@/components/hero/Hero'
import { CuratorLine } from '@/components/home/CuratorLine'
import { GalleryTrack } from '@/components/gallery/GalleryTrack'
import { Invitation } from '@/components/home/Invitation'
import type { ProjectCardData } from '@/components/projects/ProjectCard'
import { projects } from '@/lib/content'
import { getFeaturedProjects, getCuratorNote } from '@/lib/content/queries'

export default function HomePage() {
  const note = getCuratorNote(projects)
  const cards: ProjectCardData[] = getFeaturedProjects(projects).map(
    ({ slug, title, description, heroImage, heroColour, tags, status }) => ({
      slug,
      title,
      description,
      heroImage,
      heroColour,
      tags,
      status,
    })
  )

  return (
    <>
      <Hero />
      <CuratorLine note={note} />
      <GalleryTrack projects={cards} />
      <Invitation />
    </>
  )
}
```

> `getFeaturedProjects` and `getCuratorNote` already exist in `lib/content/queries.ts`. They take `projects` as an argument (the re-exported Velite array). With one featured project, the gallery renders a single real panel and no horizontal travel (degenerate but valid); add more featured projects later for the full effect.

- [ ] **Step 2: Full build verification**

Run: `npx tsc --noEmit && pnpm lint && pnpm test && pnpm build`
Expected: all PASS; `pnpm build` prerenders `/` (and the other routes) with no errors.

- [ ] **Step 3: Manual verification**

Run: `pnpm dev`, open `/`. Confirm: hero loads, scrolling reveals the curator line, then the sticky gallery; the track translates horizontally as you scroll; the centred panel sits upright while neighbours tilt; hovering a panel thins its glass and lifts it; the invitation appears last and links to `/projects`.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: compose home tour (hero, curator, gallery, invitation)"
```

---

## Self-Review Notes

- **Spec coverage:** A1 covers §3.1 type fix; A2–A4 cover §2.1–2.3 preview model; A5 covers §2.4 + ProjectCard integration; B1–B2 cover §4.1 (`useGallery` + pure cores); B3 covers §4.3 (`ExhibitionPanel`); B4 covers §4.2 (`GalleryTrack`); B5/B6 cover §4.4 (Moments 2 & N+1); B7 composes §4.4 home page. Index (C), detail (D), and transitions (E) are deferred to their own plans per the spec build order.
- **Skeleton reuse:** `ExhibitionPanelSkeleton` and the existing `Skeleton` cover the empty-content state (spec §3).
- **Type consistency:** `ProjectCardData` (with `heroImage`) is the single shape passed from `app/page.tsx` → `GalleryTrack` → `ExhibitionPanel` → `ProjectPreview`. `PreviewKind`, `scrollDistance`, and `activeIndexAt` names match across tasks.
- **Naming fix to apply during A4:** correct the eslint-disable comment typo (`SVerify` → `SVGs/GIFs`).

---

## Deferred (own plans)

- **C** — `/projects` index (filter bar, asymmetric grid, ProjectCard staggered load).
- **D** — `/projects/[slug]` detail (header, `CaseStudy` via `useMDXComponent`, `IframeWrapper`, related).
- **E** — page transitions (`PageTransition` enter-only).
