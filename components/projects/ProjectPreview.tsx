// components/projects/ProjectPreview.tsx
'use client'

import { PREVIEW_COMPONENTS } from './previews'
import { DefaultPreview } from './previews/DefaultPreview'
import { resolvePreview } from './resolvePreview'
import * as styles from './ProjectPreview.css'
import type { StudyWorld } from './previews/studyKit'

type Props = {
  slug: string
  heroImage?: string
  heroColour?: string
  title: string
  world?: StudyWorld
}

/** Resolves a project's visual: bespoke component → image/GIF → animated fallback. */
export function ProjectPreview({ slug, heroImage, heroColour, title, world = 'paper' }: Props) {
  const Custom = PREVIEW_COMPONENTS[slug]
  const kind = resolvePreview({ hasComponent: Boolean(Custom), heroImage })

  return (
    <div className={styles.root} aria-hidden="true">
      {kind === 'component' && Custom ? (
        <Custom world={world} />
      ) : kind === 'image' ? (
        // eslint-disable-next-line @next/next/no-img-element -- SVGs/GIFs need raw <img>, not next/image
        <img className={styles.image} src={heroImage} alt={title} loading="lazy" decoding="async" />
      ) : (
        <DefaultPreview slug={slug} heroColour={heroColour} world={world} />
      )}
    </div>
  )
}
