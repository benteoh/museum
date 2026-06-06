// components/nav/MobileOverlay.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import * as styles from './MobileOverlay.css'
import { tokens } from '@/lib/motion'

const navLinks = [
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
  { href: '/thoughts', label: 'Thoughts' },
]

type Props = {
  isOpen: boolean
  onClose: () => void
}

export function MobileOverlay({ isOpen, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={tokens.cinematic}
          onClick={onClose}
        >
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close menu"
          >
            ×
          </button>
          <nav className={styles.linkList} onClick={(e) => e.stopPropagation()}>
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ ...tokens.cinematic, delay: i * 0.12 }}
              >
                <Link
                  href={link.href}
                  className={styles.mobileLink}
                  onClick={onClose}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
