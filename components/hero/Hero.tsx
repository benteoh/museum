// components/hero/Hero.tsx
'use client'

import { motion } from 'framer-motion'
import * as styles from './Hero.css'
import { tokens } from '@/lib/motion'
import { useHeroScroll } from '@/hooks/useHeroScroll'

// Entry choreography — title leads, scroll cue follows after the canvas settles.
const TITLE_DELAY = 1.5
const INDICATOR_DELAY = 2.6
const INDICATOR_OPACITY = 0.4

export function Hero() {
  const { opacity, scale } = useHeroScroll()

  return (
    <section className={styles.section}>
      <div className={styles.vignette} />

      <motion.h1
        className={styles.title}
        style={{ opacity, scale }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...tokens.cinematic, delay: TITLE_DELAY }}
      >
        <span className={styles.titleKicker}>Museum of</span>
        <span className={styles.titleMain}>Little Things</span>
      </motion.h1>

      <motion.div
        className={styles.scrollIndicator}
        initial={{ opacity: 0 }}
        animate={{ opacity: INDICATOR_OPACITY }}
        transition={{ ...tokens.standard, delay: INDICATOR_DELAY }}
      />
    </section>
  )
}
