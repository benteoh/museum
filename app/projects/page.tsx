import { PageShell } from '@/components/layout/PageShell'
import { ProjectGallery } from '@/components/projects/ProjectGallery'

export const metadata = {
  title: 'Projects · Museum of Little Things',
}

export default function ProjectsPage() {
  return (
    <PageShell
      kicker="The Collection"
      title="Projects"
      lede="Selected work, going on display soon."
    >
      <ProjectGallery />
    </PageShell>
  )
}
