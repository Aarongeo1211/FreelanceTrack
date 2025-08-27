import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FreelanceTrack - Freelancer Management System',
  description: 'A comprehensive freelance tracking application for managing clients, projects, tasks, and finances. Built with Next.js, TypeScript, and Prisma.',
  keywords: 'freelance, project management, client management, invoice generator, task tracking, financial tracking',
  authors: [{ name: 'Aaron George Abraham', url: 'https://github.com/aarongeorge' }],
  creator: 'Aaron George Abraham',
  publisher: 'Aaron George Abraham',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
    ],
    apple: [
      { url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3B82F6',
  colorScheme: 'light',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://freelancetrack.vercel.app',
    siteName: 'FreelanceTrack',
    title: 'FreelanceTrack - Freelancer Management System',
    description: 'Comprehensive freelance management platform for clients, projects, tasks, and finances.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FreelanceTrack - Freelancer Management System',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@aarongeorge',
    creator: '@aarongeorge',
    title: 'FreelanceTrack - Freelancer Management System',
    description: 'Comprehensive freelance management platform for clients, projects, tasks, and finances.',
    images: ['/og-image.png'],
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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}