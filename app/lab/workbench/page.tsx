// app/lab/workbench/page.tsx
// LAB SKETCH — throwaway route to feel the Overture desk before promoting
// it. Not linked from anywhere; delete when the real scene lands.
import { existsSync } from 'fs'
import path from 'path'
import type { Metadata } from 'next'
import { DeskScene, type OvertureAssets } from '@/components/lab/DeskScene'

export const metadata: Metadata = {
  title: 'Lab — Overture',
  robots: { index: false },
}

// Drop generated scans at public/lab/overture/<seed>.webp (or .png) and they
// are picked up at build/dev time; missing files fall back to the procedural
// drawing. 'vision-desk' is the bird's-eye still the parting reveals.
const OVERTURE_SEEDS = ['codex-atlanticus', 'codex-leicester', 'codex-windsor', 'codex-turin', 'codex-flight', 'vision-desk']

function detectAsset(name: string): string | undefined {
  for (const ext of ['webp', 'png']) {
    const rel = `/lab/overture/${name}.${ext}`
    if (existsSync(path.join(process.cwd(), 'public', rel))) return rel
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

export default function WorkbenchLabPage() {
  return <DeskScene title="Museum of Little Things" assets={detectOvertureAssets()} />
}
