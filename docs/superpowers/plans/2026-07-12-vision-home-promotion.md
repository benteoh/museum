# Vision Home Promotion (Stage 1 — no video) — Implementation Plan
**2026-07-12 | Self-contained prompt for the implementing agent.**

**Goal:** the home page becomes the Vision journey — Overture (parting manuscripts) → the Desk reveal (generated still) → the Vision gallery (glass frames over the Florence vista). The old home (Hero / CuratorLine / GalleryTrack / ExhibitionPanel) is deleted. **No video in this stage** — the tilt-video "Lift" beat is stage 2; this plan leaves a clearly-marked slot for it.

## Read before writing any code

1. `AGENTS.md` — this Next.js version differs from training data; read `node_modules/next/dist/docs/` for anything Next-specific.
2. `docs/superpowers/specs/2026-07-02-living-codex-design.md` — especially the **"2026-07-11 revision — The Vision Gallery"** section (narrative, tier behaviour, open questions 3–5 which this plan resolves) and **"The craft bar"** (acceptance criteria, not aspirations).
3. `docs/superpowers/specs/visual-brief.md` — palette tokens, type system, motion constraints.
4. The lab prototypes this plan promotes: `components/lab/DeskScene.tsx`, `components/lab/VisionScene.tsx`, routes `app/lab/workbench/` and `app/lab/vision/`.

## Constraints (non-negotiable)

- Springs stay in the locked range: stiffness 40–70, damping 18–24 (micro-interactions like cursor tilt may be snappier; scene motion may not).
- All animation consumers read `useDeviceTier()` / `lib/deviceTier.ts` — `full` animates, `reduced` keeps scroll-linked mapping but drops autonomous motion, `static` renders the settled end state. No component invents its own capability sniff.
- All colour through `vars.color.*` (`styles/tokens.css.ts`). Exception (documented in-code): canvas `fillStyle`/rgb strings that mirror a token, and the one new light-on-dark type case below.
- Every scroll-linked scene must be legible and unbroken when jump-scrolled to any position (craft bar #4). Test this explicitly.
- Generated images are the material; code animates over them. Full-bleed images, `TornSheet` clips the tears.
- `pnpm test` and `pnpm build` must pass at every commit. Commit per work package, not one mega-commit.

## Current state (all on master)

- `/lab/workbench` — `DeskScene`: five manuscript scans (`public/lab/overture/codex-*.webp`) part on scroll over the parchment ground, revealing the title; staggered spring entrance under a zoom breath; sprung scroll at `full` tier.
- `/lab/vision` — `VisionScene`: liquid-glass frames over `public/lab/overture/vision-horizon.webp`; per-slug float personality; cursor tilt; movement-fed water-ripple (`feDisplacementMap` energy model); chromatic edge split. Frames are **not links yet**. Uses the production `useGallery` hook for the rail.
- `public/lab/overture/vision-desk.webp` — bird's-eye workbench still, **not consumed by anything yet**.
- Old home: `app/page.tsx` = Hero + CuratorLine + GalleryTrack (ExhibitionPanel) + Invitation.

## Work package A — the Desk reveal (in the lab first)

Resolves spec open questions 3 & 4: the papers part to reveal **the desk still directly**, and the title lives **on the desk**.

1. In `DeskScene`, add a full-viewport desk-still layer (`vision-desk.webp`, `object-fit: cover`) beneath the manuscripts. The parchment body ground crossfades to the still over the *last* portion of the parting (roughly overture progress 0.55 → 0.9) so the reveal reads as the papers clearing a real desk, not a background swap.
2. The title over the still cannot be iron-gall dark — the still is dark wood. Composite the title in light type (`vars.color.duskText`) over the bench's calm upper third. This is the palette hinge: paper world → dusk-warm desk. The title should be *absent* until the reveal is underway (it is "on the desk", physically occluded by paper, exactly as before — only its colour treatment changes with the crossfade; the simplest honest implementation is two title layers cross-fading with the ground, dark-on-parchment → light-on-wood).
3. The curator hand-note moves off the desk scene entirely — it belongs to the vista (see B3).
4. After the parting completes there is one settled rest viewport (title on desk, stillness), then the scene unpins and the Vision section scrolls in. Insert an explicit code comment at this seam: `{/* STAGE 2: the Lift (tilt video) slots here — see 2026-07-02-living-codex-design.md, Vision Gallery revision */}`.
5. The desk still must be added to the asset detection map and preloaded (see B5).
6. Iterate on `/lab/workbench` until the reveal reads well at 100% zoom, then proceed — package B promotes exactly this.

## Work package B — promotion to home

1. **Graduate the components.** `components/lab/DeskScene*` → `components/overture/`; `components/lab/VisionScene*` → `components/vision/`; `InkSpots` and `StudyDrawing` follow `DeskScene`. Remove the lab hint labels (`overture · full`, `vision · full`) and all "LAB SKETCH — throwaway" header comments; these are production components now — comment them accordingly. Assets move `public/lab/overture/` → `public/overture/`.
2. **Rebuild `app/page.tsx`**: `DeskScene` (retitled `OvertureScene` if you prefer — pick one name and rename consistently) → `VisionScene` → `Invitation` (keep the existing Invitation component as the coda for now; restyling it is out of scope). Home metadata unchanged.
3. **Curator line**: render it inside `VisionScene` as the hand-note over the vista (Caveat, warm light tone, bottom-left, dims when a frame is focal/hovered). Source it exactly as the old home did: `getCuratorNote(projects)`.
4. **Glass frames become real links.** Each frame wraps its pane in `next/link` to `/projects/<slug>`; keyboard-focusable with a visible `:focus-visible` treatment (light outer glow ring on the glass, not a default outline); carry over `viewTransitionName: panel-<slug>` from the old `ExhibitionPanel` so the existing detail-page view transition keeps working. Hover/tap effects must not break activation.
5. **Performance/LCP**: preload the vista, the desk still, and the top two manuscript scans (`<link rel="preload" as="image">` via Next metadata or explicit tags); remaining scans load lazily. Verify with a build that home's first-viewport images aren't waterfalled behind JS.
6. **Real projects only**: home shows `getFeaturedProjects` (falling back to all projects if none featured) — the `STUDIES` padding objects are lab-only and must not ship. With only 2 real projects the rail will be sparse; that's correct, don't pad production with fakes.
7. **Mobile adaptation** (spec: adapted, not reduced): below the `640px` breakpoint the vision rail becomes a vertical stack (native scroll, no `useGallery` pinning), tap triggers the ripple+bobble, tilt disabled. The overture parting works as-is on touch (scroll-driven); verify sheet sizes on a narrow viewport (the `min(Xvw, Yvh)` sizing should hold — check).
8. **Delete the old world**: `components/hero/`, `components/home/CuratorLine*`, `components/gallery/` (GalleryTrack + ExhibitionPanel + css), `components/paper/scatter.ts`, `hooks/useHeroScroll.ts` if now unreferenced, their tests, and the `/lab` routes. `grep` for dangling imports (`galleryMath`/`useGallery` stays — VisionScene uses it). Keep `TornSheet`/`tornEdge`/`InkSpots` (used) and the boids system (untouched).
9. **Tier QA**: with DevTools emulation verify all three tiers — `reduced` (emulate prefers-reduced-motion): parting still scrubs with scroll, no entrance choreography, no bobble/ripple; `static`: settled desk + static frame grid renders with no animation. Jump-scroll the full page to a dozen random positions — nothing may be broken or illegible.
10. **Throttle trace** (closes taskmaster task 12): DevTools performance trace of the heaviest interaction (scroll through the parting + ripple a pane) at 4× CPU throttle. Record findings in the PR description; file regressions as taskmaster tasks rather than silently accepting them.
11. **Taskmaster bookkeeping**: mark tasks 1–6, 8, 9 done in `.taskmaster/tasks/tasks.json`; retarget/annotate 10–12 per what this plan absorbed (10/11's intent shipped inside the scenes; 12 closes with the trace).
12. **Precision spec**: append a short "Shipped values — Stage 1" subsection to the Vision Gallery section of the design doc recording the final tuned constants (parting ranges, spring values, float personality ranges, ripple energy constants, crossfade window) so stage 2 starts from ground truth.

## Out of scope (do not build)

- The tilt video / Lift beat and any video machinery (stage 2).
- WebGL / physical paper (parked — see design doc).
- Detail pages, index page, boids re-skin, preview ink re-draw.
- Replacing the two duplicate codex scans (leicester/atlanticus are intentional dupes awaiting regeneration).

## Definition of done

`pnpm test` and `pnpm build` green; home renders the full journey with real content and working links; all three tiers verified; jump-scroll safe; trace recorded; old components deleted with no dangling references; `/lab` gone; one PR against master titled "Living Codex: Vision home (stage 1)" describing the trace results and any deviations from this plan.
