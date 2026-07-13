// app/page.tsx
// The home page is the Vision journey: the Overture's manuscripts part to
// reveal the desk, then the projects float as glass frames over the Florence
// vista. See docs/superpowers/specs/2026-07-02-living-codex-design.md
// ("2026-07-11 revision — The Vision Gallery").
import { existsSync } from 'fs'
import path from 'path'
import { preload } from 'react-dom'
import { OvertureScene, type OvertureAssets } from '@/components/overture/OvertureScene'
import { VisionScene } from '@/components/vision/VisionScene'
import { Invitation } from '@/components/home/Invitation'
import { projects } from '@/lib/content'
import { getAllProjects, getFeaturedProjects, getCuratorNote, toCardData } from '@/lib/content/queries'
import { asset } from '@/lib/asset'

// Generated scans live at public/overture/<seed>.webp (or .png); a missing
// file falls back to the procedural StudyDrawing. 'vision-desk' is the
// bird's-eye still the parting reveals.
const OVERTURE_SEEDS = ['codex-atlanticus', 'codex-leicester', 'codex-windsor', 'codex-turin', 'codex-flight', 'vision-desk']
// Topmost sheets — first thing the visitor sees, so they preload with the
// desk still and the vista; the buried sheets can arrive a beat later.
const PRELOAD_SEEDS = ['codex-flight', 'codex-turin', 'vision-desk']

function detectAsset(name: string): string | undefined {
  for (const ext of ['webp', 'png']) {
    const rel = `/overture/${name}.${ext}`
    // existsSync checks the unprefixed public path; the URL ships prefixed.
    if (existsSync(path.join(process.cwd(), 'public', rel))) return asset(rel)
  }
  return undefined
}

function detectOvertureAssets(): OvertureAssets {
  const assets: OvertureAssets = {}
  for (const seed of OVERTURE_SEEDS) {
    const src = detectAsset(seed)
    if (src) assets[seed] = src
  }
  return assets
}

export default function HomePage() {
  const assets = detectOvertureAssets()
  const backdropSrc = detectAsset('vision-horizon')

  // LCP: the journey's first-viewport images go out as <link rel="preload">
  // in the document head, not discovered late from client JS.
  for (const seed of PRELOAD_SEEDS) {
    if (assets[seed]) preload(assets[seed]!, { as: 'image' })
  }
  if (backdropSrc) preload(backdropSrc, { as: 'image' })

  const featured = getFeaturedProjects(projects)
  const shown = featured.length > 0 ? featured : getAllProjects(projects)

  return (
    <>
      <OvertureScene title="Museum of Little Things" assets={assets} />
      <VisionScene
        projects={shown.map(toCardData)}
        curatorNote={getCuratorNote(projects)}
        backdropSrc={backdropSrc}
      />
      <Invitation />
    </>
  )
}
