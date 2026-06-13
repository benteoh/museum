// components/ui/Skeleton.tsx
import * as styles from './Skeleton.css'

type Props = {
  width?: string
  height?: string
  radius?: string
}

/** A muted, gently pulsing placeholder block. */
export function Skeleton({ width = '100%', height = '1rem', radius }: Props) {
  return (
    <span
      className={styles.skeleton}
      style={{ width, height, borderRadius: radius }}
      aria-hidden
    />
  )
}
