// app/layout.tsx
import type { Metadata } from 'next'
import { Space_Grotesk, Instrument_Sans, JetBrains_Mono } from 'next/font/google'
import { Nav } from '@/components/nav/Nav'
import { BoidsCanvasWrapper } from '@/components/cursor/BoidsCanvasWrapper'
import { PageTransition } from '@/components/page-transition/PageTransition'
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
        <style>{`
          ::view-transition-old(panel-hero) { animation: none; }
          ::view-transition-new(panel-hero) { animation: vta-expand-in 500ms cubic-bezier(0.16, 1, 0.3, 1); }
          @keyframes vta-expand-in {
            from { transform: scale(0.95); opacity: 0; }
            to   { transform: scale(1);    opacity: 1; }
          }
        `}</style>
        <BoidsCanvasWrapper />
        <Nav />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  )
}
