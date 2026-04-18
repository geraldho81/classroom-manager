'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw, SkipForward, Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn, formatTime } from '@/lib/utils'
import { soundManager } from '@/lib/sounds'
import { useSettingsStore } from '@/stores/settingsStore'

type Segment = {
  id: string
  label: string
  seconds: number
}

const STORAGE_KEY = 'classroom-agenda-v1'

const defaultAgenda: Segment[] = [
  { id: 's1', label: 'Warmup', seconds: 5 * 60 },
  { id: 's2', label: 'Lesson', seconds: 20 * 60 },
  { id: 's3', label: 'Activity', seconds: 15 * 60 },
  { id: 's4', label: 'Wrap-up', seconds: 5 * 60 },
]

function loadAgenda(): Segment[] {
  if (typeof window === 'undefined') return defaultAgenda
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultAgenda
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.every((s) => s.id && s.label && typeof s.seconds === 'number')) {
      return parsed
    }
  } catch {}
  return defaultAgenda
}

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export function LessonAgenda() {
  const { soundEnabled } = useSettingsStore()
  const [segments, setSegments] = useState<Segment[]>(defaultAgenda)
  const [hydrated, setHydrated] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [remaining, setRemaining] = useState<number>(defaultAgenda[0].seconds)
  const [isRunning, setIsRunning] = useState(false)

  const [newLabel, setNewLabel] = useState('')
  const [newMinutes, setNewMinutes] = useState('5')

  const soundEnabledRef = useRef(soundEnabled)
  soundEnabledRef.current = soundEnabled

  useEffect(() => {
    const loaded = loadAgenda()
    setSegments(loaded)
    setRemaining(loaded[0]?.seconds || 0)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(segments))
  }, [segments, hydrated])

  const current = segments[currentIndex]
  const totalDuration = segments.reduce((sum, s) => sum + s.seconds, 0)
  const elapsedBeforeCurrent = segments
    .slice(0, currentIndex)
    .reduce((sum, s) => sum + s.seconds, 0)
  const elapsedInCurrent = current ? current.seconds - remaining : 0
  const totalElapsed = elapsedBeforeCurrent + elapsedInCurrent
  const overallProgress =
    totalDuration > 0 ? Math.min(100, (totalElapsed / totalDuration) * 100) : 0
  const segmentProgress =
    current && current.seconds > 0
      ? Math.min(100, (elapsedInCurrent / current.seconds) * 100)
      : 0

  const advanceSegment = useCallback(() => {
    setCurrentIndex((idx) => {
      const next = idx + 1
      if (next >= segments.length) {
        setIsRunning(false)
        setRemaining(0)
        if (soundEnabledRef.current) soundManager.playSound('fanfare')
        return idx
      }
      setRemaining(segments[next].seconds)
      if (soundEnabledRef.current) soundManager.playSound('chime')
      return next
    })
  }, [segments])

  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          advanceSegment()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning, advanceSegment])

  const toggleRun = () => {
    if (segments.length === 0) return
    if (currentIndex >= segments.length) return
    setIsRunning((r) => !r)
  }

  const resetAgenda = () => {
    setIsRunning(false)
    setCurrentIndex(0)
    setRemaining(segments[0]?.seconds || 0)
  }

  const skipSegment = () => {
    advanceSegment()
  }

  const addSegment = () => {
    const label = newLabel.trim()
    const mins = parseFloat(newMinutes)
    if (!label || !mins || mins <= 0) return
    const seg: Segment = {
      id: uid(),
      label,
      seconds: Math.round(mins * 60),
    }
    setSegments((s) => [...s, seg])
    setNewLabel('')
    setNewMinutes('5')
  }

  const removeSegment = (id: string) => {
    setSegments((s) => {
      const next = s.filter((x) => x.id !== id)
      if (next.length === 0) {
        setIsRunning(false)
        setCurrentIndex(0)
        setRemaining(0)
        return next
      }
      if (currentIndex >= next.length) {
        setCurrentIndex(next.length - 1)
        setRemaining(next[next.length - 1].seconds)
      }
      return next
    })
  }

  const moveSegment = (id: string, direction: -1 | 1) => {
    setSegments((s) => {
      const idx = s.findIndex((x) => x.id === id)
      if (idx === -1) return s
      const newIdx = idx + direction
      if (newIdx < 0 || newIdx >= s.length) return s
      const copy = [...s]
      ;[copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]]
      return copy
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 sm:p-10">
          <div className="h-2 rounded-full bg-stone-200 overflow-hidden mb-5">
            <div
              className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 transition-all duration-1000"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          {current ? (
            <div className="text-center">
              <div className="text-sm font-bold uppercase tracking-wider text-stone-500">
                Segment {currentIndex + 1} of {segments.length}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-stone-800 mt-2">
                {current.label}
              </div>
              <div
                className={cn(
                  'projection-text tabular-nums my-4',
                  isRunning ? 'text-purple-600' : 'text-stone-600'
                )}
              >
                {formatTime(remaining)}
              </div>
              <div className="h-2 rounded-full bg-stone-200 overflow-hidden mb-6 max-w-md mx-auto">
                <div
                  className="h-full bg-purple-400 transition-all duration-1000"
                  style={{ width: `${segmentProgress}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant={isRunning ? 'warning' : 'success'}
                  size="xl"
                  onClick={toggleRun}
                  className="min-w-[150px] text-xl"
                  disabled={segments.length === 0}
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
                <Button variant="outline" size="xl" onClick={skipSegment} className="text-xl">
                  <SkipForward className="mr-2 h-5 w-5" /> Skip
                </Button>
                <Button variant="ghost" size="xl" onClick={resetAgenda} className="text-xl">
                  <RotateCcw className="mr-2 h-5 w-5" /> Reset
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xl font-bold text-stone-500">
                Add a segment below to start.
              </p>
            </div>
          )}

          <div className="mt-8">
            <p className="text-sm font-bold text-stone-500 mb-2">Total</p>
            <p className="text-lg font-black text-stone-700">
              {formatTime(totalDuration)} across {segments.length} segment
              {segments.length === 1 ? '' : 's'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-black text-stone-700 mb-4">Segments</h2>

          <div className="space-y-2 mb-5">
            {segments.length === 0 && (
              <p className="text-stone-400 text-sm">No segments yet.</p>
            )}
            {segments.map((seg, idx) => (
              <div
                key={seg.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-2xl transition-all',
                  idx === currentIndex
                    ? 'bg-gradient-to-r from-purple-100 to-pink-100 ring-2 ring-purple-300'
                    : idx < currentIndex
                    ? 'bg-stone-100 opacity-60'
                    : 'bg-stone-50'
                )}
              >
                <GripVertical className="h-4 w-4 text-stone-400" />
                <div className="flex-1">
                  <p className="font-bold text-stone-700">{seg.label}</p>
                  <p className="text-sm text-stone-500">{formatTime(seg.seconds)}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={idx === 0}
                    onClick={() => moveSegment(seg.id, -1)}
                    aria-label="Move up"
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={idx === segments.length - 1}
                    onClick={() => moveSegment(seg.id, 1)}
                    aria-label="Move down"
                  >
                    ↓
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-rose-500"
                    onClick={() => removeSegment(seg.id)}
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              addSegment()
            }}
            className="flex flex-wrap gap-2 items-center"
          >
            <Input
              placeholder="Segment name (e.g., Warmup)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="flex-1 min-w-[200px]"
            />
            <Input
              type="number"
              min="0.5"
              step="0.5"
              value={newMinutes}
              onChange={(e) => setNewMinutes(e.target.value)}
              className="w-24"
              aria-label="Minutes"
            />
            <span className="text-sm font-bold text-stone-500">min</span>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
