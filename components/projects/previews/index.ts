// components/projects/previews/index.ts
import type { ComponentType } from 'react'
import { MuseumOfLittleThingsPreview } from './MuseumOfLittleThingsPreview'
import { SkyhivePreview } from './SkyhivePreview'

export const PREVIEW_COMPONENTS: Record<string, ComponentType> = {
  'museum-of-little-things': MuseumOfLittleThingsPreview,
  skyhive: SkyhivePreview,
}
