import { PageShell } from '@/components/layout/PageShell'
import { ProjectGallery } from '@/components/projects/ProjectGallery'
import { projects } from '@/lib/content'
import { getAllProjects, toCardData } from '@/lib/content/queries'

export const metadata = {
  title: 'Projects · Museum of Little Things',
}

export default function ProjectsPage() {
  const all = getAllProjects(projects).map(toCardData)

  return (
    <PageShell
      kicker="The Collection"
      title="Projects"
      lede="Selected work, going on display soon."
    >
      <ProjectGallery projects={all} />
    </PageShell>
  )
}
