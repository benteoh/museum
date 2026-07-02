# Museum of Little Things — Visual Brief

**Version 1.0 | 2026-06-30**
**Status: Complete — all rows resolved. Unlocks 05 (Post-Processing) and 08 (R3F Gallery).**

---

## Aesthetic-to-Constraint Table

| Mood | Sensory target | Constraint |
|---|---|---|
| Quiet | Nothing competes for attention | Max transition duration: 900ms. No simultaneous animations. |
| Archival | Old, handled, real | Grain shader: Perlin noise at `amplitude 0.03` (starting value — lock with Leva during 03). No clean surfaces. |
| Heavy | Things have mass | Gallery spring: `stiffness 40–70, damping 18–24`. Tuned on device, not from memory. |
| Luxurious | Slow, deliberate, unhurried | Minimum transition duration: 500ms. No snappy anything except link underlines. |

---

## Material Targets

| Material | Roughness | Metalness | Transmission | Clearcoat | Notes |
|---|---|---|---|---|---|
| Aged paper | 0.75–0.85 | 0.0 | 0.0 | 0.0 | Warm grain texture required — no clean flat colour |
| Greek marble | 0.15–0.25 | 0.0 | 0.1–0.2 | 0.1 | Veining via roughness texture. Slight translucency. |
| Frosted glass | 0.08–0.12 | 0.0 | 0.85–0.95 | 0.0 | Gallery panel vitrines. Milky diffusion — content glows through but is softened. |

Starting values only. Lock with Leva in-browser during 03 (Physics Tuning).

---

## Camera Personality

*"Unhurried museum guide — glides between panels with quiet authority, no rush."*

Spring starting point: `stiffness: 40, damping: 20`. Tune to feel on M1 MacBook Air during 03.

---

## Glass Panel Decision

**Frosted** (`roughness: 0.08–0.12`). Slightly milky, like a real vitrine. The preview inside glows through rather than shows crisply. Consistent with the archival mood — nothing is too clean.

---

## HDRI Lighting Preset

**Studio** — neutral, even light. No strong directionality. Materials read clearly without drama. Clean professional gallery feel.

---

## Performance Floor

2020 MacBook Air M1, 60fps. Mid-range Android acceptable at 30fps with reduced post-processing. Devices with `hardwareConcurrency ≤ 2` or `deviceMemory < 4GB` receive the CSS gallery fallback (no R3F, no post-processing).

---

## Audio Decision

**Yes.** Ambient texture only — paper resonance and stone hum, barely audible (`volume: 0.15`). The kind of sound you notice when it stops. Starts on first scroll gesture. **Default off** — user must not hear it on load. Mute toggle in Nav, persisted to `localStorage('museum-muted')`.

No UI click sounds. No triggered events. One ambient loop only.

---

## R3F Gallery Open Questions (resolved)

| Question | Decision |
|---|---|
| Glass panel: frosted or near-crystal? | Frosted (`roughness: 0.08–0.12`) |
| HDRI preset? | Studio |
| ProjectPreview in gallery: RenderTexture or CanvasTexture? | RenderTexture (live React) — keeps bespoke animated previews working inside the scene |
| 30fps on mobile acceptable, or LOD fallback? | 30fps acceptable on mid-range Android — no LOD needed |

---

## Boids Open Questions (resolved)

| Question | Decision |
|---|---|
| What shape do boids form when idle? | Circular arrangement — all 120 boids drift into a ring centred on screen. No typographic mark. |
| Does `museum-of-little-things` preview use bespoke boids or heroImage? | Bespoke boids component (`MuseumOfLittleThingsPreview`) |

---

## Dependency Unblocks

With this brief complete, the following work is unblocked:

- **03** — Physics Tuning (grain amplitude and spring values to lock on device)
- **05** — Post-Processing Layer (`uIntensity: 0.03` for grain; VignettePass replaces CSS)
- **07** — Audio Design (yes, default off, ambient loop)
- **08** — R3F Gallery (frosted glass, studio HDRI, RenderTexture previews)
