'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Timer,
  Clock,
  Users,
  Volume2,
  Dices,
  StickyNote,
  UsersRound,
  Settings,
  Home,
  X,
  Menu,
  BookOpen,
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { useUIStore } from '@/stores/uiStore'
import { useAuth } from '@/contexts/AuthContext'
import { ClassSelector } from './ClassSelector'

const navigation = [
  { name: 'Home', href: '/', icon: Home, color: 'text-amber-700', tooltip: 'Return to the main dashboard and choose a tool.' },
  { name: 'Timer', href: '/timer', icon: Timer, color: 'text-blue-500', tooltip: 'Set countdown or count-up timers for activities.' },
  { name: 'Time Loss', href: '/time-loss', icon: Clock, color: 'text-rose-500', tooltip: 'Track time lost due to interruptions.' },
  { name: 'My Classes', href: '/classes', icon: BookOpen, color: 'text-stone-600', tooltip: 'Create and manage your classroom groups.' },
  { name: 'Class List', href: '/class-list', icon: UsersRound, color: 'text-emerald-600', tooltip: 'View and manage students in your class.' },
  { name: 'Pick Me!', href: '/picker', icon: Users, color: 'text-purple-500', tooltip: 'Randomly select students to participate.' },
  { name: 'Shh! Meter', href: '/noise', icon: Volume2, color: 'text-cyan-600', tooltip: 'Monitor classroom noise levels in real-time.' },
  { name: 'Dice & Coin', href: '/dice', icon: Dices, color: 'text-orange-500', tooltip: 'Roll dice or flip coins for activities.' },
  { name: 'Notes', href: '/notes', icon: StickyNote, color: 'text-pink-500', tooltip: 'Jot down quick notes and reminders.' },
  { name: 'Groups', href: '/groups', icon: UsersRound, color: 'text-indigo-500', tooltip: 'Generate random groups from your class.' },
  { name: 'Settings', href: '/settings', icon: Settings, color: 'text-slate-500', tooltip: 'Configure your preferences.' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { profile, signOut } = useAuth()
  const [hoveredTooltip, setHoveredTooltip] = useState<{ text: string; top: number } | null>(null)

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile Overlay (handled by ClientLayout for opening logic, but this is for closing via overlay) */}
      <div
        className={cn(
          "fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-40 lg:hidden",
          /* In mobile, we might rely on a separate state or re-use sidebarCollapsed logic differently. 
             For this implementation, let's assume mobile uses sidebarCollapsed=false to show, true to hide?
             Actually, standard practice is separate mobile state. 
             Let's rely on ClientLayout handling the mobile trigger, and sidebar just responding to props or store.
             WAIT: ClientLayout has `mounted` state. 
             Let's simplify: Sidebar reads store. If collapsed=false (default), it shows on mobile? 
             Usually mobile defaults to hidden. 
             Let's stick to Desktop Toggle mostly. 
             For mobile, let's just use the `sidebarCollapsed` as "IsOpen" equivalent? 
             In uiStore: sidebarCollapsed defaults to false. 
             On mobile, false means OPEN? No, typically collapsed=true means closed. 
             Let's assume mobile logic: 
             By default on Mobile we want it closed (collapsed=true). 
             By default on Desktop we want it open (collapsed=false).
             For now, let's render the detailed sidebar logic */
          "hidden" // Hiding overlay for now to focus on Desktop Toggle per request
        )}
      />

      {/* Sidebar - Book Spine Style */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out',
          'bg-[#F2EFE5] border-r-4 border-[#E6E2D6]', // Parchment color with spine border
          'flex flex-col shadow-xl',
          sidebarCollapsed ? 'w-20' : 'w-72',
          'lg:translate-x-0', // Always show on desktop
          '-translate-x-full lg:translate-x-0' // Hidden on mobile by default (controlled by external class?)
          // actually, let's handle the mobile transform logic later if needed, user asked specifically for sidebar toggle which implies desktop usually.
        )}
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, #E6E2D6 20px)'
        }}
      >
        {/* Toggle Button (Desktop) */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-8 bg-white border-2 border-[#E6E2D6] rounded-full p-1 text-stone-400 hover:text-stone-600 hover:scale-110 transition-all shadow-sm z-50 hidden lg:block"
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className="flex flex-col h-full bg-white/50 backdrop-blur-[1px] overflow-hidden">
          {/* Logo */}
          <div className={cn(
            "py-6 flex items-center transition-all duration-300",
            sidebarCollapsed ? "px-2 justify-center" : "px-6 border-b-2 border-dashed border-stone-300"
          )}>
            <div className="inline-flex items-center justify-center p-2 bg-white rounded-full shadow-sm ring-4 ring-amber-100 shrink-0">
              <BookOpen className="w-8 h-8 text-amber-700" />
            </div>
            {!sidebarCollapsed && (
              <div className="ml-3 overflow-hidden">
                <h1 className="font-heading text-lg leading-tight text-stone-800">
                  Classroom<br />Manager
                </h1>
              </div>
            )}
          </div>

          {!sidebarCollapsed && (
            <div className="px-4 mb-2">
              <ClassSelector />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto no-scrollbar">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center rounded-lg transition-all duration-300 group',
                    sidebarCollapsed ? 'justify-center p-3' : 'px-4 py-3 gap-3',
                    isActive
                      ? 'bg-white shadow-[2px_2px_0px_#d6d3c9] text-stone-800 -translate-y-0.5'
                      : 'text-stone-600 hover:bg-white/60'
                  )}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon
                    className={cn(
                      'w-6 h-6 transition-transform group-hover:scale-110 shrink-0',
                      item.color,
                      isActive && 'animate-pulse'
                    )}
                  />
                  {!sidebarCollapsed && (
                    <>
                      <span className="font-heading text-lg whitespace-nowrap flex items-center gap-1.5">
                        {item.name}
                        <Info
                          className="w-3 h-3 text-stone-500 hover:text-stone-700 cursor-help transition-colors"
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            setHoveredTooltip({ text: item.tooltip, top: rect.top + rect.height / 2 })
                          }}
                          onMouseLeave={() => setHoveredTooltip(null)}
                          onClick={(e) => e.preventDefault()}
                        />
                      </span>
                      {isActive && <span className="ml-auto text-amber-400">★</span>}
                    </>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer / User */}
          <div className="p-4 border-t-2 border-dashed border-stone-300 bg-white/30">
            {profile && !sidebarCollapsed && (
              <div className="bg-white/40 rounded-xl px-3 py-2 mb-2">
                <p className="text-stone-500 text-xs font-heading">Classroom by</p>
                <p className="text-stone-800 font-bold truncate text-sm">
                  {profile.first_name}
                </p>
              </div>
            )}

            <Button
              variant="ghost"
              className={cn(
                "w-full text-stone-500 hover:text-stone-700 hover:bg-white/50",
                sidebarCollapsed ? "px-0 justify-center" : "justify-start"
              )}
              onClick={handleSignOut}
              title="Sign Out"
            >
              <LogOut className={cn("h-5 w-5", !sidebarCollapsed && "mr-2")} />
              {!sidebarCollapsed && "Sign Out"}
            </Button>
          </div>
        </div>

        {/* Floating tooltip for nav items */}
        {hoveredTooltip && !sidebarCollapsed && (
          <div
            className="fixed z-[200] w-48 p-2 bg-stone-800 text-white text-xs rounded-lg shadow-lg pointer-events-none"
            style={{
              left: '290px',
              top: hoveredTooltip.top,
              transform: 'translateY(-50%)',
            }}
          >
            {hoveredTooltip.text}
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-stone-800 rotate-45" />
          </div>
        )}
      </aside>
    </>
  )
}
