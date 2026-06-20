// components/projects/resolvePreview.ts
export type PreviewKind = 'component' | 'image' | 'default'

export function resolvePreview(opts: {
  hasComponent: boolean
  heroImage?: string
}): PreviewKind {
  if (opts.hasComponent) return 'component'
  if (opts.heroImage) return 'image'
  return 'default'
}
