// components/home/Invitation.tsx
import Link from 'next/link'
import * as styles from './Invitation.css'

export function Invitation() {
  return (
    <section className={styles.section}>
      <Link href="/projects" className={styles.link}>
        Browse the full collection
      </Link>
    </section>
  )
}
