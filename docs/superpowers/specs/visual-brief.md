# Museum of Little Things — Visual Brief
**Version 2.0 | 2026-07-02**
**Status: Supersedes v1 (dark night-gallery). Art direction: The Living Codex — da Vinci manuscript + Greek marble + physics.**

## Aesthetic-to-Constraint Table

| Mood | Sensory target | Constraint |
|---|---|---|
| Quiet | Nothing competes for attention | Max transition duration: 900ms. No simultaneous animations. |
| Archival | Old, handled, real | Paper noise: SVG fractalNoise `baseFrequency 0.8, numOctaves 2`, alpha ≤ 0.06. No clean flat surfaces. |
| Heavy | Things have mass | Gallery spring: `stiffness 40–70, damping 18–24`. Sheets settle, never snap. |
| Luxurious | Slow, deliberate, unhurried | Minimum transition duration: 500ms. Only link underlines may be snappy. |
| Drawn | Everything begins as ink | Line-work (previews, annotations) animates stroke-first; fills come second. |

## Dual-World Palette

**Paper world (home, index — bright atelier):**

| Token | Hex | Role |
|---|---|---|
| bg | `#E7DCC1` | Parchment ground |
| surface | `#F3ECD8` | Fresh sheet |
| border | `#C7B693` | Sheet edges, rules |
| inkFaint | `#9C8C6B` | Ruled lines, hairlines |
| textPrimary | `#382C19` | Iron-gall ink |
| textSecondary | `#6B5C42` | Faded ink |
| accent | `#8C4F32` | Red chalk (sanguine) — highlights, active states |
| accentDim | `#A97B5D` | Red chalk, faded |
| monoTag | `#7A5F38` | Annotations, tags |
| statusLive | `#5F7E52` | Verdigris |
| statusWip | `#B08A2E` | Ochre |
| sheetShadow | `rgba(56, 44, 25, 0.18)` | Sheet drop shadows |

**Marble-dusk world (detail pages — Phase 5; reserved in tokens now):**

| Token | Hex | Role |
|---|---|---|
| duskBg | `#171310` | Torch-lit hall |
| duskSurface | `#221C15` | Stone in shadow |
| duskText | `#E6DCC4` | Warm marble white |
| duskTorch | `#D89B54` | Torch warmth — accents, plaque engraving |

The tear transition carries the palette shift; the activated exhibit is the brightest object in the dusk room.

## Type System

| Role | Face | Weights | Rationale |
|---|---|---|---|
| Display / headings | **Cinzel** | 400, 700 | Based on Trajan's Column inscriptions — the marble voice |
| Body | **EB Garamond** | 400, 500, italic | Renaissance bookface — the manuscript voice |
| Annotations / tags | **Caveat** | 400 | Hand-italic marginalia, used sparingly |
| Code | **JetBrains Mono** | 400 | Unchanged — code is code |

## Material Targets (Phase 7 / R3F)

| Material | Roughness | Metalness | Transmission | Notes |
|---|---|---|---|---|
| Aged paper | 0.75–0.85 | 0.0 | 0.0 | Warm fibre texture, torn edges |
| Greek marble | 0.15–0.25 | 0.0 | 0.1–0.2 | Veining via roughness map, slight translucency |
| Torch light | — | — | — | Warm HDRI (Poly Haven, candlelit/sunset family) — replaces v1 "studio" |

## Camera Personality

*"Unhurried museum guide — glides between exhibits with quiet authority, no rush."* Spring start: `stiffness 40, damping 20`.

## Performance Floor

Unchanged from v1: 2020 MacBook Air M1 at 60fps; mid-range Android 30fps with reduced effects; `hardwareConcurrency ≤ 2` or `deviceMemory < 4GB` → static fallback.

## Audio

Unchanged from v1: yes, ambient paper-and-stone loop, `volume 0.15`, default off, mute in Nav, `localStorage('museum-muted')`.

## Mobile Stance

Adapted, not reduced: same world, sheets stack in a scrollable pile, tap replaces hover, no cursor boids/paper physics.
