import { Nunito } from 'next/font/google'
import { Sidebar } from '@/components/Sidebar'
import { ConfirmProvider } from '@/components/ui/confirm-dialog'
import { AuthProvider } from '@/contexts/AuthContext'
import { ClassProvider } from '@/contexts/ClassContext'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
})

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ClassProvider>
        <ConfirmProvider>
          <div className={`${nunito.className} min-h-screen`}>
            <Sidebar />
            <main className="lg:pl-72 min-h-screen">
              <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">{children}</div>
            </main>
          </div>
        </ConfirmProvider>
      </ClassProvider>
    </AuthProvider>
  )
}
