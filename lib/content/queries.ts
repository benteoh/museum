// lib/content/queries.ts
import type { Project } from './types'
import type { ProjectCardData } from '@/components/projects/ProjectCard'

export function toCardData(p: Project): ProjectCardData {
  return {
    slug: p.slug,
    title: p.title,
    description: p.description,
    heroImage: p.heroImage,
    heroColour: p.heroColour,
    tags: p.tags,
    status: p.status,
  }
}

export function getAllProjects(projects: Project[]): Project[] {
  return [...projects].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export function getFeaturedProjects(projects: Project[]): Project[] {
  return projects
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99))
}

export function getProjectBySlug(projects: Project[], slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

export function getAllTags(projects: Project[]): string[] {
  const tags = new Set(projects.flatMap((p) => p.tags))
  return [...tags].sort()
}

export function getCuratorNote(projects: Project[]): string {
  const featured = getFeaturedProjects(projects)
  return featured[0]?.curatorNote ?? 'A collection of things built with care.'
}
