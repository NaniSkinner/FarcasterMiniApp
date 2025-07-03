import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ChainCal Frame',
  description: 'On-chain calendar reminders for Farcaster',
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
