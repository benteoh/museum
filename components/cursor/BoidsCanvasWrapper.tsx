// components/cursor/BoidsCanvasWrapper.tsx
'use client'

import { motion } from 'framer-motion'
import { BoidsCanvas } from './BoidsCanvas'
import { useBoidsVisibility } from '@/hooks/useBoidsVisibility'
import { useDeviceTier } from '@/hooks/useDeviceTier'
import { useScene } from '@/hooks/useScene'

export function BoidsCanvasWrapper() {
  const tier = useDeviceTier()
  const opacity = useBoidsVisibility()
  const scene = useScene()

  // The flock is autonomous motion — full tier only. Reduced keeps the world
  // without choreography; static renders none of it.
  if (tier !== 'full') return null

  return (
    <motion.div
      style={{
        opacity,
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        // Over paper/desk the motes are cursor-layer dust above everything;
        // over the vista the murmuration slips beneath the glass rail and
        // curator note (zIndex 2) so distant birds never draw over a pane.
        zIndex: scene === 'vista' ? 1 : 9999,
      }}
    >
      <BoidsCanvas />
    </motion.div>
  )
}
