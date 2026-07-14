// components/projects/previews/index.ts
import type { ComponentType } from 'react'
import type { StudyWorld } from './studyKit'
import { MuseumOfLittleThingsPreview } from './MuseumOfLittleThingsPreview'
import { SkyhivePreview } from './SkyhivePreview'

export const PREVIEW_COMPONENTS: Record<string, ComponentType<{ world: StudyWorld }>> = {
  'museum-of-little-things': MuseumOfLittleThingsPreview,
  skyhive: SkyhivePreview,
}
