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

### 3. `vision-tilt` — the lift (video, 4–6s) — FINAL PROMPTS

Both endpoint stills are approved and live in the repo: `public/lab/overture/vision-desk.webp` (first frame) and `public/lab/overture/vision-horizon.webp` (last frame). Convert to PNG before uploading if the tool rejects WebP.

**Tool requirement:** a model with **start-frame + end-frame conditioning** — Kling ("start & end frame"), Runway Gen-3+ ("first and last keyframe"), Higgsfield, Pika ("keyframes"). Sora/ChatGPT currently takes only a start image — usable as a fallback but the landing on our exact vista is then luck; prefer a dual-keyframe tool.

**Main deliverable (16:9, 4–6s, highest quality/framerate offered):**

> Camera begins pointed straight down at an old oak workbench in a Renaissance workshop — worn wood, black boots visible at the bottom of frame on terracotta tiles. The camera tilts slowly and smoothly upward, in one single continuous unbroken motion, rising past the edge of the workbench and through the open loggia, coming to rest gazing out over sunlit Tuscan fields with cypress trees toward the distant city of Florence and its Duomo on the hazy golden horizon at sunset. The motion of a man unhurriedly lifting his gaze from his work to the horizon: slow start, gentle constant speed, soft settle at the end. Continuous warm golden-hour light throughout, sun low on the left. No cuts, no camera shake, no zoom, no people, no birds, no text, nothing moving on the desk.

**Negative prompt (if the tool has a field for it):** cuts, scene change, camera shake, handheld wobble, zoom, dolly, people, hands, faces, birds, text, watermark, day-night change, rain.

**Settings guidance:** duration 5s; motion strength low-medium (the move is one axis — over-energetic settings invent extra movement); if the tool offers "camera control: tilt up", set it and lower the text emphasis on motion.

**Mobile variant (9:16, same prompt):** condition on centre-crops of the same two stills (crop to 9:16 around the boots/bench centre and the Duomo respectively — do the crops before upload so the model isn't choosing the framing). Only worth generating after the 16:9 is approved.

**Deliver:** the highest-quality MP4/MOV the tool exports *plus* the raw generation file. We may extract a frame sequence (~90 frames) for scroll-scrubbing, so bitrate and framerate matter more than file size — do not let the tool "optimise for sharing".

**Acceptance checks before spending on the mobile variant:**
1. First and last frames visually match our stills (minor drift acceptable — the page crossfades at both ends).
2. One continuous tilt — any hidden cut or direction reversal is a reject.
3. Light stays golden-hour throughout; no flicker or exposure pumping.
4. Nothing enters frame (hands, birds, furniture inventing itself).

## Other optional assets (later)

- **Ambient vista loop** (Stillmind-style, `full` tier only): 6–10s seamless loop conditioned on `vision-horizon` — *"The identical landscape, completely static camera, only barely-perceptible ambient motion: heat shimmer rising off the distant fields, a whisper of haze drifting across the horizon, faint warm light flicker on the city. Seamless loop, no camera movement whatsoever, no clouds racing, no birds."* Reject anything with visible camera drift — it sits under stationary UI.

## Art-direction guardrails

- One dominant study per page; margins breathe. Busier ≠ richer.
- No pristine white paper, no modern typography, no English words legible enough to read (mirror-script squiggle reads better than real text).
- Consistent light direction across all five (top-left) so they sit in one world.
- If the generator adds a page edge/shadow despite the prompt, crop past it before export.
