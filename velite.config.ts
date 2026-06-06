// velite.config.ts
import { defineCollection, defineConfig, s } from 'velite'

const projects = defineCollection({
  name: 'Project',
  pattern: 'projects/**/*.mdx',
  schema: s.object({
    type: s.enum(['iframe']),
    title: s.string(),
    slug: s.string(),
    description: s.string(),
    heroImage: s.string(),
    heroColour: s.string().optional(),
    tags: s.array(s.string()),
    links: s
      .object({
        github: s.string().url().optional(),
        live: s.string().url().optional(),
        source: s.string().url().optional(),
      })
      .optional(),
    status: s.enum(['live', 'wip', 'archived']),
    featured: s.boolean().default(false),
    featuredOrder: s.number().optional(),
    publishedAt: s.isodate(),
    curatorNote: s.string().optional(),
    iframeUrl: s.string().url().optional(),
    iframeHeight: s.number().optional(),
    iframeMobileNote: s.string().optional(),
    body: s.mdx(),
  }),
})

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { projects },
})
