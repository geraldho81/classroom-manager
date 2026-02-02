'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Mic, MicOff, Maximize, AlertTriangle, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { soundManager } from '@/lib/sounds'
import { useSettingsStore } from '@/stores/settingsStore'

export function NoiseMeter() {
  const { noiseThreshold, setNoiseThreshold, soundEnabled } = useSettingsStore()

  const [isListening, setIsListening] = useState(false)
  const [noiseLevel, setNoiseLevel] = useState(0)
  const [peakLevel, setPeakLevel] = useState(0)
  const [isOverThreshold, setIsOverThreshold] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)
  const lastAlertRef = useRef<number>(0)

  const startListening = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      analyserRef.current = analyser

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      setIsListening(true)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const updateLevel = () => {
        if (!analyserRef.current) return

        analyserRef.current.getByteFrequencyData(dataArray)

        // Calculate average level
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
        const normalizedLevel = Math.min(100, (average / 128) * 100)

        setNoiseLevel(normalizedLevel)
        setPeakLevel((prev) => Math.max(prev, normalizedLevel))

        // Check threshold
        const overThreshold = normalizedLevel > noiseThreshold
        setIsOverThreshold(overThreshold)

        // Play alert if over threshold (with cooldown)
        if (overThreshold && soundEnabled) {
          const now = Date.now()
          if (now - lastAlertRef.current > 2000) {
            soundManager.playSound('alert')
            lastAlertRef.current = now
          }
        }

        animationRef.current = requestAnimationFrame(updateLevel)
      }

      updateLevel()
    } catch (err) {
      setError('Could not access microphone. Please allow microphone access.')
      console.error('Microphone error:', err)
    }
  }, [noiseThreshold, soundEnabled])

  const stopListening = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    setIsListening(false)
    setNoiseLevel(0)
    setPeakLevel(0)
  }, [])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  const resetPeak = useCallback(() => {
    setPeakLevel(0)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [stopListening])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          toggleListening()
          break
        case 'f':
        case 'F':
          toggleFullscreen()
          break
        case 'r':
        case 'R':
          resetPeak()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleListening, toggleFullscreen, resetPeak])

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const getLevelColor = (level: number) => {
    if (level < 40) return 'bg-green-500'
    if (level < 60) return 'bg-yellow-500'
    if (level < 80) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getLevelText = (level: number) => {
    if (level < 20) return 'Very Quiet'
    if (level < 40) return 'Quiet'
    if (level < 60) return 'Moderate'
    if (level < 80) return 'Loud'
    return 'Very Loud'
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-col items-center justify-center',
        isFullscreen && 'bg-background min-h-screen p-8'
      )}
    >
      <Card
        className={cn(
          'w-full max-w-2xl overflow-hidden transition-all',
          isOverThreshold && 'ring-4 ring-red-500 animate-pulse-slow'
        )}
      >
        <CardContent className="p-8">
          <div className="text-center">
            {/* Warning Indicator */}
            {isOverThreshold && isListening && (
              <div className="flex items-center justify-center gap-2 mb-4 text-red-500">
                <AlertTriangle className="h-6 w-6" />
                <span className="font-semibold uppercase tracking-wider">
                  Too Loud!
                </span>
                <AlertTriangle className="h-6 w-6" />
              </div>
            )}

            {/* Level Display */}
            <div className="mb-6">
              <div className="projection-text tabular-nums mb-2">
                {Math.round(noiseLevel)}%
              </div>
              <p
                className={cn(
                  'text-xl font-medium',
                  isOverThreshold ? 'text-red-500' : 'text-muted-foreground'
                )}
              >
                {isListening ? getLevelText(noiseLevel) : 'Not Listening'}
              </p>
            </div>

            {/* Visual Meter */}
            <div className="relative h-12 bg-secondary rounded-full overflow-hidden mb-6">
              {/* Level Bar */}
              <div
                className={cn(
                  'absolute inset-y-0 left-0 transition-all duration-100 rounded-full',
                  getLevelColor(noiseLevel)
                )}
                style={{ width: `${noiseLevel}%` }}
              />

              {/* Threshold Line */}
              <div
                className="absolute inset-y-0 w-1 bg-foreground/50 z-10"
                style={{ left: `${noiseThreshold}%` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
                  Threshold
                </div>
              </div>

              {/* Peak Indicator */}
              {peakLevel > 0 && (
                <div
                  className="absolute inset-y-0 w-0.5 bg-foreground/80"
                  style={{ left: `${peakLevel}%` }}
                />
              )}
            </div>

            {/* Detailed Bars */}
            <div className="flex gap-1 justify-center mb-8 h-24">
              {Array.from({ length: 20 }).map((_, i) => {
                const barThreshold = (i + 1) * 5
                const isActive = noiseLevel >= barThreshold
                const isPeak = peakLevel >= barThreshold && peakLevel < barThreshold + 5
                return (
                  <div
                    key={i}
                    className={cn(
                      'w-3 rounded-full transition-all duration-75',
                      isActive
                        ? getLevelColor(barThreshold)
                        : 'bg-secondary',
                      isPeak && 'ring-2 ring-foreground/50'
                    )}
                    style={{
                      height: isActive ? `${40 + barThreshold * 0.6}%` : '20%',
                    }}
                  />
                )
              })}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button
                size="xl"
                onClick={toggleListening}
                variant={isListening ? 'destructive' : 'default'}
                className="min-w-[140px]"
              >
                {isListening ? (
                  <>
                    <MicOff className="mr-2 h-5 w-5" /> Stop
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-5 w-5" /> Start
                  </>
                )}
              </Button>
              <Button variant="ghost" size="icon-lg" onClick={toggleFullscreen}>
                <Maximize className="h-5 w-5" />
              </Button>
            </div>

            {/* Threshold Control */}
            <div className="max-w-sm mx-auto">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Noise Threshold</span>
                <span>{noiseThreshold}%</span>
              </div>
              <Slider
                min={10}
                max={90}
                step={5}
                value={noiseThreshold}
                onValueChange={setNoiseThreshold}
              />
            </div>

            {/* Peak Display */}
            {peakLevel > 0 && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>Peak: {Math.round(peakLevel)}%</span>
                <Button variant="ghost" size="sm" onClick={resetPeak}>
                  Reset
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Keyboard shortcuts hint */}
      {!isFullscreen && (
        <div className="mt-6 text-xs text-muted-foreground text-center">
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-secondary rounded">Space</kbd>{' '}
            Start/Stop
          </span>
          <span className="mx-3">|</span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-secondary rounded">R</kbd> Reset Peak
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
