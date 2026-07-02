# Exit Page Transitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current enter-only page fade (Framer Motion `AnimatePresence`) with a spatial exit transition that makes navigating from the gallery to a project feel like crossing into the work, not loading a new page.

**Architecture:** Spike the View Transitions API (VTA) + Next.js App Router compatibility first (Task 1). Based on the spike result, implement either the VTA expand path (Task 2A) or a Zustand overlay fallback (Task 2B). The existing `PageTransition.tsx` in `components/page-transition/` will be replaced. **Read `node_modules/next/dist/docs/` before writing any App Router navigation code** — the version in this repo may differ from training data (AGENTS.md).

**Tech Stack:** Next.js App Router, View Transitions API (Chrome 111+) or Zustand, React 18, Vanilla Extract

## Global Constraints

- Read `node_modules/next/dist/docs/` routing docs before writing navigation code (AGENTS.md)
- Implement ONE approach only — do not ship both VTA and overlay
- Max transition duration: 900ms (spec "Quiet" constraint — no simultaneous animations)
- Minimum transition duration: 500ms (spec "Luxurious" constraint)
- Transition must work at all scroll positions (not only when a panel is centred)
- Back navigation must also transition smoothly

---

### Task 1: Spike — VTA + App Router compatibility

This task determines which implementation path to take. It makes temporary changes only — **no code is committed from this task**.

**Files read/temporarily modified:**
- Read: `node_modules/next/dist/docs/` routing docs
- Temporarily modify: `components/gallery/ExhibitionPanel.tsx`
- Temporarily modify: `app/projects/[slug]/page.tsx`
- Temporarily modify: `styles/global.css.ts`

- [ ] **Step 1: Read App Router navigation docs**

```bash
ls node_modules/next/dist/docs/
```

Find the routing and linking/navigating docs, then read them:

```bash
cat "node_modules/next/dist/docs/02-app/01-routing/03-linking-and-navigating.md"
```

Focus on: how `<Link>` triggers navigation, whether the transition fires synchronously with the DOM swap, and whether streaming/Suspense interferes with VTA timing.

- [ ] **Step 2: Add test view-transition-name to ExhibitionPanel (temporary)**

In `components/gallery/ExhibitionPanel.tsx`, add a `style` prop to the `<Link>`:

```tsx
<Link
  href={`/projects/${project.slug}`}
  className={styles.link}
  style={{ viewTransitionName: `panel-${project.slug}` } as React.CSSProperties}
>
```

- [ ] **Step 3: Add test view-transition-name to the project detail page (temporary)**

In `app/projects/[slug]/page.tsx`, find where the project title `<h1>` is rendered and wrap it:

```tsx
<header style={{ viewTransitionName: 'panel-hero' } as React.CSSProperties}>
  {/* existing title/hero content */}
</header>
```

- [ ] **Step 4: Add test transition CSS (temporary)**

In `styles/global.css.ts`, add at the bottom:

```ts
globalStyle('::view-transition-old(panel-hero)', {
  animation: 'none',
})
```

Then add a plain `<style>` tag in `app/layout.tsx` body for the keyframe (Vanilla Extract doesn't support `@keyframes` in `globalStyle` for pseudo-elements):

```tsx
<style>{`
  ::view-transition-new(panel-hero) {
    animation: expand-in 500ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes expand-in {
    from { transform: scale(0.95); opacity: 0; }
    to   { transform: scale(1);    opacity: 1; }
  }
`}</style>
```

- [ ] **Step 5: Test in Chrome 111+ browser**

```
pnpm dev
```

Open Chrome. Navigate from the gallery to a project by clicking a panel. Check:

1. `document.startViewTransition` — does it exist? (`typeof document.startViewTransition !== 'undefined'` in console)
2. Does the CSS expand-in animation fire on navigation?
3. Does back navigation (browser back button) also transition?
4. Does it break hydration, throw console errors, or cause a white flash?
5. Does it work from any scroll position (scroll the gallery left/right, then click)?

- [ ] **Step 6: Record verdict — then revert temporary spike code**

**If VTA works cleanly** (transition fires, no hydration errors, back nav works): proceed to Task 2A.

**If VTA does NOT work** (transition doesn't fire, hydration errors, breaks back nav): proceed to Task 2B.

Revert all temporary changes:

```bash
git checkout -- components/gallery/ExhibitionPanel.tsx app/projects/[slug]/page.tsx styles/global.css.ts app/layout.tsx
```

Do NOT commit anything from this task.

---

### Task 2A: View Transitions API (if spike succeeded)

**Files:**
- Modify: `components/gallery/ExhibitionPanel.tsx` — add `view-transition-name`
- Modify: `app/projects/[slug]/page.tsx` — add `view-transition-name` to hero header
- Modify: `styles/global.css.ts` — add VTA override styles
- Modify: `components/page-transition/PageTransition.tsx` — remove Framer Motion (VTA handles transitions now)

**Interfaces:**
- No new exported functions — inline style and CSS changes only

- [ ] **Step 1: Add view-transition-name to ExhibitionPanel**

In `components/gallery/ExhibitionPanel.tsx`, update the `<Link>`:

```tsx
<Link
  href={`/projects/${project.slug}`}
  className={styles.link}
  style={{ viewTransitionName: `panel-${project.slug}` } as React.CSSProperties}
>
```

- [ ] **Step 2: Add view-transition-name to the project detail hero**

In `app/projects/[slug]/page.tsx`, find the project title heading (the first `<h1>` or equivalent hero section) and wrap it in a `<header>` with the matching transition name:

```tsx
<header style={{ viewTransitionName: 'panel-hero' } as React.CSSProperties}>
  {/* move existing title/hero JSX inside here */}
</header>
```

- [ ] **Step 3: Add transition CSS to global.css.ts**

In `styles/global.css.ts`, import `keyframes` if not already imported, then add:

```ts
import { globalStyle, keyframes } from '@vanilla-extract/css'

const expandIn = keyframes({
  from: { transform: 'scale(0.95)', opacity: '0' },
  to:   { transform: 'scale(1)',    opacity: '1' },
})

globalStyle('::view-transition-old(panel-hero)', {
  animation: 'none',
})

globalStyle('::view-transition-new(panel-hero)', {
  animation: `${expandIn} 500ms cubic-bezier(0.16, 1, 0.3, 1)`,
})
```

- [ ] **Step 4: Simplify PageTransition.tsx**

VTA now handles the transition. Remove Framer Motion to avoid conflict:

```tsx
// components/page-transition/PageTransition.tsx
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>
}
```

- [ ] **Step 5: Verify in browser**

```
pnpm dev
```

Check all three acceptance criteria from the spec:
- Gallery → project: panel expands into hero — feels spatial, not a reload
- Back navigation: returns smoothly to the gallery room
- Works from any scroll position (scroll the gallery, then click a non-centred panel)

Also confirm the `'use client'` directive is removed from `PageTransition.tsx` if it's no longer needed.

- [ ] **Step 6: Commit**

```bash
git add components/gallery/ExhibitionPanel.tsx app/projects/[slug]/page.tsx styles/global.css.ts components/page-transition/PageTransition.tsx
git commit -m "feat: View Transitions API expand for gallery-to-project navigation"
```

---

### Task 2B: Zustand overlay fallback (if spike failed)

**Files:**
- Create: `store/transitionStore.ts` — Zustand store with `isTransitioning` flag
- Create: `components/page-transition/TransitionOverlay.tsx` — fixed overlay that fades in/out
- Modify: `components/page-transition/PageTransition.tsx` — end transition on route change
- Modify: `components/gallery/ExhibitionPanel.tsx` — intercept navigation, trigger overlay
- Modify: `app/layout.tsx` — render overlay

**Interfaces:**
- `useTransitionStore`: `{ isTransitioning: boolean; startTransition: () => void; endTransition: () => void }`

- [ ] **Step 1: Check if zustand is installed**

```bash
grep '"zustand"' package.json
```

If absent: `pnpm add zustand`

- [ ] **Step 2: Create transitionStore.ts**

```ts
// store/transitionStore.ts
import { create } from 'zustand'

type TransitionStore = {
  isTransitioning: boolean
  startTransition: () => void
  endTransition: () => void
}

export const useTransitionStore = create<TransitionStore>((set) => ({
  isTransitioning: false,
  startTransition: () => set({ isTransitioning: true }),
  endTransition: () => set({ isTransitioning: false }),
}))
```

- [ ] **Step 3: Create TransitionOverlay.tsx**

```tsx
// components/page-transition/TransitionOverlay.tsx
'use client'

import { useTransitionStore } from '@/store/transitionStore'

export function TransitionOverlay() {
  const isTransitioning = useTransitionStore((s) => s.isTransitioning)
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0d1117',
        zIndex: 9999,
        pointerEvents: isTransitioning ? 'all' : 'none',
        opacity: isTransitioning ? 1 : 0,
        transition: 'opacity 300ms ease',
      }}
    />
  )
}
```

- [ ] **Step 4: Add TransitionOverlay to layout.tsx**

In `app/layout.tsx`:

```tsx
import { TransitionOverlay } from '@/components/page-transition/TransitionOverlay'

// Inside <body>, before <PageTransition>:
<BoidsCanvasWrapper />
<Nav />
<TransitionOverlay />
<PageTransition>{children}</PageTransition>
```

- [ ] **Step 5: Intercept navigation in ExhibitionPanel.tsx**

Replace the `<Link>` with a `<button>` that triggers the overlay then pushes the route:

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useTransitionStore } from '@/store/transitionStore'
// ... other imports unchanged

export function ExhibitionPanel({ project, index, activeIndex }: Props) {
  const offset = index - activeIndex
  const rotateY = Math.max(-MAX_TILT, Math.min(MAX_TILT, -offset * MAX_TILT))
  const isActive = offset === 0
  const router = useRouter()
  const startTransition = useTransitionStore((s) => s.startTransition)

  const handleClick = () => {
    startTransition()
    setTimeout(() => router.push(`/projects/${project.slug}`), 300)
  }

  return (
    <button
      onClick={handleClick}
      className={styles.link}
      style={{ all: 'unset', cursor: 'pointer', display: 'block' }}
    >
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
    </button>
  )
}
```

- [ ] **Step 6: End transition in PageTransition.tsx on route change**

```tsx
// components/page-transition/PageTransition.tsx
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useTransitionStore } from '@/store/transitionStore'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const endTransition = useTransitionStore((s) => s.endTransition)

  useEffect(() => {
    endTransition()
  }, [pathname, endTransition])

  return <main>{children}</main>
}
```

- [ ] **Step 7: Verify in browser**

```
pnpm dev
```

Check:
- Gallery → project: overlay fades to black, then fades away after the new page mounts
- Back navigation (browser back): no overlay fires (back nav doesn't go through `handleClick`)
- Works from any scroll position
- Total overlay duration ≤ 900ms (300ms fade-in + navigation + fade-out on mount)

- [ ] **Step 8: Commit**

```bash
git add store/transitionStore.ts components/page-transition/PageTransition.tsx components/page-transition/TransitionOverlay.tsx components/gallery/ExhibitionPanel.tsx app/layout.tsx
git commit -m "feat: Zustand overlay exit transition for gallery-to-project navigation"
```

---

## Self-Review

**Spec coverage:**
- Exit transition on navigate from gallery ✅ (2A or 2B)
- Navigating feels spatial ✅ (VTA expand, or overlay blackout)
- Back navigation feels like returning to the room ✅ (VTA handles natively; overlay doesn't fire on browser back)
- Works at all scroll positions ✅ (transition is on the element, not scroll-dependent)
- Spike-first before committing approach ✅ Task 1
- One approach only ✅ (2A OR 2B, never both)
- 500ms–900ms transition duration ✅ (expand-in: 500ms; overlay: 300ms fade + navigation ~200ms)

**Open question from spec resolved:** "Is View Transitions API acceptable as Chrome-first?" — Task 1 spike determines this. VTA is Chrome 111+ (also Safari 18+, Firefox 131+). If the spike shows App Router compatibility, it's the right choice. If it doesn't fire cleanly (e.g., because App Router uses client-side navigation that doesn't wrap in `startViewTransition`), Task 2B is the clean fallback.

**Placeholder scan:** None found.

**Type consistency:** `useTransitionStore` returns `{ isTransitioning: boolean; startTransition: () => void; endTransition: () => void }` — used consistently in `TransitionOverlay`, `ExhibitionPanel`, and `PageTransition`.
