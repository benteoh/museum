// components/projects/previews/studyKit.ts
// Shared pure geometry for procedural manuscript studies.
import { hashSeed, mulberry32 } from '@/components/paper/tornEdge'

export type StudyWorld = 'paper' | 'glass'

// SVG/canvas literals mirror vars.color.textPrimary, vars.color.accent,
// vars.color.monoTag, vars.color.duskText, and vars.color.duskTorch.
export const STUDY_INKS = {
  paper: {
    primary: '#382C19',
    accent: '#8C4F32',
    annotation: '#7A5F38',
  },
  glass: {
    primary: '#E6DCC4',
    accent: '#D89B54',
    annotation: '#E6DCC4',
  },
} as const satisfies Record<
  StudyWorld,
  { primary: string; accent: string; annotation: string }
>

type MirrorWritingOptions = {
  count?: number
  top?: number
  lineGap?: number
  left?: number
  right?: number
  minWidth?: number
  maxWidth?: number
  wobble?: number
}

/** Deterministic pseudo-handwriting that advances right-to-left like mirror script. */
export function mirrorWritingLines(
  seed: string,
  {
    count = 9,
    top = 22,
    lineGap = 7,
    left = 10,
    right = 90,
    minWidth = 35,
    maxWidth = 80,
    wobble = 2.2,
  }: MirrorWritingOptions = {},
): string[] {
  const rand = mulberry32(hashSeed(seed))

  return Array.from({ length: count }, (_, row) => {
    const y = top + row * lineGap
    const width = Math.min(right - left, minWidth + rand() * (maxWidth - minWidth))
    const end = right - width
    let x = right
    let d = `M ${right} ${y}`

    while (x > end) {
      const step = Math.min(x - end, 2.5 + rand() * 3.5)
      x -= step
      d += ` q ${format(-step / 2)} ${format((rand() * 2 - 1) * wobble)} ${format(-step)} 0`
    }

    return d
  })
}

/** Spreadable SVG props for a stroke that is hidden or fully drawn. */
export function strokeDrawProps(length: number, drawn: boolean) {
  return {
    strokeDasharray: length,
    strokeDashoffset: drawn ? 0 : length,
  }
}

/** Path data for a force arrow whose head points from the start to the end. */
export function forceArrowGeometry(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  headSize = 3,
) {
  const dx = x2 - x1
  const dy = y2 - y1
  const length = Math.hypot(dx, dy) || 1
  const ux = dx / length
  const uy = dy / length
  const baseX = x2 - ux * headSize
  const baseY = y2 - uy * headSize
  const wingX = -uy * headSize
  const wingY = ux * headSize

  return {
    shaftPath: `M ${format(x1)} ${format(y1)} L ${format(x2)} ${format(y2)}`,
    headPath: `M ${format(x2)} ${format(y2)} L ${format(baseX - wingX)} ${format(baseY - wingY)} L ${format(baseX + wingX)} ${format(baseY + wingY)} Z`,
  }
}

function format(value: number): string {
  const rounded = Number(value.toFixed(4))
  return Object.is(rounded, -0) ? '0' : rounded.toString()
}
