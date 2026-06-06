// app/layout.tsx
import type { Metadata } from 'next'
import { Space_Grotesk, Instrument_Sans, JetBrains_Mono } from 'next/font/google'
import { Nav } from '@/components/nav/Nav'
import { BoidsCanvasWrapper } from '@/components/cursor/BoidsCanvasWrapper'
import '@/styles/global.css'
import '@/styles/typography.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Museum of Little Things',
  description: 'A curated exhibition of work built with care.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${instrumentSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <BoidsCanvasWrapper />
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  )
}
