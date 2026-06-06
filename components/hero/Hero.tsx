// components/hero/Hero.tsx
'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import * as styles from './Hero.css'
import { tokens } from '@/lib/motion'

export function Hero() {
  const { scrollY } = useScroll()
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800

  const titleOpacity = useTransform(scrollY, [0, vh * 0.2], [1, 0])
  const titleScale = useTransform(scrollY, [0, vh * 0.2], [1, 0.97])

  return (
    <section className={styles.section}>
      <div className={styles.vignette} />

      <motion.h1
        className={styles.title}
        style={{ opacity: titleOpacity, scale: titleScale }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...tokens.cinematic, delay: 1.5 }}
      >
        Museum of Little Things
      </motion.h1>

      <motion.div
        className={styles.scrollIndicator}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...tokens.standard, delay: 2.6 }}
      />
    </section>
  )
}
