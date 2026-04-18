'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw, Flag, Maximize } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { soundManager } from '@/lib/sounds'
import { useSettingsStore } from '@/stores/settingsStore'

function formatMs(totalMs: number) {
  const totalSec = Math.floor(totalMs / 1000)
  const hrs = Math.floor(totalSec / 3600)
  const mins = Math.floor((totalSec % 3600) / 60)
  const secs = totalSec % 60
  const hundredths = Math.floor((totalMs % 1000) / 10)
  const mm = mins.toString().padStart(2, '0')
  const ss = secs.toString().padStart(2, '0')
  const hh = hundredths.toString().padStart(2, '0')
  if (hrs > 0) return `${hrs}:${mm}:${ss}.${hh}`
  return `${mm}:${ss}.${hh}`
}

export function Stopwatch() {
  const { soundEnabled } = useSettingsStore()
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)

  const startRef = useRef<number>(0)
  const accumRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const tick = useCallback(() => {
    setElapsed(accumRef.current + (performance.now() - startRef.current))
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const start = useCallback(() => {
    if (isRunning) return
    startRef.current = performance.now()
    setIsRunning(true)
    rafRef.current = requestAnimationFrame(tick)
    if (soundEnabled) soundManager.playSound('click')
  }, [isRunning, tick, soundEnabled])

  const pause = useCallback(() => {
    if (!isRunning) return
    accumRef.current += performance.now() - startRef.current
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    setIsRunning(false)
    setElapsed(accumRef.current)
    if (soundEnabled) soundManager.playSound('click')
  }, [isRunning, soundEnabled])

  const reset = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    accumRef.current = 0
    setElapsed(0)
    setIsRunning(false)
    setLaps([])
    if (soundEnabled) soundManager.playSound('pop')
  }, [soundEnabled])

  const lap = useCallback(() => {
    setLaps((l) => [elapsed, ...l])
    if (soundEnabled) soundManager.playSound('pop')
  }, [elapsed, soundEnabled])

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
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      switch (e.key) {
        case ' ':
          e.preventDefault()
          isRunning ? pause() : start()
          break
        case 'l':
        case 'L':
          if (isRunning) lap()
          break
        case 'r':
        case 'R':
          reset()
          break
        case 'f':
        case 'F':
          toggleFullscreen()
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isRunning, start, pause, lap, reset, toggleFullscreen])

  const fastestLap = laps.length > 0 ? Math.min(...laps.map((t, i) => (i === laps.length - 1 ? t : t - laps[i + 1]))) : null
  const slowestLap = laps.length > 0 ? Math.max(...laps.map((t, i) => (i === laps.length - 1 ? t : t - laps[i + 1]))) : null

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-col items-center justify-center',
        isFullscreen && 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 min-h-screen p-8'
      )}
    >
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8 sm:p-12 bg-gradient-to-br from-white to-indigo-50">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {isRunning ? '⏱️' : elapsed > 0 ? '⏸️' : '⏲️'}
            </div>
            <div
              className={cn(
                'projection-text tabular-nums mb-6',
                isRunning ? 'text-indigo-600' : 'text-stone-700'
              )}
            >
              {formatMs(elapsed)}
            </div>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button
                variant={isRunning ? 'warning' : 'success'}
                size="xl"
                onClick={isRunning ? pause : start}
                className="min-w-[150px] text-xl"
              >
                {isRunning ? (
                  <>
                    <Pause className="mr-2 h-6 w-6" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-6 w-6" /> Start
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={lap}
                disabled={!isRunning}
                className="text-xl"
              >
                <Flag className="mr-2 h-5 w-5" /> Lap
              </Button>
              <Button variant="ghost" size="xl" onClick={reset} className="text-xl">
                <RotateCcw className="mr-2 h-5 w-5" /> Reset
              </Button>
              <Button variant="ghost" size="icon-lg" onClick={toggleFullscreen}>
                <Maximize className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {laps.length > 0 && (
        <Card className="w-full max-w-2xl mt-6">
          <CardContent className="p-6">
            <h3 className="font-black text-stone-700 mb-3">
              Laps ({laps.length})
            </h3>
            <div className="max-h-[260px] overflow-y-auto pr-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm text-stone-500 border-b border-stone-100">
                    <th className="py-2 font-bold">#</th>
                    <th className="py-2 font-bold">Split</th>
                    <th className="py-2 font-bold text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {laps.map((total, i) => {
                    const split = i === laps.length - 1 ? total : total - laps[i + 1]
                    const isFastest = split === fastestLap
                    const isSlowest = split === slowestLap && laps.length > 1
                    return (
                      <tr
                        key={i}
                        className={cn(
                          'border-b border-stone-50 text-stone-700 tabular-nums',
                          isFastest && 'text-emerald-600 font-bold',
                          isSlowest && 'text-rose-500 font-bold'
                        )}
                      >
                        <td className="py-2 font-bold">{laps.length - i}</td>
                        <td className="py-2">{formatMs(split)}</td>
                        <td className="py-2 text-right">{formatMs(total)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {!isFullscreen && (
        <div className="mt-6 flex flex-wrap gap-3 justify-center text-sm font-bold text-stone-400">
          <span className="flex items-center gap-2 bg-stone-100 px-3 py-1 rounded-full">
            <kbd className="px-2 py-0.5 bg-white rounded text-stone-700">Space</kbd> Start / Pause
          </span>
          <span className="flex items-center gap-2 bg-stone-100 px-3 py-1 rounded-full">
            <kbd className="px-2 py-0.5 bg-white rounded text-stone-700">L</kbd> Lap
          </span>
          <span className="flex items-center gap-2 bg-stone-100 px-3 py-1 rounded-full">
            <kbd className="px-2 py-0.5 bg-white rounded text-stone-700">R</kbd> Reset
          </span>
          <span className="flex items-center gap-2 bg-stone-100 px-3 py-1 rounded-full">
            <kbd className="px-2 py-0.5 bg-white rounded text-stone-700">F</kbd> Fullscreen
          </span>
        </div>
      )}
    </div>
  )
}
