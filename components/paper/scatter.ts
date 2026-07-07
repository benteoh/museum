// components/paper/scatter.ts
// Deterministic "strewn on a desk" transform per sheet index.
import { mulberry32 } from './tornEdge'

export type SheetScatter = {
  /** degrees, ±3.5 */
  rotate: number
  /** px, ±12 */
  dx: number
  /** px, ±16 */
  dy: number
}

export function sheetScatter(index: number): SheetScatter {
  const rand = mulberry32((index + 1) * 7919)
  return {
    rotate: (rand() * 2 - 1) * 3.5,
    dx: (rand() * 2 - 1) * 12,
    dy: (rand() * 2 - 1) * 16,
  }
}
