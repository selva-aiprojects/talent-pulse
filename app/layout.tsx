import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TalentPulse — Recruitment Intelligence Platform',
  description: 'Enterprise AI Recruitment Hub',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', url: '/icon' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}