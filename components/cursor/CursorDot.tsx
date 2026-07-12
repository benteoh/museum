'use client'

// components/cursor/CursorDot.tsx
// The bespoke pointer: an ink nib. A tight dot rides directly under the
// pointer (precision), while a halo ring catches up on a snappy spring —
// the ~90ms lag is the weight cue. Over interactive elements the halo opens
// and the nib tightens; on press both gather. Ink-dark in the paper world,
// warm light over the desk and vista (scene store).
//
// Fine pointers at full tier only — touch and reduced/static tiers keep the
// native cursor untouched.
import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useDeviceTier } from '@/hooks/useDeviceTier'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useScene } from '@/hooks/useScene'
import * as styles from './CursorDot.css'

const INTERACTIVE =
  'a, button, [role="button"], input, textarea, select, summary, label'
// Micro-interaction springs — intentionally snappier than the locked
// scene-motion range (the brief reserves 40–70/18–24 for scene choreography;
// pointer response must read as instantaneous mass, not drift).
const HALO_FOLLOW = { stiffness: 320, damping: 26 }
const STATE_SPRING = { type: 'spring', stiffness: 380, damping: 26 } as const

export function CursorDot() {
  const tier = useDeviceTier()
  const finePointer = useMediaQuery('(pointer: fine)')
  const scene = useScene()
  const active = tier === 'full' && finePointer

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const hx = useSpring(x, HALO_FOLLOW)
  const hy = useSpring(y, HALO_FOLLOW)
  const [visible, setVisible] = useState(false)
  const [overInteractive, setOverInteractive] = useState(false)
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    if (!active) return
    document.documentElement.classList.add(styles.hideNativeCursor)

    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setVisible(true)
    }
    const over = (e: PointerEvent) => {
      const el = e.target instanceof Element ? e.target : null
      setOverInteractive(!!el?.closest(INTERACTIVE))
    }
    const down = () => setPressed(true)
    const up = () => setPressed(false)
    const leave = () => setVisible(false)
    const enter = () => setVisible(true)

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    window.addEventListener('pointerdown', down, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    document.documentElement.addEventListener('pointerenter', enter)
    return () => {
      document.documentElement.classList.remove(styles.hideNativeCursor)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('pointerleave', leave)
      document.documentElement.removeEventListener('pointerenter', enter)
    }
  }, [active, x, y])

  if (!active) return null

  const light = scene !== 'paper'
  const dotScale = pressed ? 0.7 : overInteractive ? 0.55 : 1
  const haloScale = pressed ? 0.75 : overInteractive ? 1.55 : 1

  return (
    <div aria-hidden className={styles.root}>
      <motion.div
        className={`${styles.halo} ${light ? styles.haloLight : ''}`}
        style={{ x: hx, y: hy }}
        animate={{ scale: haloScale, opacity: visible ? 1 : 0 }}
        transition={STATE_SPRING}
      />
      <motion.div
        className={`${styles.dot} ${light ? styles.dotLight : ''}`}
        style={{ x, y }}
        animate={{ scale: dotScale, opacity: visible ? 1 : 0 }}
        transition={STATE_SPRING}
      />
    </div>
  )
}
