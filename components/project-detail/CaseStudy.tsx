'use client'

// components/project-detail/CaseStudy.tsx
import { useMDXComponent } from '@/lib/content/useMDXComponent'
import * as styles from './CaseStudy.css'

export function CaseStudy({ code }: { code: string }) {
  const Component = useMDXComponent(code)
  return (
    <div className={styles.root}>
      <Component />
    </div>
  )
}
