// components/projects/ProjectPreview.tsx
'use client'

import { PREVIEW_COMPONENTS } from './previews'
import { DefaultPreview } from './previews/DefaultPreview'
import { resolvePreview } from './resolvePreview'
import * as styles from './ProjectPreview.css'

type Props = {
  slug: string
  heroImage?: string
  heroColour?: string
  title: string
}

/** Resolves a project's visual: bespoke component → image/GIF → animated fallback. */
export function ProjectPreview({ slug, heroImage, heroColour, title }: Props) {
  const Custom = PREVIEW_COMPONENTS[slug]
  const kind = resolvePreview({ hasComponent: Boolean(Custom), heroImage })

  return (
    <div className={styles.root}>
      {kind === 'component' && Custom ? (
        <Custom />
      ) : kind === 'image' ? (
        // eslint-disable-next-line @next/next/no-img-element -- SVGs/GIFs need raw <img>, not next/image
        <img className={styles.image} src={heroImage} alt={title} loading="lazy" decoding="async" />
      ) : (
        <DefaultPreview heroColour={heroColour} />
      )}
    </div>
  )
}
