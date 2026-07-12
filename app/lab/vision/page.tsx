// app/lab/vision/page.tsx
// LAB SKETCH — focused route for the Vision glass-frame gallery. Drop the
// generated vista at public/lab/overture/vision-horizon.png and it becomes
// the backdrop; a golden-hour gradient stands in until then.
import { existsSync } from 'fs'
import path from 'path'
import type { Metadata } from 'next'
import { VisionScene } from '@/components/lab/VisionScene'
import { projects } from '@/lib/content'
import { getAllProjects, toCardData } from '@/lib/content/queries'
import type { ProjectCardData } from '@/components/projects/ProjectCard'

export const metadata: Metadata = {
  title: 'Lab — Vision',
  robots: { index: false },
}

const STUDIES: ProjectCardData[] = [
  { slug: 'study-i', title: 'Study I', description: '', heroColour: '#8C4F32', tags: ['sketch'], status: 'wip' },
  { slug: 'study-ii', title: 'Study II', description: '', heroColour: '#5F7E52', tags: ['sketch'], status: 'wip' },
  { slug: 'study-iii', title: 'Study III', description: '', heroColour: '#7A5F38', tags: ['sketch'], status: 'wip' },
  { slug: 'study-iv', title: 'Study IV', description: '', heroColour: '#B08A2E', tags: ['sketch'], status: 'wip' },
]

export default function VisionLabPage() {
  const real = getAllProjects(projects).map(toCardData)
  const sheets = [...real, ...STUDIES].slice(0, 6)
  const backdropSrc = ['webp', 'png']
    .map((ext) => `/lab/overture/vision-horizon.${ext}`)
    .find((rel) => existsSync(path.join(process.cwd(), 'public', rel)))
  return <VisionScene sheets={sheets} backdropSrc={backdropSrc} />
}
