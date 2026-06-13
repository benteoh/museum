import { PageShell } from '@/components/layout/PageShell'
import { ThoughtList } from '@/components/thoughts/ThoughtList'

export const metadata = {
  title: 'Thoughts · Museum of Little Things',
}

export default function ThoughtsPage() {
  return (
    <PageShell
      kicker="Notes"
      title="Thoughts"
      lede="Occasional writing on craft and design — coming soon."
    >
      <ThoughtList />
    </PageShell>
  )
}
