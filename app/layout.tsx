import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'agenti.art — Agents Rule Tomorrow',
  description: 'Build and run AI agent pipelines. Learn by playing.',
  keywords: ['AI agents', 'automation', 'pipeline', 'GhostFactory'],
  openGraph: {
    title: 'agenti.art',
    description: 'Build and run AI agent pipelines. Learn by playing.',
    siteName: 'agenti.art',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
