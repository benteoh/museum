import { PageShell } from '@/components/layout/PageShell'
import { Skeleton } from '@/components/ui/Skeleton'
import * as styles from './page.css'

export const metadata = {
  title: 'About · Museum of Little Things',
}

// Varying line widths so the placeholder reads like real paragraphs.
const LINES = ['100%', '96%', '88%', '92%', '70%']

export default function AboutPage() {
  return (
    <PageShell kicker="About" title="About" lede="More about this place — coming soon.">
      <div className={styles.prose}>
        {LINES.map((width, i) => (
          <Skeleton key={i} width={width} height="1rem" />
        ))}
        <span className={styles.spacer} />
        {LINES.slice(0, 4).map((width, i) => (
          <Skeleton key={i} width={width} height="1rem" />
        ))}
      </div>
    </PageShell>
  )
}
