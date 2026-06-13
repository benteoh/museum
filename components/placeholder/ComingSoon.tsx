// components/placeholder/ComingSoon.tsx
import * as styles from './ComingSoon.css'

type Props = {
  message: string
}

/** Centered placeholder for routes whose content hasn't been built yet. */
export function ComingSoon({ message }: Props) {
  return <div className={styles.wrapper}>{message}</div>
}
