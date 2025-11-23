import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/lib/query-provider'
import { Header } from '@/components/layout/Header'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600'] })

export const metadata: Metadata = {
  title: 'Hot Takes Arena - Where Opinions Collide',
  description: 'Share your controversial opinions anonymously and discover how divisive your takes really are through community voting.',
  keywords: 'hot takes, opinions, controversial, voting, debate, community',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-icon', sizes: '180x180' },
    ],
  },
  openGraph: {
    title: 'Hot Takes Arena',
    description: 'Where opinions collide - Share your hot takes anonymously',
    type: 'website',
  },
  themeColor: '#EF4444',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/icon" type="image/png" />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              style: {
                borderRadius: '8px',
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  )
}
