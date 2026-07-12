# Overture Asset Prompt Pack
**2026-07-11 | For the Workbench/Overture scene — generate with Higgsfield / Midjourney / any image model**

## How these are used

- Drop each finished image at **`public/lab/overture/<seed>.png`** — the lab page auto-detects them (missing files fall back to procedural drawings).
- Generate **full-bleed rectangular scans** — paper texture edge to edge, NO torn silhouette, NO transparent background, NO drop shadow. The code clips the torn edge procedurally (`TornSheet`), so generators' unreliable alpha handling never matters.
- **Landscape, ~16:10, ≥2048×1280** (the overture sheets are near-viewport-sized). WebP/PNG.
- The scene multiplies animated ink on top — leave some calmer regions; don't fill every inch.

## Shared style block (append to every prompt)

> Flat overhead scan of an aged Renaissance manuscript page, filling the entire frame edge to edge. Warm parchment tone (#E7DCC1 to #F3ECD8 range), iron-gall brown-black ink (#382C19), occasional sanguine red chalk accents (#8C4F32). Fine paper fibre texture, subtle foxing spots, faint stains, slight cockling shadows. Da Vinci codex style: dense hatching, construction lines, tiny mirror-script marginalia in a humanist hand. Soft even archival lighting, no glare, no vignette, no border, no torn edges visible, not a photo of a page on a table — the page IS the frame. Muted, scholarly, precise. --ar 16:10

## The five manuscripts

| # | File | Subject prompt (prepend to style block) |
|---|---|---|
| 1 | `codex-flight.png` | Study of a bird's wing in three positions of flight, overlapping anatomical wing drawings with radiating feather construction lines, small diagrams of air flow beneath, dense marginalia notes |
| 2 | `codex-turin.png` | Study of forces: inclined plane with a sphere, force arrows, pulley diagrams, geometric weight distribution sketches, numbered annotations and calculation scribbles |
| 3 | `codex-windsor.png` | Proportion study: circle inscribed in a square with radiating measurement lines, partial human figure studies in the corners, compass construction marks, ratio annotations |
| 4 | `codex-leicester.png` | Mechanical study: large toothed gear meshing with a smaller pinion, exploded axle detail, cross-section hatching, tiny assembly notes with leader lines |
| 5 | `codex-atlanticus.png` | Page dominated by dense mirror-writing text in brown ink, ruled guide lines, two small thumbnail sketches embedded in the text block (a water vortex, a face profile), ink blots |

## The Vision sequence (see the "Vision Gallery" revision in `2026-07-02-living-codex-design.md`)

Generate in this order — stills first, video last (it's conditioned on them).

### 1. `vision-desk.png` — looking down (16:9, ≥2560×1440)

> First-person POV looking straight down at a Renaissance master's workbench from standing height, late golden-hour light. His own black leather boots visible at the bottom of frame, polished brass buckles catching a low shaft of setting sun. Worn oak workbench surface, empty but well used — ink stains, compass scratches, faint tool marks. Weathered terracotta floor tiles with age cracks. Warm amber-and-umber palette, long soft shadows, cinematic but quiet. No hands, no tools on the bench, no text, no paper on the desk (the papers have just been swept away). Reserve a calm, uncluttered zone across the upper third of the bench for typography overlay. Photorealistic, shallow ambient haze. --ar 16:9

### 2. `vision-horizon.png` — looking up (16:9, ≥2560×1440)

> View from the open loggia of a hillside home outside Florence at golden hour, looking out over Tuscan fields — cypress rows, olive terraces, a dirt road — toward the city in the hazy distance, the Duomo's silhouette unmistakable on the skyline. Setting sun low to the left (consistent with a warm light shaft from the same sun as the desk shot). Warm gold-to-dusty-rose sky, atmospheric perspective, painterly-photoreal. Large areas of calm sky and field in the mid-frame where floating UI elements will sit — keep the horizon band detailed but the sky uncluttered. No people, no birds, no text. --ar 16:9
>
> Also generate a 9:16 crop-safe variant for mobile.

### 3. `vision-tilt` — the lift (video, 4–6s)

Only after both stills are approved. Use a video model with **first-frame / last-frame conditioning** (Kling, Runway, Higgsfield): first frame = `vision-desk.png`, last frame = `vision-horizon.png`.

> Slow, deliberate camera tilt up from looking down at the workbench and boots, rising through the loggia opening to settle on the distant view of Florence at sunset. Single continuous motion, no cuts, constant gentle speed with a soft ease at both ends — the movement of a man lifting his gaze, unhurried. Lighting continuous golden hour throughout. No people entering frame, nothing on the desk.

Deliver: MP4 (H.264) + the raw generation; we may extract a frame sequence for scroll-scrubbing, so highest available quality/framerate.

## Other optional assets (later)

- **Ambient vista loop** (Stillmind-style): 6–10s seamless loop of the horizon still barely alive — heat shimmer over fields, drifting haze — candidate `full`-tier backdrop under the glass frames.

## Art-direction guardrails

- One dominant study per page; margins breathe. Busier ≠ richer.
- No pristine white paper, no modern typography, no English words legible enough to read (mirror-script squiggle reads better than real text).
- Consistent light direction across all five (top-left) so they sit in one world.
- If the generator adds a page edge/shadow despite the prompt, crop past it before export.
