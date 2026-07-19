// components/cursor/BoidsCanvasWrapper.tsx
'use client'

import { motion } from 'framer-motion'
import { BoidsCanvas } from './BoidsCanvas'
import { useBoidsVisibility } from '@/hooks/useBoidsVisibility'
import { useDeviceTier } from '@/hooks/useDeviceTier'

export function BoidsCanvasWrapper() {
  const tier = useDeviceTier()
  const opacity = useBoidsVisibility()

  // The flock is autonomous motion — full tier only. Reduced keeps the world
  // without choreography; static renders none of it.
  if (tier !== 'full') return null

  return (
    <motion.div
      style={{
        opacity,
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <BoidsCanvas />
    </motion.div>
  )
}
