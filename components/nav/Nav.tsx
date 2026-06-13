// components/nav/Nav.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import * as styles from './Nav.css'
import { MobileOverlay } from './MobileOverlay'
import { tokens } from '@/lib/motion'
import { NAV_LINKS } from '@/lib/navigation'
import { useScrolled } from '@/hooks/useScrolled'

export function Nav() {
  const scrolled = useScrolled()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <motion.nav
        className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...tokens.cinematic, delay: 0.2 }}
      >
        <Link href="/" className={styles.brand}>
          Museum of Little Things
        </Link>

        <div className={styles.links}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </div>

        <button
          className={styles.hamburger}
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>
      </motion.nav>

      <MobileOverlay isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
