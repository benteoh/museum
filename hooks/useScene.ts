// hooks/useScene.ts
'use client'

import { create } from 'zustand'

/**
 * Which world the viewport is currently in. Scenes publish it as the visitor
 * scrolls; ambient layers (cursor, boids) read it to match their material:
 *
 * - `paper` — bright parchment atelier (default everywhere)
 * - `desk`  — the dusk-warm desk still after the parting (stillness beat)
 * - `vista` — the golden-hour Florence horizon of the Vision gallery
 */
export type SceneName = 'paper' | 'desk' | 'vista'

type SceneStore = {
  scene: SceneName
  setScene: (scene: SceneName) => void
}

export const useSceneStore = create<SceneStore>((set) => ({
  scene: 'paper',
  setScene: (scene) => set((s) => (s.scene === scene ? s : { scene })),
}))

export function useScene(): SceneName {
  return useSceneStore((s) => s.scene)
}
