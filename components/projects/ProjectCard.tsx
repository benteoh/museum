// components/projects/ProjectCard.tsx
import { vars } from '@/styles/tokens.css'
import { Skeleton } from '@/components/ui/Skeleton'
import * as styles from './ProjectCard.css'

export type ProjectStatus = 'live' | 'wip' | 'archived'

export type ProjectCardData = {
  slug: string
  title: string
  description: string
  heroColour?: string
  tags: string[]
  status: ProjectStatus
}

const STATUS_META: Record<ProjectStatus, { label: string; colour: string }> = {
  live: { label: 'Live', colour: vars.color.statusLive },
  wip: { label: 'In progress', colour: vars.color.statusWip },
  archived: { label: 'Archived', colour: vars.color.textSecondary },
}

export function ProjectCard({ project }: { project: ProjectCardData }) {
  const status = STATUS_META[project.status]

  return (
    <article className={styles.card}>
      <div
        className={styles.panel}
        style={{ backgroundColor: project.heroColour ?? vars.color.surface }}
      >
        <span className={styles.badge}>
          <span className={styles.badgeDot} style={{ backgroundColor: status.colour }} />
          {status.label}
        </span>
      </div>

      <div className={styles.body}>
        <h2 className={styles.title}>{project.title}</h2>
        <p className={styles.description}>{project.description}</p>
        <div className={styles.tags}>
          {project.tags.map((t) => (
            <span key={t} className={styles.tag}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

/** Placeholder card shown while there's no project content to display. */
export function ProjectCardSkeleton() {
  return (
    <article className={styles.card}>
      <div className={styles.panel} style={{ backgroundImage: 'none' }}>
        <Skeleton width="100%" height="100%" radius="0" />
      </div>
      <div className={styles.body}>
        <Skeleton width="55%" height="1.375rem" />
        <Skeleton width="100%" height="0.9rem" />
        <Skeleton width="80%" height="0.9rem" />
        <div className={styles.tags}>
          <Skeleton width="3rem" height="0.6875rem" />
          <Skeleton width="4rem" height="0.6875rem" />
        </div>
      </div>
    </article>
  )
}
