// lib/content/types.ts
import type React from 'react'

type BaseProject = {
  title: string
  slug: string
  description: string
  heroImage: string
  heroColour?: string
  tags: string[]
  links?: {
    github?: string
    live?: string
    source?: string
  }
  status: 'live' | 'wip' | 'archived'
  featured: boolean
  featuredOrder?: number
  publishedAt: string
  curatorNote?: string
  body: React.ComponentType
}

type IframeProject = BaseProject & {
  type: 'iframe'
  iframeUrl: string
  iframeHeight?: number
  iframeMobileNote?: string
}

export type Project = IframeProject
