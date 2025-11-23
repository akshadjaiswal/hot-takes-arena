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
  openGraph: {
    title: 'Hot Takes Arena',
    description: 'Where opinions collide - Share your hot takes anonymously',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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
