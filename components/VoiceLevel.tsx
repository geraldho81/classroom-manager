'use client'

import { useEffect, useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { soundManager } from '@/lib/sounds'
import { useSettingsStore } from '@/stores/settingsStore'

type Level = {
  key: string
  label: string
  sub: string
  emoji: string
  bg: string
  ring: string
}

const levels: Level[] = [
  {
    key: 'silent',
    label: 'Silent',
    sub: 'No talking — focused work',
    emoji: '🤫',
    bg: 'bg-gradient-to-br from-rose-500 to-red-600',
    ring: 'ring-rose-300',
  },
  {
    key: 'whisper',
    label: 'Whisper',
    sub: 'Quiet voices — shoulder partner',
    emoji: '🤏',
    bg: 'bg-gradient-to-br from-amber-400 to-yellow-500',
    ring: 'ring-amber-300',
  },
  {
    key: 'partner',
    label: 'Partner',
    sub: 'Table voice — small group',
    emoji: '👥',
    bg: 'bg-gradient-to-br from-sky-400 to-blue-500',
    ring: 'ring-sky-300',
  },
  {
    key: 'group',
    label: 'Group',
    sub: 'Full voice — class discussion',
    emoji: '📣',
    bg: 'bg-gradient-to-br from-emerald-400 to-green-500',
    ring: 'ring-emerald-300',
  },
]

export function VoiceLevel() {
  const { soundEnabled } = useSettingsStore()
  const [active, setActive] = useState<string>('whisper')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const current = levels.find((l) => l.key === active) || levels[0]

  const setLevel = (key: string) => {
    if (key === active) return
    setActive(key)
    if (soundEnabled) soundManager.playSound('pop')
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  return (
    <div className="space-y-6">
      <div
        className={cn(
          'relative rounded-3xl p-10 sm:p-16 text-center text-white shadow-2xl transition-all duration-500',
          current.bg
        )}
      >
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        <div className="text-8xl sm:text-9xl mb-4 drop-shadow-lg">{current.emoji}</div>
        <div className="text-5xl sm:text-7xl font-black drop-shadow-lg tracking-tight">
          {current.label}
        </div>
        <p className="mt-4 text-lg sm:text-2xl font-bold text-white/90 drop-shadow">
          {current.sub}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {levels.map((l) => (
          <button
            key={l.key}
            onClick={() => setLevel(l.key)}
            className={cn(
              'rounded-2xl p-4 text-white font-black text-lg transition-all shadow-lg',
              l.bg,
              active === l.key
                ? cn('scale-105 ring-4', l.ring)
                : 'opacity-70 hover:opacity-100 hover:scale-105'
            )}
          >
            <div className="text-3xl mb-1">{l.emoji}</div>
            <div className="drop-shadow">{l.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
