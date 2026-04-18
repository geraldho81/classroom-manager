'use client'

import { useEffect, useMemo, useState } from 'react'
import { Award, Minus, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { soundManager } from '@/lib/sounds'
import { createClient } from '@/lib/supabase/client'
import { useClassStore, type Student } from '@/stores/classStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useClass } from '@/contexts/ClassContext'
import type { Database } from '@/lib/supabase/types'

type BehaviorEvent = Database['public']['Tables']['behavior_events']['Row']

const QUICK_REASONS = [
  'Helped a classmate',
  'On task',
  'Great answer',
  'Participated',
  'Calling out',
  'Off task',
  'Disrespectful',
]

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.round(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  return `${d}d ago`
}

export function BehaviorPoints() {
  const { students, fetchStudents, setCurrentClass } = useClassStore()
  const { soundEnabled } = useSettingsStore()
  const { selectedClass } = useClass()

  const [events, setEvents] = useState<BehaviorEvent[]>([])
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedClass?.id) {
      setCurrentClass(selectedClass.id)
      fetchStudents(selectedClass.id)
    }
  }, [selectedClass?.id, setCurrentClass, fetchStudents])

  useEffect(() => {
    if (!selectedClass?.id || students.length === 0) {
      setEvents([])
      return
    }
    const ids = students.map((s) => s.id)
    setLoading(true)
    const supabase = createClient()
    supabase
      .from('behavior_events')
      .select('*')
      .in('student_id', ids)
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setEvents(data || [])
        setLoading(false)
      })
  }, [selectedClass?.id, students])

  const totals = useMemo(() => {
    const t: Record<string, number> = {}
    events.forEach((e) => {
      t[e.student_id] = (t[e.student_id] || 0) + e.delta
    })
    return t
  }, [events])

  const award = async (student: Student, delta: number) => {
    if (soundEnabled) soundManager.playSound(delta > 0 ? 'pop' : 'click')
    const supabase = createClient()
    const { data, error } = await supabase
      .from('behavior_events')
      .insert({
        student_id: student.id,
        delta,
        reason: reason.trim() || null,
      })
      .select('*')
      .single()
    if (error) {
      setError(error.message)
      return
    }
    if (data) setEvents((prev) => [data, ...prev])
    setReason('')
  }

  const removeEvent = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('behavior_events').delete().eq('id', id)
    if (!error) setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  const resetAll = async () => {
    if (students.length === 0) return
    const supabase = createClient()
    const ids = students.map((s) => s.id)
    const { error } = await supabase.from('behavior_events').delete().in('student_id', ids)
    if (!error) setEvents([])
    if (soundEnabled) soundManager.playSound('sparkle')
  }

  const studentName = (id: string) =>
    students.find((s) => s.id === id)?.name || '—'

  if (!selectedClass) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-stone-300 bg-white/60 p-10 text-center">
        <p className="text-lg font-bold text-stone-600">
          Pick a class to track behavior.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-900">
          <p className="font-bold">Database error</p>
          <p className="mt-1 opacity-80">{error}</p>
          <p className="mt-2 text-xs opacity-70">
            Make sure <code>supabase/migration_phase2.sql</code> has been run in your Supabase project.
          </p>
        </div>
      )}

      <div className="rounded-2xl bg-white/60 border-2 border-stone-200 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional) — applies to the next tap"
            className="flex-1"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_REASONS.map((r) => (
            <Button
              key={r}
              variant={reason === r ? 'default' : 'outline'}
              size="sm"
              onClick={() => setReason(r)}
            >
              {r}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {students.map((student) => {
          const total = totals[student.id] || 0
          const color =
            total > 0
              ? 'from-emerald-400 to-green-500'
              : total < 0
              ? 'from-rose-400 to-red-500'
              : 'from-stone-300 to-stone-400'
          return (
            <Card
              key={student.id}
              className="overflow-hidden shadow-md"
            >
              <div className={cn('h-2 bg-gradient-to-r', color)} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-stone-800">{student.name}</h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {
                        events.filter((e) => e.student_id === student.id).length
                      }{' '}
                      events
                    </p>
                  </div>
                  <div
                    className={cn(
                      'text-3xl font-black tabular-nums',
                      total > 0 && 'text-emerald-600',
                      total < 0 && 'text-rose-600',
                      total === 0 && 'text-stone-400'
                    )}
                  >
                    {total > 0 ? `+${total}` : total}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => award(student, -1)}
                    className="text-rose-600 hover:bg-rose-50"
                    title="Deduct 1"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={() => award(student, 1)}
                    className="bg-emerald-500 hover:bg-emerald-600"
                    title="Award 1"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => award(student, 5)}
                    className="text-emerald-700 font-black"
                  >
                    +5
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {students.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-stone-300 bg-white/60 p-10 text-center text-sm text-stone-500">
          Add students to {selectedClass.name} in Class List to start tracking behavior.
        </div>
      )}

      <div className="rounded-2xl bg-white/60 border-2 border-stone-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Recent events
          </h3>
          {events.length > 0 && (
            <Button variant="ghost" size="sm" onClick={resetAll}>
              <RotateCcw className="mr-1 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
        {loading ? (
          <p className="text-sm text-stone-500">Loading...</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-stone-500">No events yet.</p>
        ) : (
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {events.slice(0, 50).map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-stone-50 text-sm"
              >
                <span
                  className={cn(
                    'shrink-0 w-10 text-center font-black tabular-nums',
                    e.delta > 0 ? 'text-emerald-600' : 'text-rose-600'
                  )}
                >
                  {e.delta > 0 ? `+${e.delta}` : e.delta}
                </span>
                <span className="font-bold text-stone-800">
                  {studentName(e.student_id)}
                </span>
                {e.reason && (
                  <span className="text-stone-500 italic truncate">
                    "{e.reason}"
                  </span>
                )}
                <span className="ml-auto text-xs text-stone-400 shrink-0">
                  {formatRelative(e.created_at)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEvent(e.id)}
                  className="h-7 w-7 text-stone-400 hover:text-rose-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
