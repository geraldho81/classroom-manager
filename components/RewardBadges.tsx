'use client'

import { useEffect, useMemo, useState } from 'react'
import { Award, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { soundManager } from '@/lib/sounds'
import { createClient } from '@/lib/supabase/client'
import { useClassStore, type Student } from '@/stores/classStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useClass } from '@/contexts/ClassContext'
import type { Database } from '@/lib/supabase/types'

type StudentBadge = Database['public']['Tables']['student_badges']['Row']

type BadgeDef = {
  slug: string
  name: string
  emoji: string
  gradient: string
}

const CATALOG: BadgeDef[] = [
  { slug: 'team-player', name: 'Team Player', emoji: '🤝', gradient: 'from-sky-400 to-blue-500' },
  { slug: 'kind-listener', name: 'Kind Listener', emoji: '👂', gradient: 'from-rose-400 to-pink-500' },
  { slug: 'problem-solver', name: 'Problem Solver', emoji: '🧩', gradient: 'from-emerald-400 to-green-500' },
  { slug: 'bright-spark', name: 'Bright Spark', emoji: '✨', gradient: 'from-amber-400 to-yellow-500' },
  { slug: 'helping-hand', name: 'Helping Hand', emoji: '🙌', gradient: 'from-fuchsia-400 to-purple-500' },
  { slug: 'bookworm', name: 'Bookworm', emoji: '📚', gradient: 'from-indigo-400 to-violet-500' },
  { slug: 'math-whiz', name: 'Math Whiz', emoji: '➕', gradient: 'from-cyan-400 to-teal-500' },
  { slug: 'creative-spirit', name: 'Creative Spirit', emoji: '🎨', gradient: 'from-pink-400 to-rose-500' },
  { slug: 'super-effort', name: 'Super Effort', emoji: '💪', gradient: 'from-orange-400 to-red-500' },
  { slug: 'goal-crusher', name: 'Goal Crusher', emoji: '🏁', gradient: 'from-lime-400 to-emerald-500' },
]

const BADGE_MAP: Record<string, BadgeDef> = Object.fromEntries(
  CATALOG.map((b) => [b.slug, b])
)

export function RewardBadges() {
  const { students, fetchStudents, setCurrentClass } = useClassStore()
  const { soundEnabled } = useSettingsStore()
  const { selectedClass } = useClass()

  const [badges, setBadges] = useState<StudentBadge[]>([])
  const [activeStudent, setActiveStudent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedClass?.id) {
      setCurrentClass(selectedClass.id)
      fetchStudents(selectedClass.id)
    }
  }, [selectedClass?.id, setCurrentClass, fetchStudents])

  useEffect(() => {
    if (!selectedClass?.id || students.length === 0) {
      setBadges([])
      return
    }
    const ids = students.map((s) => s.id)
    const supabase = createClient()
    supabase
      .from('student_badges')
      .select('*')
      .in('student_id', ids)
      .order('awarded_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setBadges(data || [])
      })
  }, [selectedClass?.id, students])

  useEffect(() => {
    if (students.length > 0 && !activeStudent) {
      setActiveStudent(students[0].id)
    }
  }, [students, activeStudent])

  const byStudent = useMemo(() => {
    const m: Record<string, StudentBadge[]> = {}
    badges.forEach((b) => {
      ;(m[b.student_id] ||= []).push(b)
    })
    return m
  }, [badges])

  const award = async (badge: BadgeDef) => {
    if (!activeStudent) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from('student_badges')
      .insert({ student_id: activeStudent, badge_slug: badge.slug })
      .select('*')
      .single()
    if (error) {
      setError(error.message)
      return
    }
    if (data) setBadges((prev) => [data, ...prev])
    if (soundEnabled) soundManager.playSound('fanfare')
  }

  const removeBadge = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('student_badges').delete().eq('id', id)
    if (!error) setBadges((prev) => prev.filter((b) => b.id !== id))
  }

  if (!selectedClass) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-stone-300 bg-white/60 p-10 text-center">
        <p className="text-lg font-bold text-stone-600">
          Pick a class to give badges.
        </p>
      </div>
    )
  }

  const active = students.find((s) => s.id === activeStudent) || null

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
        <p className="text-sm font-bold text-stone-600 mb-2">
          Awarding badges to:
        </p>
        <div className="flex flex-wrap gap-2">
          {students.map((s) => {
            const count = byStudent[s.id]?.length || 0
            const isActive = activeStudent === s.id
            return (
              <button
                key={s.id}
                onClick={() => setActiveStudent(s.id)}
                className={cn(
                  'flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-sm font-bold transition-all',
                  isActive
                    ? 'border-amber-400 bg-amber-100 text-amber-900'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                )}
              >
                {s.name}
                {count > 0 && (
                  <span className="inline-flex items-center justify-center rounded-full bg-amber-500 text-white text-xs font-black h-5 min-w-[1.25rem] px-1">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        {students.length === 0 && (
          <p className="text-sm text-stone-500">
            Add students in Class List first.
          </p>
        )}
      </div>

      {active && (
        <>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {CATALOG.map((badge) => (
              <button
                key={badge.slug}
                onClick={() => award(badge)}
                className={cn(
                  'group rounded-2xl p-4 text-white shadow-md transition-all hover:scale-105 hover:-rotate-1',
                  'bg-gradient-to-br',
                  badge.gradient
                )}
              >
                <div className="text-4xl drop-shadow">{badge.emoji}</div>
                <div className="mt-2 text-sm font-black drop-shadow">
                  {badge.name}
                </div>
              </button>
            ))}
          </div>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-black flex items-center gap-2 mb-3">
                <Award className="h-5 w-5 text-amber-500" />
                {active.name}'s badges
                <span className="ml-auto text-sm text-stone-500">
                  {(byStudent[active.id] || []).length} earned
                </span>
              </h3>
              {(byStudent[active.id] || []).length === 0 ? (
                <p className="text-sm text-stone-500">
                  No badges yet — tap a badge above to award one.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {byStudent[active.id].map((b) => {
                    const def = BADGE_MAP[b.badge_slug]
                    if (!def) return null
                    return (
                      <div
                        key={b.id}
                        className={cn(
                          'group relative inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-white text-sm font-bold shadow',
                          'bg-gradient-to-br',
                          def.gradient
                        )}
                      >
                        <span>{def.emoji}</span>
                        <span>{def.name}</span>
                        <button
                          onClick={() => removeBadge(b.id)}
                          className="ml-1 opacity-0 group-hover:opacity-100 transition"
                          title="Remove"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
