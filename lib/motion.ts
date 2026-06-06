// lib/motion.ts
export const tokens = {
  snappy:    { duration: 0.15, ease: [0.16, 1, 0.3, 1] as const },
  standard:  { duration: 0.5,  ease: [0.16, 1, 0.3, 1] as const },
  cinematic: { duration: 0.9,  ease: [0.16, 1, 0.3, 1] as const },
  drift:     { duration: 2.0,  ease: [0.16, 1, 0.3, 1] as const },
} as const

export type MotionToken = keyof typeof tokens
