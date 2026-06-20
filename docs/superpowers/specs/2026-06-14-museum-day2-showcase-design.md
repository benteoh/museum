# Museum of Little Things — Day 2: Project Showcase Design


Builds on `2026-06-04-museum-of-little-things-design.md` (v2.1). That document remains
the source of truth for colour/typography/motion tokens, spacing, and atmosphere. This
spec covers only the Day 2 showcase: the home exhibition gallery, the project index, the
project detail page, the shared preview model, and page transitions.

---

## 1. Goal

The showcase is the main attraction. A visitor scrolls into a sticky, horizontally
tracking gallery of project panels, each previewing a project as a *living thumbnail*,
then clicks through to a detail page where the real project loads **live and interactive**
in an iframe alongside a case study.

**Key decisions (from brainstorming):**

- **Full Day 2** in scope, built in sequence so the hook works first.
- **Previews are not live iframes.** Gallery and index panels show a `ProjectPreview`
  that resolves to a bespoke animated component, a GIF/image, or an animated fallback —
  never a live iframe. Live, interactive iframes appear **only on the detail page**.
- One preview primitive is shared by gallery, index, and detail-page header.

---

## 2. The Preview Model

### 2.1 `ProjectPreview`

`components/projects/ProjectPreview.tsx` ('use client'). Resolves a project's visual in
priority order so a panel is never visually dead:

1. **Bespoke animated component** — if `PREVIEW_COMPONENTS[slug]` exists, render it.
2. **GIF / image** — else if `heroImage` is set, render via `<img>` (a `.gif` works as-is).
3. **Animated fallback** — else render `DefaultPreview`, a subtle motion fill tinted by
   `heroColour`.

```ts
type ProjectPreviewProps = {
  slug: string
  heroImage?: string
  heroColour?: string
  title: string   // used as img alt / aria-label
}
```

Previews are **non-interactive** in gallery/index contexts: the panel owns interaction
(it is a link), so `ProjectPreview` renders decoratively with `pointer-events: none` on
its root. It does not know or care where it is mounted.

### 2.2 Preview registry

`components/projects/previews/index.ts`:

```ts
import type { ComponentType } from 'react'
// Bespoke, per-project animated previews live here as client components.
export const PREVIEW_COMPONENTS: Record<string, ComponentType> = {
  // 'tidepool': TidepoolPreview,
}
```

Rationale: MDX frontmatter is data and cannot carry a React component. Project *metadata*
stays in MDX; *bespoke animated previews* stay in code, keyed by slug. The registry starts
empty; projects fall through to image or `DefaultPreview` until a bespoke one is authored.

### 2.4 Shared card/panel data shape

Gallery panels and index cards consume the same projection of a project. The existing
`ProjectCardData` (in `ProjectCard.tsx`) is **extended with `heroImage`** so `ProjectPreview`
can resolve it:

```ts
type ProjectCardData = {
  slug: string
  title: string
  description: string
  heroImage?: string   // added
  heroColour?: string
  tags: string[]
  status: ProjectStatus
}
```

Route Server Components map each Velite project to this shape (dropping `body`, `iframeUrl`,
etc.) before passing it to client gallery/index components.

### 2.3 `DefaultPreview`

`components/projects/previews/DefaultPreview.tsx` ('use client'). A calm, looping motion
fill (e.g. a slow gradient drift tinted by `heroColour`, falling back to `--surface`).
Respects `prefers-reduced-motion` by rendering a static tint. Keeps every panel alive even
with zero authored assets.

---

## 3. Content

The showcase consumes real project MDX through the existing Velite pipeline. Seeding
genuine projects (real `iframeUrl`, assets) is the user's content task and is **not**
fabricated here.

**Build/test implication:** every showcase surface must degrade gracefully when there are
few or zero projects — it reuses the existing `Skeleton` work to render placeholder panels
(see §4.2, §5.2). This means the gallery motion and layout are demoable before real content
exists. The lone existing project (`museum-of-little-things`) plus placeholder panels are
sufficient to build and verify the mechanics.

### 3.1 Type fix (prerequisite)

`lib/content/types.ts` currently declares `body: React.ComponentType`. Velite's `s.mdx()`
emits `body` as a **compiled JS string**. This is a real mismatch (it broke typechecking
earlier). Fix: align the app type to Velite's output (`body: string`) — ideally re-export
Velite's generated `Project` type from `.velite` as the single source of truth, keeping the
discriminated-union shape for future project `type`s. `queries.ts` continues to operate on
this corrected type.

---

## 4. Sub-project B — Home Exhibition Gallery (the hook)

Depends on A (preview primitive). Implements spec v2.1 §5.1 Moments 2, 3–N, N+1.

### 4.0 The room — spatial intent

Before the mechanics, the feeling. Build to this.

You step through a wide threshold into a long, low-lit hall. The walls are the colour of
the canvas at night — a near-black with a cold blue undertone (`--bg`, `#0D0F14`) — so the
room has no visible edges; it reads as depth rather than surface. There is no clutter, no
signage shouting for attention. The air is still. A scatter of pale motes drifts where your
attention goes (the boids cursor) — dust caught in a projector beam, settling when you hold
still.

You do not walk the hall. The hall moves for you. As you lean forward (scroll), the room
**glides past horizontally**, smooth and weighted, the way a heavy turntable comes to rest —
fast to start, slow to settle (`cubic-bezier(0.16, 1, 0.3, 1)`, on a `stiffness 60 / damping
20` spring). The threshold itself is generous: the first exhibit sits a full **128px** in from
the entrance, so you arrive into the room before the work begins, never crowded at the door.

The works hang in **vitrines** — tall glass cases, `70vh` from plinth to lintel, each
`clamp(320px, 40vw, 560px)` wide, spaced a calm **64px** apart so no two compete. The glass
is real: a faint frost (`backdrop-filter: blur(4px)`), a hairline of pale-blue light along its
edge (`rgba(184, 212, 232, 0.08)`). Behind each pane the work is **alive** — a slow loop, a
breathing tint — never a frozen photograph. A small brass-plate label rides the lower glass:
the title in Space Grotesk, a status light, the materials listed in mono type like a
specimen card.

Depth does the curation. Cases are set on a `1200px` perspective, so a vitrine **turns to face
you** as it reaches centre stage (`rotateY -8°→0°→8°`) and eases back as it leaves — like
plinths rotating on a slow carousel. The piece at centre is the one being shown: it lifts
fractionally and gains weight (`scale 1.02`, its shadow deepening), while its neighbours wait
in soft three-quarter view. Lean closer to a case (hover) and the glass **thins** — the frost
clears, the work brightens, the case rises 4px toward you, an invitation. Choose it, and you
cross from the gallery into the work itself (the live detail page).

The hall is not endless. After the last vitrine the room opens into quiet again, and a single
line of light invites you to see the full collection. You leave the way a good exhibition
leaves you: unhurried, and certain everything you saw was placed on purpose.

**The standard to hold:** restraint over spectacle, depth over decoration, weight in every
motion, and nothing on the wall that hasn't earned its light.

### 4.1 `useGallery`

`hooks/useGallery.ts` ('use client', no JSX). Owns scroll→track mapping and active-panel
tracking.

- Inputs: `panelCount`, a ref to the sticky section.
- `useScroll({ target, offset })` → progress 0→1 across the section's scroll allocation.
- Horizontal translate `x` via `useTransform(progress, [0,1], [startX, endX])`, wrapped in
  `useSpring({ stiffness: 60, damping: 20 })` per the motion playbook.
- `activeIndex` derived from progress (nearest panel to viewport centre).
- Returns `{ x, activeIndex, progress }` (all MotionValues except `panelCount`-derived
  scalars where a re-render is wanted for `activeIndex`).

**Pure core for testing:** extract `galleryLayout(panelCount, panelWidth, gap, firstInset)`
→ `{ trackWidth, startX, endX }` and `activeIndexAt(progress, panelCount)` as pure functions
(mirrors the `useBoids` pattern). Unit-test these; the hook wires them to Framer.

### 4.2 `GalleryTrack`

`components/gallery/GalleryTrack.tsx` (+ `.css.ts`, 'use client'). Receives
`projects: ProjectCardData[]` (or an empty array → placeholder panels).

- Outer: `position: sticky; height: 100vh; overflow: hidden`. Scroll allocation supplied by
  a spacer of height `100vh × (panelCount + 1)` wrapping the sticky element.
- Inner track: `display: flex; perspective: 1200px; transform: translateX(var(x))`.
- Maps projects → `ExhibitionPanel`; when empty, renders `PLACEHOLDER_COUNT` skeleton panels.
- Passes `activeIndex` down so panels know whether they are active.

### 4.3 `ExhibitionPanel`

`components/gallery/ExhibitionPanel.tsx` (+ `.css.ts`, 'use client').

- Size: `width: clamp(320px, 40vw, 560px); height: 70vh`. Gap 64px; first panel 128px left
  inset (via track padding).
- Visual: `ProjectPreview` fills the panel; a **vitrine glass** overlay (spec v2.1 §2.5) sits
  above it with the project title (Space Grotesk), status badge, and tags (JetBrains Mono).
- Motion: `rotateY` -8°→0° entering, 0°→8° leaving (standard); active panel `scale 1→1.02`
  with expanded shadow; hover lifts `translateY -4px` and thins the glass.
- The whole panel is a `next/link` to `/projects/[slug]`.

### 4.4 Home moments

- **Moment 2 — `CuratorLine`** (`components/home/CuratorLine.tsx`): one centred line from the
  lowest-`featuredOrder` featured project's `curatorNote` (fallback default). Scroll-triggered
  fade in/out. One viewport tall.
- **Moment N+1 — `Invitation`** (`components/home/Invitation.tsx`): centred "Browse the full
  collection" linking to `/projects`; hover underline `scaleX 0→1` (snappy).
- `app/page.tsx` (Server Component) fetches featured projects via `queries.ts` and composes:
  `Hero` → `CuratorLine` → `GalleryTrack` → `Invitation`. Data passed as props to the client
  gallery; the page itself stays a Server Component.

---

## 5. Sub-project C — Project Index (`/projects`)

Depends on A.

### 5.1 Data + composition

`app/projects/page.tsx` (Server Component): `getAllProjects()` + `getAllTags()`, passed to a
client `ProjectIndex` for interactive filtering. Replaces the current placeholder page.

### 5.2 `ProjectIndex` + `ProjectCard`

- `components/projects/ProjectIndex.tsx` ('use client'): holds `selectedTag` state, renders the
  filter bar (mono tags; active = `--accent` + underline) and the grid. Empty result → reuses
  the existing skeleton cards.
- `ProjectCard` (already exists) is extended to use `ProjectPreview` for its thumbnail instead
  of a flat colour panel; keeps title, description, status badge, tags. Load stagger 80ms,
  hover lift + border per the motion playbook.
- Grid: asymmetric — first card spans wider, rest alternate (CSS grid `grid-template` with a
  spanning first item; degrades to single column under 640px).

---

## 6. Sub-project D — Project Detail (`/projects/[slug]`)

Depends on A and the §3.1 type fix.

### 6.1 Route

`app/projects/[slug]/page.tsx` (Server Component): `generateStaticParams` from
`getAllProjects()`; `getProjectBySlug(slug)`; `notFound()` when missing. Per-slug `metadata`.

### 6.2 Sections (top→bottom)

1. **Header** — back link, title, one-liner, status + tags, external links (github/live/source).
   Children stagger (cinematic, 100ms).
2. **`CaseStudy`** — renders the MDX `body`. `65ch` max-width; scroll-triggered paragraph
   reveals (standard, 60ms stagger).
3. **`IframeWrapper`** — the live, interactive embed (see §6.3).
4. **Footer** — tech tags, dates, up to 2 related projects (shared-tag heuristic in `queries.ts`).

### 6.3 `IframeWrapper`

`components/project-detail/IframeWrapper.tsx` (+ `.css.ts`, 'use client'):

- Mounts the `<iframe>` only when the component mounts (detail page only) — never preloaded.
- Skeleton placeholder until the `load` event; iframe fades in (standard) on load.
- `sandbox="allow-scripts allow-same-origin allow-forms allow-popups"`; `loading="lazy"`.
- Height from `iframeHeight` (default 800). `iframeMobileNote` shown under 640px.
- On `error`/blocked framing, falls back to `ProjectPreview` + a "View live ↗" link.

### 6.4 MDX rendering

Velite emits `body` as compiled JS. A `useMDXComponent(code)` helper turns it into a
component using `react/jsx-runtime`:

```ts
// lib/content/useMDXComponent.ts
import * as runtime from 'react/jsx-runtime'
export function useMDXComponent(code: string): ComponentType {
  return new Function(code)({ ...runtime }).default
}
```

Wrapped by a small `MDXContent` client component that the server `CaseStudy` renders. Custom
MDX component mappings (headings, code) can be supplied here later.

---

## 7. Sub-project E — Page Transitions

`AnimatePresence` route transitions in App Router are constrained: **enter** animations are
reliable; **exit** animations during navigation are not (the new route renders before the old
unmounts). Approach:

- A client `PageTransition` wrapper keyed on `usePathname()`, placed around `{children}` in
  `app/layout.tsx`, doing enter animation (cinematic: `opacity 0→1`, `translateY 16px→0`).
- Exit-on-navigate is **out of scope** for v1 (best-effort only); revisit if it proves clean.
  This avoids fighting the App Router and keeps the spec honest about what ships.

---

## 8. Architecture & Conventions

Follows v2.1 §3.2 MVVM rules:

- Route files in `/app` are Server Components that call `queries.ts` and pass data as props.
- `/components` are presentational, prop-driven; `'use client'` only where interaction/motion
  requires it. They do not import from `/lib/content`.
- Hooks (`useGallery`) contain no JSX; pure cores extracted for tests.
- Styles live in `*.css.ts`; reuse `vars.ease.out` and the motion tokens.

### New files

```
components/projects/ProjectPreview.tsx + .css.ts
components/projects/previews/index.ts            # registry
components/projects/previews/DefaultPreview.tsx + .css.ts
components/projects/ProjectIndex.tsx + .css.ts
components/gallery/GalleryTrack.tsx + .css.ts
components/gallery/ExhibitionPanel.tsx + .css.ts
components/home/CuratorLine.tsx + .css.ts
components/home/Invitation.tsx + .css.ts
components/project-detail/IframeWrapper.tsx + .css.ts
components/project-detail/CaseStudy.tsx + .css.ts
components/layout/PageTransition.tsx
hooks/useGallery.ts
lib/content/useMDXComponent.ts
app/projects/[slug]/page.tsx
```

Edited: `lib/content/types.ts` (body type), `app/page.tsx`, `app/projects/page.tsx`,
`app/layout.tsx`, `components/projects/ProjectCard.tsx` (use `ProjectPreview`).

---

## 9. Testing

Mirrors the existing vitest setup (pure cores, no rendering of motion):

- `galleryLayout` and `activeIndexAt` — unit tests (boundaries, panel counts, empty case).
- `ProjectPreview` resolver — given (registry hit / heroImage / neither), asserts which
  branch is chosen (extract the choice into a pure `resolvePreview()` returning a tag).
- `getRelatedProjects` and existing queries — unit tests.
- `useMDXComponent` — smoke test compiling a trivial body string to a component.

Motion, scroll, and iframe behaviour are verified manually via `pnpm dev` / `pnpm build`.

---

## 10. Build Order

**A → B → (C, D) → E.** A + B deliver the hook (working gallery with previews) before the
supporting index/detail pages. Each sub-project ends green: `tsc`, `eslint`, `vitest`, and a
clean `next build`.

---

## 11. Open / Deferred

- Real project content (URLs, assets, bespoke previews) — user-owned, ongoing.
- Exit-on-navigate page transitions — deferred (§7).
- Live iframe previews *in the gallery* — explicitly rejected for v1 (cost/fragility); the
  preview model covers the "alive" feel instead.
- Related-projects heuristic may later become an explicit frontmatter field.
