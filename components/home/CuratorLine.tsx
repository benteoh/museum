// components/home/CuratorLine.tsx
'use client'

import { motion } from 'framer-motion'
import { tokens } from '@/lib/motion'
import * as styles from './CuratorLine.css'

export function CuratorLine({ note }: { note: string }) {
  return (
    <section className={styles.section}>
      <motion.p
        className={styles.line}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ amount: 0.6 }}
        transition={tokens.standard}
      >
        {note}
      </motion.p>
    </section>
  )
}
