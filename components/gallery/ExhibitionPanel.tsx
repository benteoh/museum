// components/gallery/ExhibitionPanel.tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ProjectPreview } from '@/components/projects/ProjectPreview'
import type { ProjectCardData } from '@/components/projects/ProjectCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { TornSheet } from '@/components/paper/TornSheet'
import { sheetScatter } from '@/components/paper/scatter'
import { tokens } from '@/lib/motion'
import * as styles from './ExhibitionPanel.css'

type Props = {
  project: ProjectCardData
  index: number
  activeIndex: number
}

export function ExhibitionPanel({ project, index, activeIndex }: Props) {
  const isActive = index === activeIndex
  const scatter = sheetScatter(index)

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={styles.link}
      style={{ viewTransitionName: `panel-${project.slug}` } as React.CSSProperties}
    >
      <motion.article
        className={styles.sheetWrap}
        initial={false}
        animate={{
          rotate: isActive ? scatter.rotate * 0.3 : scatter.rotate,
          x: scatter.dx,
          y: scatter.dy,
          scale: isActive ? 1.03 : 1,
        }}
        transition={tokens.standard}
      >
        <TornSheet seed={project.slug}>
          <div className={styles.sheet}>
            <div className={styles.plate}>
              <ProjectPreview
                slug={project.slug}
                heroImage={project.heroImage}
                heroColour={project.heroColour}
                title={project.title}
              />
            </div>
            <div className={styles.colophon}>
              <h3 className={styles.title}>{project.title}</h3>
              <div className={styles.meta}>
                {project.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </TornSheet>
      </motion.article>
    </Link>
  )
}

/** Placeholder sheet shown when there is no project content yet. */
export function ExhibitionPanelSkeleton() {
  return (
    <div className={styles.link}>
      <div className={styles.sheetWrap}>
        <Skeleton width="100%" height="100%" radius="0" />
      </div>
    </div>
  )
}
