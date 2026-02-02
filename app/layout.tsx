import type { Metadata, Viewport } from 'next'
import { Patrick_Hand, Quicksand } from 'next/font/google'
import './globals.css'
import { ClientLayout } from '@/components/ClientLayout'
import { ConfirmProvider } from '@/components/ui/confirm-dialog'
import { AuthProvider } from '@/contexts/AuthContext'
import { ClassProvider } from '@/contexts/ClassContext'

const patrickHand = Patrick_Hand({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-patrick',
})

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-quicksand',
})

export const metadata: Metadata = {
  title: 'Classroom Manager',
  description:
    'A whimsical, cozy classroom management tool.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FFB7B2',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${patrickHand.variable} ${quicksand.variable} font-sans`}>
        <AuthProvider>
          <ClassProvider>
            <ConfirmProvider>
              <ClientLayout>
                {children}
              </ClientLayout>
            </ConfirmProvider>
          </ClassProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
