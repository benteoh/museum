// components/paper/tornEdge.ts
// Pure math for procedural torn-paper edges. No DOM, no React — unit-testable.

/** Deterministic PRNG (mulberry32). Same seed → same sequence. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** FNV-1a hash of a string to an unsigned 32-bit int — stable seeds from slugs. */
export function hashSeed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

type TornEdgeOptions = {
  width: number
  height: number
  seed: number
  /** Max perpendicular jitter as a fraction of the box (default 0.015). */
  roughness?: number
  /** Points per edge (default 18). */
  segments?: number
}

/**
 * Closed SVG path tracing the box perimeter with jittered points — a torn
 * sheet outline. With width/height = 1 the path suits objectBoundingBox
 * clipPath units. Points are clamped to [-roughness, size + roughness].
 */
export function tornEdgePath({ width, height, seed, roughness = 0.015, segments = 18 }: TornEdgeOptions): string {
  const rand = mulberry32(seed)
  // Two octaves per edge: a slow coarse meander with fine per-point fuzz on
  // top — many small tears riding a gentle wander, not uniform noise.
  const edgeJitter = (scale: number): number[] => {
    const amp = roughness * scale
    const coarseCount = Math.max(2, Math.round(segments / 8) + 1)
    const coarse = Array.from({ length: coarseCount }, () => (rand() * 2 - 1) * amp * 0.65)
    const out: number[] = []
    for (let i = 0; i < segments; i++) {
      const t = (i / segments) * (coarseCount - 1)
      const k = Math.floor(t)
      const frac = t - k
      const meander = coarse[k] * (1 - frac) + coarse[Math.min(k + 1, coarseCount - 1)] * frac
      const fuzz = (rand() * 2 - 1) * amp * 0.35
      out.push(Math.max(-amp, Math.min(amp, meander + fuzz)))
    }
    return out
  }
  const top = edgeJitter(height)
  const right = edgeJitter(width)
  const bottom = edgeJitter(height)
  const left = edgeJitter(width)
  const pts: Array<[number, number]> = []
  // top: left → right
  for (let i = 0; i < segments; i++) pts.push([(i / segments) * width, top[i]])
  // right: top → bottom
  for (let i = 0; i < segments; i++) pts.push([width + right[i], (i / segments) * height])
  // bottom: right → left
  for (let i = 0; i < segments; i++) pts.push([width - (i / segments) * width, height + bottom[i]])
  // left: bottom → top
  for (let i = 0; i < segments; i++) pts.push([left[i], height - (i / segments) * height])

  const [first, ...rest] = pts
  const fmt = (n: number) => Number(n.toFixed(4)).toString()
  return `M ${fmt(first[0])} ${fmt(first[1])} ${rest.map(([x, y]) => `L ${fmt(x)} ${fmt(y)}`).join(' ')} Z`
}
