'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Play, Pause, RotateCcw, Maximize, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatTime, cn } from '@/lib/utils'
import { soundManager } from '@/lib/sounds'
import { useSettingsStore } from '@/stores/settingsStore'

type TimerMode = 'countdown' | 'countup'

export function Timer() {
  const { timerPresets, soundEnabled } = useSettingsStore()
  const [mode, setMode] = useState<TimerMode>('countdown')
  const [time, setTime] = useState(300)
  const [initialTime, setInitialTime] = useState(300)
  const [isRunning, setIsRunning] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const startTimer = useCallback(() => {
    setIsRunning(true)
    setIsFinished(false)
  }, [])

  const pauseTimer = useCallback(() => {
    setIsRunning(false)
  }, [])

  const resetTimer = useCallback(() => {
    setIsRunning(false)
    setIsFinished(false)
    setShowConfetti(false)
    if (mode === 'countdown') {
      setTime(initialTime)
    } else {
      setTime(0)
    }
  }, [mode, initialTime])

  const toggleTimer = useCallback(() => {
    if (isRunning) {
      pauseTimer()
    } else {
      startTimer()
    }
  }, [isRunning, pauseTimer, startTimer])

  const setPreset = useCallback((seconds: number) => {
    setMode('countdown')
    setTime(seconds)
    setInitialTime(seconds)
    setIsRunning(false)
    setIsFinished(false)
  }, [])

  const adjustTime = useCallback((delta: number) => {
    if (!isRunning) {
      const newTime = Math.max(0, time + delta)
      setTime(newTime)
      if (mode === 'countdown') {
        setInitialTime(newTime)
      }
    }
  }, [isRunning, time, mode])

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Timer tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => {
          if (mode === 'countdown') {
            if (prev <= 1) {
              setIsRunning(false)
              setIsFinished(true)
              setShowConfetti(true)
              if (soundEnabled) {
                soundManager.playSound('bell')
              }
              return 0
            }
            return prev - 1
          } else {
            return prev + 1
          }
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, mode, soundEnabled])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          toggleTimer()
          break
        case 'r':
        case 'R':
          resetTimer()
          break
        case 'f':
        case 'F':
          toggleFullscreen()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleTimer, resetTimer, toggleFullscreen])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const progress = mode === 'countdown' && initialTime > 0
    ? ((initialTime - time) / initialTime) * 100
    : 0

  return (
    <div ref={containerRef} className={cn(
      'flex flex-col items-center justify-center',
      isFullscreen && 'bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 min-h-screen p-8'
    )}>
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'][
                  Math.floor(Math.random() * 6)
                ],
                animationDelay: `${Math.random() * 2}s`,
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
              }}
            />
          ))}
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex gap-3 mb-8">
        <Button
          variant={mode === 'countdown' ? 'default' : 'outline'}
          size="lg"
          onClick={() => {
            setMode('countdown')
            setTime(initialTime)
            setIsRunning(false)
          }}
          className="text-lg"
        >
          ⬇️ Count Down
        </Button>
        <Button
          variant={mode === 'countup' ? 'default' : 'outline'}
          size="lg"
          onClick={() => {
            setMode('countup')
            setTime(0)
            setIsRunning(false)
          }}
          className="text-lg"
        >
          ⬆️ Count Up
        </Button>
      </div>

      {/* Timer Display */}
      <Card className={cn(
        'w-full max-w-2xl overflow-hidden',
        isFinished && 'animate-wiggle ring-8 ring-yellow-400',
        isRunning && 'ring-4 ring-green-400'
      )}>
        {mode === 'countdown' && (
          <div className="h-4 bg-gray-200 rounded-t-3xl overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 transition-all duration-1000"
              style={{ width: `${100 - progress}%` }}
            />
          </div>
        )}
        <CardContent className="p-8 sm:p-12 bg-gradient-to-br from-white to-purple-50">
          <div className="text-center">
            {/* Emoji indicator */}
            <div className="text-6xl mb-4">
              {isFinished ? '🎉' : isRunning ? '⏱️' : '😊'}
            </div>

            {/* Time Display */}
            <div className={cn(
              'projection-text tabular-nums mb-6',
              isFinished ? 'text-yellow-500 animate-bounce-fun' :
              isRunning ? 'text-green-500' : 'text-purple-600'
            )}>
              {formatTime(time)}
            </div>

            {/* Time Adjustment */}
            {!isRunning && mode === 'countdown' && (
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button
                  variant="outline"
                  size="icon-lg"
                  onClick={() => adjustTime(-60)}
                  className="text-2xl"
                >
                  <Minus className="h-6 w-6" />
                </Button>
                <span className="text-purple-500 font-bold text-lg w-20 text-center">
                  1 min
                </span>
                <Button
                  variant="outline"
                  size="icon-lg"
                  onClick={() => adjustTime(60)}
                  className="text-2xl"
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={isRunning ? 'warning' : 'success'}
                size="xl"
                onClick={toggleTimer}
                className="min-w-[160px] text-xl"
              >
                {isRunning ? (
                  <>
                    <Pause className="mr-2 h-6 w-6" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-6 w-6" /> Start!
                  </>
                )}
              </Button>
              <Button variant="outline" size="xl" onClick={resetTimer} className="text-xl">
                <RotateCcw className="mr-2 h-6 w-6" /> Reset
              </Button>
              <Button variant="ghost" size="icon-lg" onClick={toggleFullscreen}>
                <Maximize className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Presets */}
      {mode === 'countdown' && (
        <div className="mt-8">
          <p className="text-lg font-bold text-purple-600 text-center mb-4">⚡ Quick Times ⚡</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {timerPresets.map((seconds) => (
              <Button
                key={seconds}
                variant="secondary"
                size="lg"
                onClick={() => setPreset(seconds)}
                className="text-lg"
              >
                {seconds >= 60 ? `${seconds / 60} min` : `${seconds}s`}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Sound indicator */}
      <div className="mt-6 flex items-center gap-2 text-purple-500 font-bold">
        <span className="text-2xl">{soundEnabled ? '🔊' : '🔇'}</span>
        <span>Sound {soundEnabled ? 'ON' : 'OFF'}</span>
      </div>

      {/* Keyboard hints */}
      {!isFullscreen && (
        <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm font-bold text-purple-400">
          <span className="flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full">
            <kbd className="px-2 py-0.5 bg-white rounded text-purple-600">Space</kbd> Play/Pause
          </span>
          <span className="flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full">
            <kbd className="px-2 py-0.5 bg-white rounded text-purple-600">R</kbd> Reset
          </span>
          <span className="flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full">
            <kbd className="px-2 py-0.5 bg-white rounded text-purple-600">F</kbd> Fullscreen
          </span>
        </div>
      )}
    </div>
  )
}
