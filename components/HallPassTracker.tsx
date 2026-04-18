'use client'

import { useEffect, useMemo, useState } from 'react'
import { DoorOpen, UserCheck, AlertTriangle, Trash2 } from 'lucide-react'
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

type HallPass = Database['public']['Tables']['hall_passes']['Row']

const WARN_MINUTES = 5

function formatDuration(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

function todayStart() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export function HallPassTracker() {
  const { students, fetchStudents, setCurrentClass } = useClassStore()
  const { soundEnabled } = useSettingsStore()
  const { selectedClass } = useClass()

  const [passes, setPasses] = useState<HallPass[]>([])
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (selectedClass?.id) {
      setCurrentClass(selectedClass.id)
      fetchStudents(selectedClass.id)
    }
  }, [selectedClass?.id, setCurrentClass, fetchStudents])

  useEffect(() => {
    if (!selectedClass?.id || students.length === 0) {
      setPasses([])
      return
    }
    const ids = students.map((s) => s.id)
    const supabase = createClient()
    supabase
      .from('hall_passes')
      .select('*')
      .in('student_id', ids)
      .gte('left_at', todayStart())
      .order('left_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setPasses(data || [])
      })
  }, [selectedClass?.id, students])

  const outMap = useMemo(() => {
    const m: Record<string, HallPass> = {}
    passes.forEach((p) => {
      if (!p.returned_at && !m[p.student_id]) m[p.student_id] = p
    })
    return m
  }, [passes])

  const sendOut = async (student: Student) => {
    if (outMap[student.id]) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from('hall_passes')
      .insert({
        student_id: student.id,
        reason: reason.trim() || null,
      })
      .select('*')
      .single()
    if (error) {
      setError(error.message)
      return
    }
    if (data) setPasses((prev) => [data, ...prev])
    setReason('')
    if (soundEnabled) soundManager.playSound('click')
  }

  const markReturned = async (pass: HallPass) => {
    const supabase = createClient()
    const returned_at = new Date().toISOString()
    const { error } = await supabase
      .from('hall_passes')
      .update({ returned_at })
      .eq('id', pass.id)
    if (error) {
      setError(error.message)
      return
    }
    setPasses((prev) =>
      prev.map((p) => (p.id === pass.id ? { ...p, returned_at } : p))
    )
    if (soundEnabled) soundManager.playSound('success')
  }

  const deletePass = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('hall_passes').delete().eq('id', id)
    if (!error) setPasses((prev) => prev.filter((p) => p.id !== id))
  }

  const studentName = (id: string) =>
    students.find((s) => s.id === id)?.name || '—'

  if (!selectedClass) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-stone-300 bg-white/60 p-10 text-center">
        <p className="text-lg font-bold text-stone-600">
          Pick a class to track hall passes.
        </p>
      </div>
    )
  }

  const active = passes.filter((p) => !p.returned_at)
  const closed = passes.filter((p) => p.returned_at)

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-900">
          <p className="font-bold">Database error</p>
          <p className="mt-1 opacity-80">{error}</p>
          <p className="mt-2 text-xs opacity-70">
            Make sure <code>supabase/migration_phase2.sql</code> has been run.
          </p>
        </div>
      )}

      <div className="rounded-2xl bg-white/60 border-2 border-stone-200 p-4">
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional) — applies to the next sign-out"
        />
      </div>

      {active.length > 0 && (
        <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-4">
          <h3 className="font-black text-amber-900 mb-3 flex items-center gap-2">
            <DoorOpen className="h-5 w-5" />
            Out of class ({active.length})
          </h3>
          <div className="grid gap-2">
            {active.map((p) => {
              const elapsed = now - new Date(p.left_at).getTime()
              const warn = elapsed > WARN_MINUTES * 60 * 1000
              return (
                <div
                  key={p.id}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 transition-colors',
                    warn ? 'border-rose-300 bg-rose-50' : 'border-amber-200'
                  )}
                >
                  <span className="font-bold text-stone-800">
                    {studentName(p.student_id)}
                  </span>
                  {p.reason && (
                    <span className="text-sm text-stone-500 italic truncate">
                      "{p.reason}"
                    </span>
                  )}
                  {warn && (
                    <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                  )}
                  <span
                    className={cn(
                      'ml-auto font-black tabular-nums text-lg shrink-0',
                      warn ? 'text-rose-600' : 'text-amber-700'
                    )}
                  >
                    {formatDuration(elapsed)}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => markReturned(p)}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    <UserCheck className="mr-1 h-4 w-4" />
                    Back
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {students.map((student) => {
          const out = outMap[student.id]
          return (
            <Card key={student.id} className="shadow-md">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-stone-800 truncate">
                    {student.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {out ? 'Out of class' : 'In class'}
                  </p>
                </div>
                <Button
                  onClick={() => sendOut(student)}
                  disabled={!!out}
                  className={cn(
                    'shrink-0',
                    out
                      ? 'bg-stone-200 text-stone-400'
                      : 'bg-amber-500 hover:bg-amber-600'
                  )}
                >
                  <DoorOpen className="mr-1 h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="rounded-2xl bg-white/60 border-2 border-stone-200 p-4">
        <h3 className="font-black mb-3">Today's history ({closed.length})</h3>
        {closed.length === 0 ? (
          <p className="text-sm text-stone-500">No completed passes today.</p>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {closed.map((p) => {
              const duration =
                new Date(p.returned_at!).getTime() - new Date(p.left_at).getTime()
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-stone-50 text-sm"
                >
                  <span className="font-bold text-stone-800 truncate">
                    {studentName(p.student_id)}
                  </span>
                  {p.reason && (
                    <span className="text-stone-500 italic truncate">
                      "{p.reason}"
                    </span>
                  )}
                  <span className="ml-auto text-stone-600 font-mono tabular-nums shrink-0">
                    {formatDuration(duration)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deletePass(p.id)}
                    className="h-7 w-7 text-stone-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
