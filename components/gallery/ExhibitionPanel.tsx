// components/gallery/ExhibitionPanel.tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ProjectPreview } from '@/components/projects/ProjectPreview'
import type { ProjectCardData } from '@/components/projects/ProjectCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { tokens } from '@/lib/motion'
import * as styles from './ExhibitionPanel.css'

const MAX_TILT = 8

type Props = {
  project: ProjectCardData
  index: number
  activeIndex: number
}

export function ExhibitionPanel({ project, index, activeIndex }: Props) {
  const offset = index - activeIndex
  const rotateY = Math.max(-MAX_TILT, Math.min(MAX_TILT, -offset * MAX_TILT))
  const isActive = offset === 0

  return (
    <Link href={`/projects/${project.slug}`} className={styles.link}>
      <motion.article
        className={styles.panel}
        animate={{ rotateY, scale: isActive ? 1.02 : 1 }}
        transition={tokens.standard}
      >
        <ProjectPreview
          slug={project.slug}
          heroImage={project.heroImage}
          heroColour={project.heroColour}
          title={project.title}
        />
        <div className={styles.glass}>
          <h3 className={styles.title}>{project.title}</h3>
          <div className={styles.meta}>
            {project.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </motion.article>
    </Link>
  )
}

/** Placeholder vitrine shown when there is no project content yet. */
export function ExhibitionPanelSkeleton() {
  return (
    <div className={styles.link}>
      <div className={styles.panel}>
        <Skeleton width="100%" height="100%" radius="0" />
      </div>
    </div>
  )
}
