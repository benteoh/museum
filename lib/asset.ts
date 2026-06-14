// Prefixes a root-relative asset path with the configured basePath.
//
// next/link hrefs and Next-managed `_next/*` chunks are prefixed automatically,
// but hand-written URLs (img src, fetch, CSS url()) are not. Use this for those.
//
//   <img src={asset('/previews/foo.gif')} />  ->  /museum/previews/foo.gif (prod)
//                                              ->  /previews/foo.gif        (dev)
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export function asset(path: string): string {
  if (!path.startsWith('/')) return path // leave external/relative URLs untouched
  return `${basePath}${path}`
}
