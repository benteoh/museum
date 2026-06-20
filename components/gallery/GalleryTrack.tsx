// components/gallery/GalleryTrack.tsx
'use client'

import { motion } from 'framer-motion'
import type { ProjectCardData } from '@/components/projects/ProjectCard'
import { useGallery } from '@/hooks/useGallery'
import { ExhibitionPanel, ExhibitionPanelSkeleton } from './ExhibitionPanel'
import * as styles from './GalleryTrack.css'

const PLACEHOLDER_COUNT = 4

// Known limitation: panel position is driven by scroll progress only, so
// Tab-focusing an off-screen panel does not scroll it to centre. Acceptable
// for v1 (the index page at /projects is the keyboard-friendly catalogue);
// revisit with an onFocus-to-progress scroll if needed.
export function GalleryTrack({ projects }: { projects: ProjectCardData[] }) {
  const isEmpty = projects.length === 0
  const panelCount = isEmpty ? PLACEHOLDER_COUNT : projects.length
  const { sectionRef, trackRef, x, activeIndex } = useGallery(panelCount)

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      style={{ height: `${(panelCount + 1) * 100}vh` }}
    >
      <div className={styles.sticky}>
        <motion.div ref={trackRef} className={styles.track} style={{ x }}>
          {isEmpty
            ? Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
                <ExhibitionPanelSkeleton key={i} />
              ))
            : projects.map((project, index) => (
                <ExhibitionPanel
                  key={project.slug}
                  project={project}
                  index={index}
                  activeIndex={activeIndex}
                />
              ))}
        </motion.div>
      </div>
    </section>
  )
}
