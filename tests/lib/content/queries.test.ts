// tests/lib/content/queries.test.ts
import { describe, it, expect } from 'vitest'
import type { Project } from '@/lib/content/types'
import {
  getAllProjects,
  getFeaturedProjects,
  getProjectBySlug,
  getAllTags,
  getCuratorNote,
} from '@/lib/content/queries'

const mockProjects: Project[] = [
  {
    type: 'iframe',
    title: 'Alpha',
    slug: 'alpha',
    description: 'First project',
    heroImage: '/alpha/hero.jpg',
    tags: ['TypeScript', 'React'],
    status: 'live',
    featured: true,
    featuredOrder: 2,
    publishedAt: '2024-01-01',
    curatorNote: 'Alpha note',
    iframeUrl: 'https://alpha.com',
    body: () => null,
  } as unknown as Project,
  {
    type: 'iframe',
    title: 'Beta',
    slug: 'beta',
    description: 'Second project',
    heroImage: '/beta/hero.jpg',
    tags: ['Next.js', 'TypeScript'],
    status: 'wip',
    featured: true,
    featuredOrder: 1,
    publishedAt: '2024-06-01',
    curatorNote: 'Beta note',
    iframeUrl: 'https://beta.com',
    body: () => null,
  } as unknown as Project,
  {
    type: 'iframe',
    title: 'Gamma',
    slug: 'gamma',
    description: 'Third project',
    heroImage: '/gamma/hero.jpg',
    tags: ['Rust'],
    status: 'live',
    featured: false,
    publishedAt: '2023-06-01',
    iframeUrl: 'https://gamma.com',
    body: () => null,
  } as unknown as Project,
]

describe('getAllProjects', () => {
  it('returns projects sorted by publishedAt descending', () => {
    const result = getAllProjects(mockProjects)
    expect(result[0].slug).toBe('beta')
    expect(result[1].slug).toBe('alpha')
    expect(result[2].slug).toBe('gamma')
  })
})

describe('getFeaturedProjects', () => {
  it('returns only featured projects sorted by featuredOrder ascending', () => {
    const result = getFeaturedProjects(mockProjects)
    expect(result).toHaveLength(2)
    expect(result[0].slug).toBe('beta')
    expect(result[1].slug).toBe('alpha')
  })

  it('excludes non-featured projects', () => {
    const result = getFeaturedProjects(mockProjects)
    expect(result.find(p => p.slug === 'gamma')).toBeUndefined()
  })
})

describe('getProjectBySlug', () => {
  it('returns the correct project', () => {
    const result = getProjectBySlug(mockProjects, 'alpha')
    expect(result?.title).toBe('Alpha')
  })

  it('returns undefined for unknown slug', () => {
    const result = getProjectBySlug(mockProjects, 'does-not-exist')
    expect(result).toBeUndefined()
  })
})

describe('getAllTags', () => {
  it('returns unique tags sorted alphabetically', () => {
    const result = getAllTags(mockProjects)
    expect(result).toEqual(['Next.js', 'React', 'Rust', 'TypeScript'])
  })
})

describe('getCuratorNote', () => {
  it('returns the curatorNote from the first featured project', () => {
    const result = getCuratorNote(mockProjects)
    expect(result).toBe('Beta note')
  })

  it('falls back to default when no curatorNote on featured project', () => {
    const projectsWithoutNote = mockProjects.map(p => ({ ...p, curatorNote: undefined }))
    const result = getCuratorNote(projectsWithoutNote)
    expect(result).toBe('A collection of things built with care.')
  })
})
