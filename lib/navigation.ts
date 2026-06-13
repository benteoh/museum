// lib/navigation.ts
export type NavLink = {
  href: string
  label: string
}

export const NAV_LINKS: NavLink[] = [
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
  { href: '/thoughts', label: 'Thoughts' },
]
