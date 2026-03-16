import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'runagent.art — Agents Rule Tomorrow',
  description: 'Build and run AI agent pipelines. Learn by playing.',
  keywords: ['AI agents', 'automation', 'pipeline', 'GhostFactory'],
  openGraph: {
    title: 'runagent.art',
    description: 'Build and run AI agent pipelines. Learn by playing.',
    siteName: 'runagent.art',
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
