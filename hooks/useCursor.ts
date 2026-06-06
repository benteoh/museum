'use client'

import { create } from 'zustand'

type CursorStore = {
  x: number
  y: number
  setPosition: (x: number, y: number) => void
}

export const useCursorStore = create<CursorStore>((set) => ({
  x: -1,
  y: -1,
  setPosition: (x, y) => set({ x, y }),
}))

export function useCursor() {
  return useCursorStore((state) => ({ x: state.x, y: state.y }))
}

export function useCursorUpdater() {
  return useCursorStore((state) => state.setPosition)
}
