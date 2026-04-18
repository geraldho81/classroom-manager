'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, RotateCcw, Maximize } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { soundManager } from '@/lib/sounds'
import { useSettingsStore } from '@/stores/settingsStore'

const PRESETS = [5, 10, 15, 30, 60]

export function CountdownTransition() {
  const { soundEnabled } = useSettingsStore()
  const [duration, setDuration] = useState(10)
  const [remaining, setRemaining] = useState(10)
  const [state, setState] = useState<'idle' | 'running' | 'go' | 'done'>('idle')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const soundEnabledRef = useRef(soundEnabled)
  soundEnabledRef.current = soundEnabled

  const start = useCallback(() => {
    setRemaining(duration)
    setState('running')
    if (soundEnabledRef.current) soundManager.playSound('tick')
  }, [duration])

  const reset = useCallback(() => {
    setRemaining(duration)
    setState('idle')
  }, [duration])

  useEffect(() => {
    if (state !== 'running') return
    if (remaining <= 0) {
      setState('go')
      if (soundEnabledRef.current) soundManager.playSound('fanfare')
      setTimeout(() => setState('done'), 1500)
      return
    }
    const t = setTimeout(() => {
      setRemaining((r) => r - 1)
      if (soundEnabledRef.current) {
        if (remaining <= 4) soundManager.playSound('pop')
        else soundManager.playSound('tick')
      }
    }, 1000)
    return () => clearTimeout(t)
  }, [state, remaining])

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === ' ') {
        e.preventDefault()
        if (state === 'idle' || state === 'done') start()
        else reset()
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state, start, reset, toggleFullscreen])

  const showNumber = state === 'running' ? remaining : state === 'idle' || state === 'done' ? duration : 0

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-col items-center',
        isFullscreen &&
          'min-h-screen p-8 bg-gradient-to-br from-orange-400 via-rose-500 to-pink-500 text-white'
      )}
    >
      <Card
        className={cn(
          'w-full max-w-3xl',
          isFullscreen && 'bg-white/10 backdrop-blur-sm border-white/20'
        )}
      >
        <CardContent className="p-10 sm:p-16">
          <div className="text-center">
            {state === 'go' ? (
              <div className="font-black tracking-tighter text-[18vw] sm:text-[180px] leading-none bg-gradient-to-r from-emerald-400 via-lime-400 to-yellow-400 bg-clip-text text-transparent animate-bounce">
                GO!
              </div>
            ) : (
              <div
                key={showNumber}
                className={cn(
                  'font-black tabular-nums leading-none',
                  'text-[26vw] sm:text-[220px]',
                  'bg-gradient-to-b from-rose-500 to-fuchsia-600 bg-clip-text text-transparent',
                  state === 'running' && 'animate-ping-short'
                )}
              >
                {showNumber}
              </div>
            )}

            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              {state === 'running' ? (
                <Button variant="warning" size="xl" onClick={reset} className="text-xl">
                  <RotateCcw className="mr-2 h-5 w-5" /> Cancel
                </Button>
              ) : (
                <Button variant="fun" size="xl" onClick={start} className="min-w-[180px] text-xl">
                  <Play className="mr-2 h-5 w-5" />
                  {state === 'done' ? 'Again' : 'Start'}
                </Button>
              )}
              <Button variant="ghost" size="icon-lg" onClick={toggleFullscreen}>
                <Maximize className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isFullscreen && (
        <>
          <div className="mt-8">
            <p className="text-center text-sm font-bold uppercase tracking-wider text-stone-500 mb-3">
              Duration
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {PRESETS.map((s) => (
                <Button
                  key={s}
                  variant={duration === s ? 'secondary' : 'outline'}
                  size="lg"
                  onClick={() => {
                    setDuration(s)
                    setRemaining(s)
                    setState('idle')
                  }}
                >
                  {s}s
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 justify-center text-sm font-bold text-stone-400">
            <span className="flex items-center gap-2 bg-stone-100 px-3 py-1 rounded-full">
              <kbd className="px-2 py-0.5 bg-white rounded text-stone-700">Space</kbd> Start / Cancel
            </span>
            <span className="flex items-center gap-2 bg-stone-100 px-3 py-1 rounded-full">
              <kbd className="px-2 py-0.5 bg-white rounded text-stone-700">F</kbd> Fullscreen
            </span>
          </div>
        </>
      )}
    </div>
  )
}
