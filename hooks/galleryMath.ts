// hooks/galleryMath.ts

/** Horizontal pixels the track must travel: overflow beyond the viewport, never negative. */
export function scrollDistance(trackWidth: number, viewportWidth: number): number {
  return Math.max(0, trackWidth - viewportWidth)
}

/** Nearest panel index for a 0→1 scroll progress. */
export function activeIndexAt(progress: number, panelCount: number): number {
  if (panelCount <= 0) return 0
  const clamped = Math.max(0, Math.min(1, progress))
  const index = Math.round(clamped * (panelCount - 1))
  return Math.max(0, Math.min(panelCount - 1, index))
}
