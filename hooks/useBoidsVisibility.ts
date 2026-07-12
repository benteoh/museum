// hooks/useBoidsVisibility.ts
'use client'

import { useEffect, useRef } from 'react'
import {
  useScroll,
  useTransform,
  useMotionValue,
  animate,
  type MotionValue,
} from 'framer-motion'
import { tokens } from '@/lib/motion'
import { useScene, type SceneName } from '@/hooks/useScene'
import { useViewportHeight } from './useViewportHeight'

// In the paper world the motes fade out over the first 40% of a viewport of
// scroll — on the home page that is the overture's opening beats, so the ink
// is carried off with the first parting sheets.
const FADE_END_FRACTION = 0.4

// How strongly the motes are present in each world: full ink over paper,
// gone for the desk's stillness beat, a quiet warm dust over the vista.
const SCENE_PRESENCE: Record<SceneName, number> = {
  paper: 1,
  desk: 0,
  vista: 0.45,
}

/**
 * Opacity for the boids canvas: a one-shot load-in, multiplied by the paper
 * world's scroll fade and by the current scene's presence. Returns a single
 * MotionValue so the component stays purely presentational.
 */
export function useBoidsVisibility(): MotionValue<number> {
  const { scrollY } = useScroll()
  const vh = useViewportHeight()
  const scene = useScene()
  const sceneRef = useRef<SceneName>(scene)

  const loadProgress = useMotionValue(0)
  const scenePresence = useMotionValue(SCENE_PRESENCE[scene])
  const scrollOpacity = useTransform(scrollY, [0, vh * FADE_END_FRACTION], [1, 0])

  const opacity = useTransform(
    [loadProgress, scrollOpacity, scenePresence],
    ([load, scroll, presence]) =>
      (load as number) *
      (presence as number) *
      // The scroll fade belongs to the paper world; the dusk scenes sit deep
      // in the page where it would pin everything to zero.
      (sceneRef.current === 'paper' ? (scroll as number) : 1)
  )

  useEffect(() => {
    const controls = animate(loadProgress, 1, {
      duration: tokens.drift.duration,
      ease: [...tokens.drift.ease],
    })
    return () => controls.stop()
  }, [loadProgress])

  useEffect(() => {
    sceneRef.current = scene
    const controls = animate(scenePresence, SCENE_PRESENCE[scene], {
      duration: 0.9,
      ease: [...tokens.drift.ease],
    })
    return () => controls.stop()
  }, [scene, scenePresence])

  return opacity
}
