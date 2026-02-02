'use client'

import { Sidebar } from '@/components/Sidebar'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { usePathname } from 'next/navigation'

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const { sidebarCollapsed, toggleSidebar } = useUIStore()
    const [mounted, setMounted] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        setMounted(true)
    }, [])

    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup') || pathname === '/debug'

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="min-h-screen bg-background opacity-0">
                {!isAuthPage && <Sidebar />}
                <main className={cn("min-h-screen transition-all duration-300", !isAuthPage && "lg:pl-72")}>
                    <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">{children}</div>
                </main>
            </div>
        )
    }

    if (isAuthPage) {
        return (
            <div className="min-h-screen bg-background">
                <main className="min-h-screen">
                    {children}
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Sidebar />

            {/* Mobile Toggle Trigger (when sidebar is hidden on small screens) */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            <main
                className={cn(
                    "min-h-screen transition-all duration-300 ease-in-out",
                    sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
                )}
            >
                <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
