'use client'

import { useEffect, useRef, useState } from 'react'
import { Maximize2, Minimize2, Pause, Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { soundManager } from '@/lib/sounds'
import { useSettingsStore } from '@/stores/settingsStore'

type VoiceKey = 'silent' | 'whisper' | 'partner' | 'group'

const VOICE: Record<VoiceKey, { label: string; emoji: string; bg: string }> = {
  silent: { label: 'Silent', emoji: '🤫', bg: 'from-rose-500 to-red-600' },
  whisper: { label: 'Whisper', emoji: '🤏', bg: 'from-amber-400 to-yellow-500' },
  partner: { label: 'Partner', emoji: '👥', bg: 'from-sky-400 to-blue-500' },
  group: { label: 'Group', emoji: '🗣️', bg: 'from-emerald-400 to-green-500' },
}

const VOICE_ORDER: VoiceKey[] = ['silent', 'whisper', 'partner', 'group']

const PRESETS = [1, 3, 5, 10, 15]

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function formatClock(d: Date) {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function ClassroomDisplay() {
  const { soundEnabled } = useSettingsStore()
  const [now, setNow] = useState(() => new Date())
  const [voice, setVoice] = useState<VoiceKey>('silent')
  const [activity, setActivity] = useState('Warm-Up')
  const [secondsLeft, setSecondsLeft] = useState(5 * 60)
  const [running, setRunning] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false)
          if (soundEnabled) soundManager.playSound('bell')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, soundEnabled])

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  const setPreset = (minutes: number) => {
    setSecondsLeft(minutes * 60)
    setRunning(false)
  }

  const cycleVoice = () => {
    const i = VOICE_ORDER.indexOf(voice)
    setVoice(VOICE_ORDER[(i + 1) % VOICE_ORDER.length])
    if (soundEnabled) soundManager.playSound('click')
  }

  const v = VOICE[voice]
  const timerDone = secondsLeft === 0
  const timerUrgent = running && secondsLeft > 0 && secondsLeft <= 10

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative rounded-3xl overflow-hidden shadow-xl',
        isFullscreen ? 'h-screen bg-stone-900' : 'min-h-[70vh] bg-stone-900'
      )}
    >
      <Button
        onClick={toggleFullscreen}
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 text-white/70 hover:text-white hover:bg-white/10"
        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? (
          <Minimize2 className="h-5 w-5" />
        ) : (
          <Maximize2 className="h-5 w-5" />
        )}
      </Button>

      <div className="grid h-full gap-4 p-6 grid-cols-1 md:grid-cols-3 md:grid-rows-2">
        {/* Activity (spans top-left wide) */}
        <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-stone-800 to-stone-700 p-6 flex flex-col justify-center">
          <p className="text-white/60 text-sm uppercase tracking-wider font-bold">
            Now
          </p>
          <Input
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="mt-1 bg-transparent border-0 text-white text-5xl md:text-7xl font-black p-0 h-auto focus-visible:ring-0 placeholder:text-white/30"
            placeholder="Activity name"
          />
        </div>

        {/* Clock */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 flex flex-col items-center justify-center text-white shadow-lg">
          <p className="text-white/80 text-sm uppercase tracking-wider font-bold">
            Time
          </p>
          <div className="text-5xl md:text-6xl font-black tabular-nums drop-shadow">
            {formatClock(now)}
          </div>
        </div>

        {/* Timer (wide) */}
        <div
          className={cn(
            'md:col-span-2 rounded-2xl p-6 flex flex-col items-center justify-center text-white shadow-lg transition-colors',
            timerDone
              ? 'bg-gradient-to-br from-emerald-500 to-green-600'
              : timerUrgent
              ? 'bg-gradient-to-br from-rose-500 to-red-600 animate-pulse'
              : 'bg-gradient-to-br from-blue-500 to-cyan-600'
          )}
        >
          <p className="text-white/80 text-sm uppercase tracking-wider font-bold">
            {timerDone ? "Time's Up" : running ? 'Counting Down' : 'Timer'}
          </p>
          <div className="text-7xl md:text-8xl font-black tabular-nums drop-shadow">
            {formatTime(secondsLeft)}
          </div>
          <div className="mt-4 flex items-center gap-2 flex-wrap justify-center">
            <Button
              size="sm"
              onClick={() => setRunning((r) => !r)}
              disabled={secondsLeft === 0 && !running}
              className="bg-white text-stone-800 hover:bg-white/90"
            >
              {running ? (
                <Pause className="mr-1 h-4 w-4" />
              ) : (
                <Play className="mr-1 h-4 w-4" />
              )}
              {running ? 'Pause' : 'Start'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setRunning(false)
                setSecondsLeft(5 * 60)
              }}
              className="bg-white/10 border-white/40 text-white hover:bg-white/20"
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Reset
            </Button>
            {PRESETS.map((m) => (
              <Button
                key={m}
                size="sm"
                variant="ghost"
                onClick={() => setPreset(m)}
                className="bg-white/10 text-white hover:bg-white/20 text-xs font-bold"
              >
                {m}m
              </Button>
            ))}
          </div>
        </div>

        {/* Voice level */}
        <button
          onClick={cycleVoice}
          className={cn(
            'rounded-2xl p-6 flex flex-col items-center justify-center text-white shadow-lg transition-all',
            'bg-gradient-to-br hover:scale-[1.02] cursor-pointer',
            v.bg
          )}
        >
          <p className="text-white/90 text-sm uppercase tracking-wider font-bold">
            Voice Level
          </p>
          <div className="text-6xl md:text-7xl drop-shadow">{v.emoji}</div>
          <div className="text-2xl md:text-3xl font-black drop-shadow">
            {v.label}
          </div>
          <p className="mt-1 text-xs text-white/80">Tap to cycle</p>
        </button>
      </div>
    </div>
  )
}
