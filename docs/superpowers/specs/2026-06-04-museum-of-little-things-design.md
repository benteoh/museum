# Museum of Little Things — Design Spec
**Version 2.1 | Validated 2026-06-04**

---

## 1. Overview

**Museum of Little Things** is a personal portfolio and creative statement for Ben, a software engineer. It is not a CV. It is a curated exhibition of work — built with the same craft it showcases.

The site is dark, technical, and motion-first. Every animation has a reason. The work speaks for itself. The site is a proof of engineering taste as much as engineering ability.

The experience is a **tour, not a landing page**. Visitors are guided through a spatial gallery of work. They drift, they discover, they enter. Nothing shouts. Everything is considered.

**Primary audience:** Hiring managers, collaborators, and curious engineers.
**Primary goal:** Creative statement. Hiring replacement is a side effect of doing it well.

---

## 2. Design System

### 2.1 Colour Tokens

```css
--bg:             #0D0F14;  /* Canvas. Near-black with cold blue undertone */
--surface:        #151820;  /* Cards, panels, elevated surfaces */
--border:         #1E2330;  /* Subtle separation */
--accent:         #B8D4E8;  /* Pale sky blue. Primary highlight */
--accent-dim:     #6A9AB8;  /* Secondary states, hover */
--text-primary:   #E8EDF2;  /* Off-white, cool tint */
--text-secondary: #6B7280;  /* Metadata, labels, supporting copy */
--mono-tag:       #3D5A73;  /* Tag backgrounds */
--status-live:    #4ADE80;  /* Live / active / positive */
--status-wip:     #F59E0B;  /* In progress / draft */
```

### 2.2 Typography

| Role | Typeface | Usage |
|---|---|---|
| Display | Space Grotesk | Hero text, project titles, headings |
| Body | Instrument Sans | Body copy, UI labels, navigation |
| Mono | JetBrains Mono | Tags, timestamps, technical metadata |

All three loaded via `next/font` with `display: swap`. Subset to latin only.

### 2.3 Motion Tokens

```ts
// lib/motion.ts
export const tokens = {
  snappy:    { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
  standard:  { duration: 0.5,  ease: [0.16, 1, 0.3, 1] },
  cinematic: { duration: 0.9,  ease: [0.16, 1, 0.3, 1] },
  drift:     { duration: 2.0,  ease: [0.16, 1, 0.3, 1] },
}
```

Easing: `cubic-bezier(0.16, 1, 0.3, 1)` — expo-out. Fast start, graceful settle. Applied universally.

### 2.4 Spacing

Base unit: **4px**. All spacing is a multiple of 4.

```
4   — tight internal component spacing
8   — component padding
12  — dense layout gaps
16  — standard gaps
24  — comfortable separation
32  — section sub-spacing
48  — section breathing room
64  — section gaps
96  — large section padding
128 — hero and full-bleed moments
```

### 2.5 Atmosphere & Depth

#### Vignette
```css
background: radial-gradient(ellipse at center, transparent 30%, var(--bg) 100%);
opacity: 0.65;
```

#### Title Legibility Shadow
```css
text-shadow: 0 0 40px rgba(13, 15, 20, 0.4);
```

#### Card Elevation Shadow
```css
/* Resting */
box-shadow: 0 8px 24px rgba(13, 15, 20, 0.6);
/* Hover */
box-shadow: 0 12px 32px rgba(13, 15, 20, 0.8);
```

#### Exhibition Panel Glass (Vitrine)
```css
/* Default */
backdrop-filter: blur(4px);
background: rgba(13, 15, 20, 0.15);
border: 1px solid rgba(184, 212, 232, 0.08);
/* Hover — glass thins */
background: rgba(13, 15, 20, 0.06);
border: 1px solid rgba(184, 212, 232, 0.14);
```

### 2.6 Custom Cursor — Boids Physics

Full-viewport canvas overlay. `pointer-events: none`. rAF loop capped at 60fps. Pauses on tab background.

**Particle properties:** ~40 particles, 3px radius, `#B8D4E8` at 20% opacity idle / 60% when scattering.

**Boids rules:** cohesion, separation, alignment (standard three).

**Cursor disruption:** 80px radius, particles flee with moderate force, reform over 2000ms (drift timing).

---

## 3. Architecture

### 3.1 Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | Per-route iframe isolation, SSR, Vercel fit |
| Styling | Vanilla Extract | Zero-runtime, TypeScript-first, hard style/logic separation |
| Animation | Framer Motion | Page transitions, scroll triggers, gallery physics |
| Canvas / Physics | Custom Canvas API + boids | Cursor simulation |
| Content | Velite + MDX | Build-time transform, typed content, commit-based publishing |
| Hosting | Vercel (free tier) | Zero-config Next.js deploy |
| State | Zustand | Cursor position, active panel, UI state |
| Package Manager | pnpm | Faster installs, strict dependency resolution |

> Sanity was replaced with Velite + MDX. Content lives in the repo. Publishing = `git commit`. No external CMS service or API keys needed.

> React Three Fiber is reserved for the post-MVP full 3D gallery scene. MVP uses CSS 3D perspective + Framer Motion.

### 3.2 MVVM-Equivalent Pattern

```
/lib/content   → Model      Content queries, TypeScript types, Velite re-exports
/hooks         → ViewModel  useProjects, useFeaturedProjects, useBoids, useCursor, useGallery
/components    → View       Dumb, presentational, consume hooks and props only
/app           → Routes     Compose View + ViewModel. Server Components fetch, Client Components interact
```

**Strict rules:**
- Components never import from `/lib` directly
- Hooks never contain JSX
- Styles live exclusively in `*.css.ts` files
- Server Components fetch data; Client Components handle interactivity only

### 3.3 Folder Structure

```
museum-of-little-things/
├── content/
│   └── projects/
│       └── [slug].mdx              # One MDX file per project
├── public/
│   └── projects/
│       └── [slug]/
│           └── hero.jpg            # Images per project
├── app/
│   ├── layout.tsx                  # Nav, cursor canvas, AnimatePresence wrapper
│   ├── page.tsx                    # Home — tour experience
│   ├── projects/
│   │   ├── page.tsx                # Project index — full catalogue
│   │   └── [slug]/page.tsx         # Project detail — iframe + case study
│   ├── about/page.tsx              # Placeholder
│   └── thoughts/page.tsx           # Placeholder
├── components/
│   ├── cursor/
│   │   ├── BoidsCanvas.tsx
│   │   └── BoidsCanvas.css.ts
│   ├── nav/
│   │   ├── Nav.tsx
│   │   ├── Nav.css.ts
│   │   ├── MobileOverlay.tsx
│   │   └── MobileOverlay.css.ts
│   ├── hero/
│   │   ├── Hero.tsx
│   │   └── Hero.css.ts
│   ├── gallery/
│   │   ├── GalleryTrack.tsx
│   │   ├── GalleryTrack.css.ts
│   │   ├── ExhibitionPanel.tsx
│   │   └── ExhibitionPanel.css.ts
│   ├── project-card/
│   │   ├── ProjectCard.tsx
│   │   └── ProjectCard.css.ts
│   ├── iframe-wrapper/
│   │   ├── IframeWrapper.tsx
│   │   └── IframeWrapper.css.ts
│   ├── case-study/
│   │   ├── CaseStudy.tsx
│   │   └── CaseStudy.css.ts
│   └── placeholders/
│       ├── ThoughtsPlaceholder.tsx
│       └── AboutPlaceholder.tsx
├── hooks/
│   ├── useBoids.ts
│   ├── useCursor.ts
│   ├── useProjects.ts
│   ├── useFeaturedProjects.ts
│   └── useGallery.ts
├── lib/
│   ├── content/
│   │   ├── index.ts                # Re-exports Velite virtual module
│   │   ├── queries.ts              # getFeaturedProjects, getProjectBySlug, getAllProjects, etc.
│   │   └── types.ts                # Project discriminated union
│   └── motion.ts
├── styles/
│   ├── tokens.css.ts
│   ├── global.css.ts
│   └── typography.css.ts
└── velite.config.ts                # Velite schema + collection definitions
```

---

## 4. Content Layer

### 4.1 MDX File Format

Each project is a single `.mdx` file. Frontmatter holds structured fields; the MDX body is the case study narrative.

```mdx
---
type: "iframe"
title: "Project Name"
slug: "project-name"
description: "One-liner for cards and meta"
heroImage: "/projects/project-name/hero.jpg"
heroColour: "#1a1f2e"
tags: ["TypeScript", "Next.js"]
links:
  github: "https://github.com/..."
  live: "https://..."
status: "live"
featured: true
featuredOrder: 1
publishedAt: "2024-03-01"
iframeUrl: "https://..."
iframeHeight: 800
iframeMobileNote: "Best viewed on desktop"
---

Case study narrative here as MDX.
```

### 4.2 TypeScript Types

The `type` field is a discriminated union. Only `iframe` is supported at MVP.

```ts
// lib/content/types.ts

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
  body: string  // compiled MDX
}

type IframeProject = BaseProject & {
  type: 'iframe'
  iframeUrl: string
  iframeHeight?: number
  iframeMobileNote?: string
}

// Future: GithubProject, CaseStudyProject, VideoProject...
export type Project = IframeProject
```

### 4.3 Content Queries

```ts
// lib/content/queries.ts
export const getAllProjects = (): Project[]
export const getFeaturedProjects = (): Project[]
export const getProjectBySlug = (slug: string): Project | undefined
export const getAllTags = (): string[]
```

### 4.4 Velite Config

`velite.config.ts` at the project root defines the `projects` collection, validates frontmatter types, and runs MDX compilation. Outputs to `.velite/` (gitignored). `lib/content/index.ts` re-exports from `.velite/`.

### 4.5 Data Flow

```
content/projects/*.mdx
  → Velite (build-time transform)
  → .velite/ (generated, gitignored)
  → lib/content/index.ts (re-export)
  → lib/content/queries.ts (filter/sort)
  → Server Components (direct call at route level)
  → Client Components (receive as props)
```

Server Components call `queries.ts` directly. Hooks (`useProjects`, `useFeaturedProjects`) are for Client Components that need reactive state (filtering, active panel).

---

## 5. Pages

### 5.1 Home — Tour Experience (`/`)

Four sequential moments:

**Moment 1 — Arrival**
- Full viewport, boids canvas background, vignette overlay
- Title: "Museum of Little Things", Space Grotesk, `clamp(3rem, 8vw, 7rem)`, weight 300, bottom-left (`96px` from left and bottom)
- Scroll indicator: 1px vertical line, 48px tall, bottom-centre, pulses with drift timing

Load sequence:
1. `0ms` — boids canvas fades in (drift 2000ms)
2. `1500ms` — title drifts up and in (cinematic 900ms, `translateY 12px→0`)
3. `2600ms` — scroll indicator appears (standard 500ms)

On scroll: boids fade out over first 40% of scroll (drift). Title fades + scales to 0.97.

**Moment 2 — Curator Steps In**
- One viewport height of scroll
- Single centred line of text: sourced from featured project's `curatorNote` field or a default
- Instrument Sans, `--text-secondary`, `1.125rem`, `letter-spacing: 0.04em`
- Scroll-triggered fade in/out

**Moment 3–N — Exhibition Gallery**
- `position: sticky`, `height: 100vh`
- Horizontal track translates via `useScroll` + `useTransform` (spring: stiffness 60, damping 20)
- Scroll allocation: `100vh × (panelCount + 1)`
- `perspective: 1200px` on track
- Each panel: `clamp(320px, 40vw, 560px)` wide, `70vh` tall, vitrine glass overlay
- Panel rotateY: -8deg→0deg entering, 0deg→8deg leaving (standard 500ms)
- Active panel: scale 1.02, shadow expands
- Panel gaps: 64px. First panel: 128px left inset.

**Moment N+1 — Invitation**
- Full width, 80vh
- "Browse the full collection" centred, Instrument Sans, `--text-secondary`
- Hover underline: scaleX 0→1 (snappy 150ms)
- Links to `/projects`

### 5.2 Project Index (`/projects`)

- Asymmetric masonry grid (first item full/double width, rest alternate)
- Filter bar: tag text in JetBrains Mono, active = `--accent` + underline
- Cards stagger in: standard 500ms, 80ms staggerChildren
- Card: thumbnail (55% height), title, 2-line description, status badge, tags

### 5.3 Project Detail (`/projects/[slug]`)

Top to bottom:
1. **Header** — back link, title, one-liner, status + tags, links
2. **Case Study** — MDX body, `65ch` max-width, scroll-triggered paragraph reveals (standard, 60ms stagger)
3. **Iframe Section** — full content width, skeleton loader, fade in on `load` event, sandboxed
4. **Footer** — tech stack tags, dates, 2 related projects

Iframe sandbox: `allow-scripts allow-same-origin allow-forms allow-popups`
Iframe loads only when detail page mounts — never preloaded.

### 5.4 About (`/about`)
Placeholder: centred *"Something is being written."* with slow blink cursor (drift timing).

### 5.5 Thoughts (`/thoughts`)
Placeholder: same treatment as About.

---

## 6. Navigation

**Desktop:**
- `position: fixed`, `z-index: 100`
- Transparent → `--surface` 95% opacity on scroll (standard 500ms)
- Left: "Museum of Little Things", Space Grotesk, `0.875rem`, weight 500
- Right: Projects · About · Thoughts, Instrument Sans, `--text-secondary`
- Link hover: colour snappy + underline scaleX 0→1 from left (snappy)
- Appears on load: cinematic 900ms, 200ms delay

**Mobile:**
- Minimal hamburger icon, top-right
- Full-screen overlay, `--bg` background, cinematic 900ms
- Links: Space Grotesk, `2.5rem`, stagger 120ms
- Close: tap outside or X icon

---

## 7. Motion Playbook

### Global
| Element | Token | Properties |
|---|---|---|
| Page enter | cinematic | `opacity 0→1`, `translateY 16px→0` |
| Page exit | standard | `opacity 1→0` |
| Scroll-triggered reveals | standard | `opacity 0→1`, `translateY 24px→0`, threshold 20% |

### Navigation
| Element | Token | Properties |
|---|---|---|
| Nav initial appearance | cinematic + 200ms delay | `opacity 0→1` |
| Nav background on scroll | standard | `--surface` opacity 0→95% |
| Link hover colour | snappy | `--text-secondary → --text-primary` |
| Link hover underline | snappy | `scaleX 0→1` from left |
| Mobile overlay entrance | cinematic | full-screen fade |
| Mobile links stagger | cinematic | 120ms apart, `opacity 0→1`, `translateY 20px→0` |

### Boids Canvas
| Element | Token | Properties |
|---|---|---|
| Canvas initial fade in | drift | `opacity 0→1` |
| Title appearance | cinematic + 1500ms delay | `opacity 0→1`, `translateY 12px→0` |
| Scroll indicator appearance | standard + 2600ms delay | `opacity 0→1` |
| Canvas fade on scroll | drift | `opacity 1→0` over first 40% scroll |

### Gallery Track
| Element | Token | Properties |
|---|---|---|
| Horizontal translate | spring stiffness 60, damping 20 | follows scroll progress |
| Panel rotateY entering | standard | `-8deg → 0deg` |
| Panel rotateY leaving | standard | `0deg → 8deg` |
| Active panel scale | standard | `1 → 1.02` |

### Exhibition Panels
| Element | Token | Properties |
|---|---|---|
| Hover lift | standard | `translateY 0 → -4px` |
| Hover glass thin | standard | overlay opacity dims |
| Hover shadow expand | standard | blur 24px → 32px |
| Click zoom | cinematic | `scale 1 → 1.04`, glass `opacity → 0` |

### Project Cards (Index)
| Element | Token | Properties |
|---|---|---|
| Load stagger | standard | 80ms between children, `opacity 0→1`, `translateY 24px→0` |
| Hover lift | standard | `translateY 0 → -4px` |
| Hover border | standard | `--border → --accent-dim` |
| Hover shadow | standard | blur 24px → 32px |

### Project Detail Page
| Element | Token | Properties |
|---|---|---|
| Header children stagger | cinematic | 100ms apart, `opacity 0→1` |
| Tag appearance | snappy | stagger, `opacity 0→1`, `translateX -8px→0` |
| Case study paragraphs | standard | scroll-triggered, 60ms stagger |
| Iframe fade in on load | standard | `opacity 0→1` |

### Cursor Boids
| Property | Value |
|---|---|
| Particle count | ~40 |
| Particle size | 3px radius |
| Idle opacity | 20% |
| Scatter opacity | 60% |
| Disruption radius | 80px |
| Scatter force | Moderate |
| Reform timing | drift (2000ms) |

---

## 8. Build Configuration

### 8.1 Key Config Files

- **`velite.config.ts`** — defines `projects` collection, frontmatter schema validation, MDX compilation pipeline
- **`next.config.ts`** — Vanilla Extract plugin wraps outermost; Velite plugin inside. Order matters.
- **`tsconfig.json`** — path alias `@content` → `.velite/` for clean imports

### 8.2 Next.js + Vanilla Extract Wiring

```ts
// next.config.ts
import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin'
import { build } from 'velite'

const withVanillaExtract = createVanillaExtractPlugin()

export default withVanillaExtract({
  // Velite integration via custom webpack config
  webpack(config) {
    config.plugins.push(new VeliteWebpackPlugin())
    return config
  }
})
```

### 8.3 Gitignore Additions

```
.velite/
```

---

## 9. Performance & Constraints

- **Vercel free tier:** Sufficient for personal portfolio scale
- **No external services:** No API keys, no environment variables needed for content
- **Iframes load on demand** — only when detail page mounts
- **Gallery thumbnails:** Static images in `/public`, served by Next.js Image
- **Boids canvas:** rAF loop, 60fps cap, pauses on tab background
- **Fonts:** `next/font`, latin subset, zero layout shift
- **No analytics at launch**

---

## 10. Three-Day Build Plan

### Day 1 — Foundation, Design System, Hero
- Scaffold Next.js 14 App Router with pnpm
- Configure Vanilla Extract + Velite + next.config.ts wiring
- `next/font` — Space Grotesk, Instrument Sans, JetBrains Mono
- `styles/tokens.css.ts` — full design system
- Global reset and base styles
- Nav component — desktop and mobile, all states
- `useBoids.ts` — pure physics hook
- `BoidsCanvas.tsx` — canvas renderer
- Hero section — title, vignette, scroll indicator
- Seed 3–4 MDX project files with real images

### Day 2 — Gallery & Projects
- `useGallery.ts` — scroll progress, active panel tracking
- `GalleryTrack.tsx` + `ExhibitionPanel.tsx`
- Home page Moment 2 and Moment N+1
- Project index page + `ProjectCard.tsx` + filter bar
- Project detail page + `IframeWrapper.tsx` + `CaseStudy.tsx`
- Page transitions via `AnimatePresence` in `layout.tsx`

### Day 3 — Polish, Mobile, Deploy
- About + Thoughts placeholder pages
- Full mobile responsiveness pass
- Animation QA pass
- Lighthouse audit
- Boids profiling (60fps, memory stable)
- Vercel deploy
- Ship

---

## 11. Post-MVP Enhancements

| Enhancement | Notes |
|---|---|
| Full R3F 3D gallery | Replace CSS 3D with WebGL scene |
| Live iframe previews behind glass | Blurred live iframes replace static thumbnails |
| Boids shape formation | Flock holds a shape when undisturbed |
| Thoughts page | Reading list Chrome extension integration |
| About page | Full content pass |
| Plausible analytics | Privacy-respecting, free tier |
| OpenGraph images | Per-project via Vercel OG |
| New project types | `github`, `case-study`, `video` variants in the discriminated union |

---

## 12. Open Questions (Deferred)

- About page: professional only vs personal content
- Domain name
- Nav brand: "Museum of Little Things" vs initials
- Boids shape: what do they form?
- Curator sentence: hardcoded default vs sourced from a featured project field
