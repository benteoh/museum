// components/layout/PageShell.tsx
import type { ReactNode } from 'react'
import * as styles from './PageShell.css'

type Props = {
  kicker: string
  title: string
  lede?: string
  children?: ReactNode
}

/** Padded page container with a shared kicker + title header. */
export function PageShell({ kicker, title, lede, children }: Props) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.kicker}>{kicker}</span>
        <h1 className={styles.title}>{title}</h1>
        {lede && <p className={styles.lede}>{lede}</p>}
      </header>
      {children}
    </div>
  )
}
