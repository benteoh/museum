// app/page.tsx
import { Hero } from '@/components/hero/Hero'
import { CuratorLine } from '@/components/home/CuratorLine'
import { GalleryTrack } from '@/components/gallery/GalleryTrack'
import { Invitation } from '@/components/home/Invitation'
import { projects } from '@/lib/content'
import { getFeaturedProjects, getCuratorNote, toCardData } from '@/lib/content/queries'

export default function HomePage() {
  const note = getCuratorNote(projects)
  const cards = getFeaturedProjects(projects).map(toCardData)

  return (
    <>
      <Hero />
      <CuratorLine note={note} />
      <GalleryTrack projects={cards} />
      <Invitation />
    </>
  )
}
