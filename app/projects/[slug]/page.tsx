// app/projects/[slug]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { projects } from '@/lib/content'
import { getAllProjects, getProjectBySlug, getRelatedProjects, toCardData } from '@/lib/content/queries'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { STATUS_META } from '@/components/projects/ProjectCard'
import { CaseStudy } from '@/components/project-detail/CaseStudy'
import { IframeWrapper } from '@/components/project-detail/IframeWrapper'
import * as styles from './page.css'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getAllProjects(projects).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = getProjectBySlug(projects, slug)
  if (!project) return {}
  return {
    title: `${project.title} · Museum of Little Things`,
    description: project.description,
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  const project = getProjectBySlug(projects, slug)
  if (!project) notFound()

  const related = getRelatedProjects(projects, slug)

  return (
    <div className={styles.container}>
      <header className={styles.header} style={{ viewTransitionName: 'panel-hero' } as React.CSSProperties}>
        <Link href="/projects" className={styles.back}>
          ← Projects
        </Link>
        <h1 className={styles.title}>{project.title}</h1>
        <p className={styles.description}>{project.description}</p>
        <div className={styles.meta}>
          <span className={styles.status}>{STATUS_META[project.status].label}</span>
          {project.tags.map((t) => (
            <span key={t} className={styles.tag}>{t}</span>
          ))}
        </div>
        {(project.links?.github || project.links?.live || project.links?.source) && (
          <div className={styles.links}>
            {project.links?.github && (
              <a href={project.links.github} target="_blank" rel="noopener noreferrer" className={styles.link}>
                GitHub ↗
              </a>
            )}
            {project.links?.live && (
              <a href={project.links.live} target="_blank" rel="noopener noreferrer" className={styles.link}>
                Live ↗
              </a>
            )}
            {project.links?.source && (
              <a href={project.links.source} target="_blank" rel="noopener noreferrer" className={styles.link}>
                Source ↗
              </a>
            )}
          </div>
        )}
      </header>

      <CaseStudy code={project.body} />

      {project.iframeUrl && (
        <IframeWrapper
          url={project.iframeUrl}
          height={project.iframeHeight}
          mobileNote={project.iframeMobileNote}
          slug={project.slug}
          heroImage={project.heroImage}
          heroColour={project.heroColour}
          title={project.title}
        />
      )}

      <footer className={styles.footer}>
        <div className={styles.footerMeta}>
          <div className={styles.footerTags}>
            {project.tags.map((t) => (
              <span key={t} className={styles.footerTag}>{t}</span>
            ))}
          </div>
          <p className={styles.date}>
            {new Date(project.publishedAt).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {related.length > 0 && (
          <div className={styles.related}>
            <p className={styles.relatedHeading}>Related</p>
            <div className={styles.relatedGrid}>
              {related.map((r) => (
                <ProjectCard key={r.slug} project={toCardData(r)} />
              ))}
            </div>
          </div>
        )}
      </footer>
    </div>
  )
}
