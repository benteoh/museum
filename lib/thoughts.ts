// lib/thoughts.ts
// Shape of a thought entry. A real `thoughts` Velite collection will populate these.
export type Thought = {
  slug: string
  title: string
  excerpt: string
  publishedAt: string
  readingTime: string
  tag: string
}
