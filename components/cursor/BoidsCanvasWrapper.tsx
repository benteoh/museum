// components/cursor/BoidsCanvasWrapper.tsx
'use client'

import { motion } from 'framer-motion'
import { BoidsCanvas } from './BoidsCanvas'
import { useBoidsVisibility } from '@/hooks/useBoidsVisibility'

export function BoidsCanvasWrapper() {
  const opacity = useBoidsVisibility()

  return (
    <motion.div
      style={{
        opacity,
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      <BoidsCanvas />
    </motion.div>
  )
}
