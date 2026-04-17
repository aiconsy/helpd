import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: 'HelpD — Factory Floor Support',
  description:
    'Real-time production issue tracking for factory floors. Workers report, First Line Support responds, admins oversee — all in one place.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'HelpD — Factory Floor Support',
    description:
      'Real-time production issue tracking for factory floors. Workers, FLS, and admins working as one system.',
    type: 'website'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563EB'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HelpD" />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  )
}
