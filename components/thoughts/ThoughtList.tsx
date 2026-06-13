// components/thoughts/ThoughtList.tsx
import type { Thought } from '@/lib/thoughts'
import { Skeleton } from '@/components/ui/Skeleton'
import * as styles from './ThoughtList.css'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const PLACEHOLDER_COUNT = 3

// Deterministic YYYY-MM-DD → "May 2026" so server and client markup match.
function formatDate(iso: string): string {
  const [year, month] = iso.split('-')
  return `${MONTHS[Number(month) - 1]} ${year}`
}

/**
 * Renders thought entries. With none yet, it shows placeholder rows so the
 * list keeps its shape until real content is wired in.
 */
export function ThoughtList({ thoughts = [] }: { thoughts?: Thought[] }) {
  if (thoughts.length === 0) {
    return (
      <div className={styles.list}>
        {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
          <div key={i} className={styles.item}>
            <div className={styles.meta}>
              <Skeleton width="4rem" height="0.75rem" />
              <Skeleton width="3rem" height="0.75rem" />
            </div>
            <div>
              <Skeleton width="45%" height="1.5rem" />
              <span style={{ display: 'block', marginTop: '0.75rem' }}>
                <Skeleton width="90%" height="1rem" />
              </span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {thoughts.map((thought) => (
        <article key={thought.slug} className={styles.item}>
          <div className={styles.meta}>
            <span>{formatDate(thought.publishedAt)}</span>
            <span>{thought.readingTime}</span>
            <span className={styles.tag}>{thought.tag}</span>
          </div>
          <div>
            <h2 className={styles.title}>{thought.title}</h2>
            <p className={styles.excerpt}>{thought.excerpt}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
