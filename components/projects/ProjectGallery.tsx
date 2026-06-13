// components/projects/ProjectGallery.tsx
import {
  ProjectCard,
  ProjectCardSkeleton,
  type ProjectCardData,
} from './ProjectCard'
import * as styles from './ProjectGallery.css'

const PLACEHOLDER_COUNT = 4

/**
 * Renders project cards. With no projects yet, it shows a grid of placeholder
 * cards so the gallery keeps its shape until real content is wired in.
 */
export function ProjectGallery({ projects = [] }: { projects?: ProjectCardData[] }) {
  if (projects.length === 0) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {projects.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}
    </div>
  )
}
