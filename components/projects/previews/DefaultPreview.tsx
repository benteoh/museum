// components/projects/previews/DefaultPreview.tsx
'use client'

import type { CSSProperties } from 'react'
import * as styles from './DefaultPreview.css'

/** Calm animated fill shown when a project has no component or image. */
export function DefaultPreview({ heroColour }: { heroColour?: string }) {
  const style = heroColour ? ({ '--tint': heroColour } as CSSProperties) : undefined
  return <div className={styles.root} style={style} aria-hidden />
}
