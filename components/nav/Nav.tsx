// components/nav/Nav.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import * as styles from './Nav.css'
import { MobileOverlay } from './MobileOverlay'
import { tokens } from '@/lib/motion'

const navLinks = [
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
  { href: '/thoughts', label: 'Thoughts' },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
          {navLinks.map((link) => (
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
