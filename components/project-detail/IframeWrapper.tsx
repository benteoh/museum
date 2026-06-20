'use client'

// components/project-detail/IframeWrapper.tsx
import { useState, useEffect } from 'react'
import { ProjectPreview } from '@/components/projects/ProjectPreview'
import { Skeleton } from '@/components/ui/Skeleton'
import * as styles from './IframeWrapper.css'

type Props = {
  url: string
  height?: number
  mobileNote?: string
  slug: string
  heroImage?: string
  heroColour?: string
  title: string
}

export function IframeWrapper({ url, height = 800, mobileNote, slug, heroImage, heroColour, title }: Props) {
  const [mounted, setMounted] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={styles.root} style={{ height }}>
        <Skeleton width="100%" height="100%" radius="0" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.fallback} style={{ height }}>
        <ProjectPreview slug={slug} heroImage={heroImage} heroColour={heroColour} title={title} />
        <a
          className={styles.fallbackLink}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          View live ↗
        </a>
      </div>
    )
  }

  return (
    <>
      <div className={styles.root} style={{ height }}>
        {!loaded && (
          <div className={styles.skeletonLayer}>
            <Skeleton width="100%" height="100%" radius="0" />
          </div>
        )}
        <iframe
          className={styles.iframe}
          src={url}
          style={{ opacity: loaded ? 1 : 0, height }}
          onLoad={(e) => {
            try {
              // Successfully-loaded cross-origin frames throw SecurityError here —
              // that's the success case. Blocked frames (X-Frame-Options / CSP) load
              // an about:blank error document that is same-origin and accessible.
              const href = e.currentTarget.contentWindow?.location.href
              if (!href || href === 'about:blank') {
                setError(true)
                return
              }
            } catch {
              // SecurityError = cross-origin content loaded successfully
            }
            setLoaded(true)
          }}
          onError={() => setError(true)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          loading="lazy"
          title={title}
        />
      </div>
      {mobileNote && <p className={styles.mobileNote}>{mobileNote}</p>}
    </>
  )
}
