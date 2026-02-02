'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Play, Square, RotateCcw, Maximize, AlertTriangle, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { formatTime, formatTimeVerbose, cn, getCurrentDateKey } from '@/lib/utils'
import { soundManager } from '@/lib/sounds'
import { useSettingsStore } from '@/stores/settingsStore'

export function TimeLoss() {
  const {
    soundEnabled,
    addTimeLoss,
    resetDailyTimeLoss,
    currentTimeLossSession,
    setCurrentTimeLossSession,
    getTodayTimeLoss,
    timeLossData,
  } = useSettingsStore()
  const confirm = useConfirm()

  const [isTracking, setIsTracking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const todayTotal = getTodayTimeLoss()
  const today = getCurrentDateKey()

  const startTracking = useCallback(() => {
    setIsTracking(true)
    setIsPaused(false)
    if (soundEnabled) {
      soundManager.playSound('alert')
    }
  }, [soundEnabled])

  const resumeTracking = useCallback(() => {
    setIsTracking(true)
    setIsPaused(false)
    if (soundEnabled) {
      soundManager.playSound('click')
    }
  }, [soundEnabled])

  const pauseTracking = useCallback(() => {
    setIsTracking(false)
    setIsPaused(true)
    if (soundEnabled) {
      soundManager.playSound('click')
    }
  }, [soundEnabled])

  const stopTracking = useCallback(() => {
    setIsTracking(false)
    setIsPaused(false)
    if (sessionTime > 0) {
      addTimeLoss(sessionTime)
      setSessionTime(0)
    }
  }, [sessionTime, addTimeLoss])

  const toggleTracking = useCallback(() => {
    if (isTracking || isPaused) {
      stopTracking()
    } else {
      startTracking()
    }
  }, [isTracking, isPaused, startTracking, stopTracking])

  const resetToday = useCallback(async () => {
    const ok = await confirm({
      title: 'Reset Today\'s Data?',
      message: 'This will clear all time loss tracking for today.',
      confirmText: 'Yes, reset',
      variant: 'warning',
      emoji: '🔄',
    })
    if (ok) {
      resetDailyTimeLoss()
      setSessionTime(0)
      setIsTracking(false)
      setIsPaused(false)
    }
  }, [resetDailyTimeLoss, confirm])

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isTracking) {
      interval = setInterval(() => {
        setSessionTime((prev) => {
          const newTime = prev + 1
          setCurrentTimeLossSession(newTime)
          return newTime
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isTracking, setCurrentTimeLossSession])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          toggleTracking()
          break
        case 'f':
        case 'F':
          toggleFullscreen()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleTracking, toggleFullscreen])

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Weekly total calculation
  const getWeeklyTotal = () => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    return Object.entries(timeLossData).reduce((total, [date, seconds]) => {
      if (new Date(date) >= weekAgo) {
        return total + seconds
      }
      return total
    }, 0)
  }

  const weeklyTotal = getWeeklyTotal() + (isTracking || isPaused ? sessionTime : 0)

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-col items-center justify-center',
        isFullscreen && 'bg-background min-h-screen p-8'
      )}
    >
      {/* Main Display */}
      <Card
        className={cn(
          'w-full max-w-3xl overflow-hidden transition-all',
          isTracking && 'ring-4 ring-red-500 bg-red-500/5'
        )}
      >
        <CardContent className="p-8 sm:p-12">
          <div className="text-center">
            {/* Status Indicator */}
            {isTracking && (
              <div className="flex items-center justify-center gap-2 mb-4 animate-pulse-slow">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <span className="text-red-500 font-semibold uppercase tracking-wider">
                  Time Being Lost
                </span>
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            )}

            {/* Current Session */}
            <div
              className={cn(
                'projection-text tabular-nums mb-6 transition-colors font-black text-7xl sm:text-9xl tracking-tighter',
                isTracking ? 'text-red-500 scale-105 transform' : 'text-stone-700'
              )}
            >
              {formatTime(sessionTime)}
            </div>

            <p className="text-muted-foreground mb-8">Current Session</p>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Button
                variant={isTracking ? 'destructive' : 'default'}
                size="xl"
                onClick={toggleTracking}
                className={cn(
                  'min-w-[160px]',
                  isTracking && 'animate-pulse-slow'
                )}
              >
                {isTracking || isPaused ? (
                  <>
                    <Square className="mr-2 h-5 w-5" /> Stop
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" /> Start
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={isPaused ? resumeTracking : pauseTracking}
                disabled={!isTracking && !isPaused}
                className="min-w-[160px]"
              >
                {isPaused ? (
                  <>
                    <Play className="mr-2 h-5 w-5" /> Resume
                  </>
                ) : (
                  <>
                    <Pause className="mr-2 h-5 w-5" /> Pause
                  </>
                )}
              </Button>
              <Button variant="ghost" size="icon-lg" onClick={toggleFullscreen}>
                <Maximize className="h-5 w-5" />
              </Button>
            </div>

            {/* Daily Total */}
            <div className="bg-secondary/50 rounded-xl p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Today's Total</p>
                  <p className="text-3xl font-bold text-red-500 tabular-nums">
                    {formatTimeVerbose(todayTotal + sessionTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">This Week</p>
                  <p className="text-3xl font-bold tabular-nums">
                    {formatTimeVerbose(weeklyTotal)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={resetToday}
        className="mt-6 text-muted-foreground"
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Reset Today's Data
      </Button>

      {/* Instructions */}
      {!isFullscreen && (
        <div className="mt-8 max-w-lg text-center">
          <h3 className="font-semibold mb-2">How to Use</h3>
          <p className="text-sm text-muted-foreground">
            Click <strong>Start</strong> when class time is being wasted (off-task
            behavior, disruptions, excessive transitions). The timer counts up,
            showing students exactly how much learning time is being lost. Click{' '}
            <strong>Stop</strong> when class refocuses.
          </p>
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      {!isFullscreen && (
        <div className="mt-4 text-xs text-muted-foreground text-center">
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-secondary rounded">Space</kbd>{' '}
            Start/Stop
          </span>
          <span className="mx-3">|</span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-secondary rounded">F</kbd> Fullscreen
          </span>
        </div>
      )}
    </div>
  )
}
