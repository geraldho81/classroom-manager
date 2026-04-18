'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Repeat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { soundManager } from '@/lib/sounds'
import { useSettingsStore } from '@/stores/settingsStore'

type Pattern = {
  id: string
  name: string
  description: string
  beats: number[]
  gradient: string
}

const PATTERNS: Pattern[] = [
  {
    id: 'twice',
    name: 'Clap Twice',
    description: 'Clap, clap',
    beats: [0, 250],
    gradient: 'from-amber-300 to-orange-400',
  },
  {
    id: 'shave',
    name: 'Shave & Haircut',
    description: 'Clap-clap-cla-clap-clap',
    beats: [0, 300, 450, 600, 900],
    gradient: 'from-rose-300 to-pink-500',
  },
  {
    id: 'we-will',
    name: 'We Will Rock You',
    description: 'Boom-boom-clap',
    beats: [0, 220, 500],
    gradient: 'from-sky-300 to-indigo-500',
  },
  {
    id: 'triple',
    name: 'Three Fast',
    description: 'Clap-clap-clap',
    beats: [0, 160, 320],
    gradient: 'from-emerald-300 to-teal-500',
  },
  {
    id: 'five',
    name: 'Five in a Row',
    description: 'Clap clap clap clap clap',
    beats: [0, 200, 400, 600, 800],
    gradient: 'from-fuchsia-300 to-purple-500',
  },
  {
    id: 'call-response',
    name: 'Call & Response',
    description: 'Long–short–short',
    beats: [0, 500, 700],
    gradient: 'from-cyan-300 to-blue-500',
  },
]

export function ClapEcho() {
  const { soundEnabled } = useSettingsStore()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [flash, setFlash] = useState(false)
  const timeoutsRef = useRef<number[]>([])

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
    }
  }, [])

  const play = (pattern: Pattern) => {
    if (activeId) return
    setActiveId(pattern.id)
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []

    pattern.beats.forEach((offset) => {
      const id = window.setTimeout(() => {
        if (soundEnabled) soundManager.playSound('clap')
        setFlash(true)
        window.setTimeout(() => setFlash(false), 80)
      }, offset)
      timeoutsRef.current.push(id)
    })

    const last = pattern.beats[pattern.beats.length - 1]
    const endId = window.setTimeout(() => setActiveId(null), last + 350)
    timeoutsRef.current.push(endId)
  }

  return (
    <div className="space-y-6">
      <div
        className={cn(
          'rounded-3xl border-2 border-dashed py-10 text-center transition-colors',
          flash
            ? 'border-amber-400 bg-amber-100'
            : 'border-stone-300 bg-white/60'
        )}
      >
        <div className={cn('text-7xl transition-transform', flash && 'scale-125')}>
          👏
        </div>
        <p className="mt-3 text-sm font-bold text-stone-600">
          {activeId ? 'Listen...' : 'Pick a pattern for your class to echo.'}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PATTERNS.map((pattern) => {
          const isActive = activeId === pattern.id
          return (
            <Card
              key={pattern.id}
              className={cn(
                'bg-gradient-to-br text-white shadow-lg transition-transform',
                pattern.gradient,
                isActive && 'scale-[1.02] ring-4 ring-white/60'
              )}
            >
              <CardContent className="p-5">
                <h3 className="text-lg font-black">{pattern.name}</h3>
                <p className="text-sm text-white/90">{pattern.description}</p>
                <div className="mt-3 flex items-center gap-1">
                  {pattern.beats.map((_, i) => (
                    <span
                      key={i}
                      className="h-2 w-2 rounded-full bg-white/80"
                    />
                  ))}
                  <span className="ml-2 text-xs text-white/80">
                    {pattern.beats.length} claps
                  </span>
                </div>
                <Button
                  onClick={() => play(pattern)}
                  disabled={!!activeId}
                  className="mt-4 w-full bg-white text-stone-800 hover:bg-white/90"
                >
                  {isActive ? (
                    <Repeat className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  {isActive ? 'Playing...' : 'Play'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
