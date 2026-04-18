'use client'

import { useEffect, useMemo, useState } from 'react'
import { Shuffle, RotateCcw, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { soundManager } from '@/lib/sounds'
import { useClassStore, type Student } from '@/stores/classStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useClass } from '@/contexts/ClassContext'

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function LineUp() {
  const { students, fetchStudents, setCurrentClass } = useClassStore()
  const { soundEnabled } = useSettingsStore()
  const { selectedClass } = useClass()

  const [order, setOrder] = useState<Student[]>([])
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [isShuffling, setIsShuffling] = useState(false)

  useEffect(() => {
    if (selectedClass?.id) {
      setCurrentClass(selectedClass.id)
      fetchStudents(selectedClass.id)
    }
  }, [selectedClass?.id, setCurrentClass, fetchStudents])

  const eligible = useMemo(
    () => students.filter((s) => !s.excluded),
    [students]
  )

  useEffect(() => {
    setOrder(eligible)
    setChecked(new Set())
  }, [eligible])

  const generate = () => {
    if (eligible.length === 0) return
    setIsShuffling(true)
    if (soundEnabled) soundManager.playSound('diceRoll')

    let ticks = 0
    const interval = setInterval(() => {
      setOrder(shuffle(eligible))
      ticks++
      if (ticks >= 8) {
        clearInterval(interval)
        setOrder(shuffle(eligible))
        setChecked(new Set())
        setIsShuffling(false)
        if (soundEnabled) soundManager.playSound('sparkle')
      }
    }, 90)
  }

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    if (soundEnabled) soundManager.playSound('click')
  }

  const reset = () => {
    setChecked(new Set())
    if (soundEnabled) soundManager.playSound('click')
  }

  if (!selectedClass) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-stone-300 bg-white/60 p-10 text-center">
        <p className="text-lg font-bold text-stone-600">
          Pick a class to line up your students.
        </p>
      </div>
    )
  }

  if (eligible.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-stone-300 bg-white/60 p-10 text-center">
        <p className="text-lg font-bold text-stone-600">
          No students in {selectedClass.name} yet.
        </p>
        <p className="mt-1 text-sm text-stone-500">
          Add students in Class List to generate a line-up.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={generate} disabled={isShuffling}>
          <Shuffle className={cn('mr-2 h-5 w-5', isShuffling && 'animate-spin')} />
          {isShuffling ? 'Shuffling...' : 'Generate Line-Up'}
        </Button>
        <Button size="lg" variant="outline" onClick={reset}>
          <RotateCcw className="mr-2 h-5 w-5" />
          Clear Checks
        </Button>
      </div>

      <div className="grid gap-2">
        {order.map((student, index) => {
          const isChecked = checked.has(student.id)
          return (
            <button
              key={student.id}
              onClick={() => toggle(student.id)}
              className={cn(
                'flex items-center gap-4 rounded-2xl border-2 px-4 py-3 text-left transition-all',
                isChecked
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50',
                isShuffling && 'opacity-70'
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-black tabular-nums text-white',
                  isChecked
                    ? 'bg-emerald-500'
                    : 'bg-gradient-to-br from-violet-400 to-fuchsia-500'
                )}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  'flex-1 font-bold text-lg',
                  isChecked && 'line-through'
                )}
              >
                {student.name}
              </span>
              {isChecked && <Check className="h-5 w-5 text-emerald-600" />}
            </button>
          )
        })}
      </div>

      <p className="text-center text-sm text-stone-500">
        {checked.size} of {order.length} lined up
      </p>
    </div>
  )
}
