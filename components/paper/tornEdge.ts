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
  const jitter = (scale: number) => {
    const r = (rand() * 2 - 1) * roughness * scale
    return Math.max(-roughness * scale, Math.min(roughness * scale, r))
  }
  const pts: Array<[number, number]> = []
  // top: left → right
  for (let i = 0; i < segments; i++) pts.push([(i / segments) * width, jitter(height)])
  // right: top → bottom
  for (let i = 0; i < segments; i++) pts.push([width + jitter(width), (i / segments) * height])
  // bottom: right → left
  for (let i = 0; i < segments; i++) pts.push([width - (i / segments) * width, height + jitter(height)])
  // left: bottom → top
  for (let i = 0; i < segments; i++) pts.push([jitter(width), height - (i / segments) * height])

  const [first, ...rest] = pts
  const fmt = (n: number) => Number(n.toFixed(4)).toString()
  return `M ${fmt(first[0])} ${fmt(first[1])} ${rest.map(([x, y]) => `L ${fmt(x)} ${fmt(y)}`).join(' ')} Z`
}
