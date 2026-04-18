'use client'

import { useEffect, useMemo, useState } from 'react'
import { Shuffle, Save, Trash2, Plus, Minus, RotateCcw } from 'lucide-react'
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

type Layout = Database['public']['Tables']['seating_layouts']['Row']

type Positions = {
  rows: number
  cols: number
  cells: (string | null)[]
}

const DEFAULT_ROWS = 4
const DEFAULT_COLS = 5

function emptyCells(rows: number, cols: number): (string | null)[] {
  return Array.from({ length: rows * cols }, () => null)
}

function isPositions(raw: unknown): raw is Positions {
  if (!raw || typeof raw !== 'object') return false
  const p = raw as Record<string, unknown>
  return (
    typeof p.rows === 'number' &&
    typeof p.cols === 'number' &&
    Array.isArray(p.cells)
  )
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function SeatingChart() {
  const { students, fetchStudents, setCurrentClass } = useClassStore()
  const { soundEnabled } = useSettingsStore()
  const { selectedClass } = useClass()

  const [layouts, setLayouts] = useState<Layout[]>([])
  const [currentLayoutId, setCurrentLayoutId] = useState<string | null>(null)
  const [layoutName, setLayoutName] = useState('My Layout')
  const [rows, setRows] = useState(DEFAULT_ROWS)
  const [cols, setCols] = useState(DEFAULT_COLS)
  const [cells, setCells] = useState<(string | null)[]>(
    emptyCells(DEFAULT_ROWS, DEFAULT_COLS)
  )
  const [pickedUp, setPickedUp] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedClass?.id) {
      setCurrentClass(selectedClass.id)
      fetchStudents(selectedClass.id)
    }
  }, [selectedClass?.id, setCurrentClass, fetchStudents])

  useEffect(() => {
    if (!selectedClass?.id) {
      setLayouts([])
      return
    }
    const supabase = createClient()
    supabase
      .from('seating_layouts')
      .select('*')
      .eq('class_id', selectedClass.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setLayouts(data || [])
      })
  }, [selectedClass?.id])

  const placedIds = useMemo(() => new Set(cells.filter(Boolean) as string[]), [cells])
  const unseated = useMemo(
    () => students.filter((s) => !placedIds.has(s.id)),
    [students, placedIds]
  )

  const studentById = useMemo(() => {
    const m: Record<string, Student> = {}
    students.forEach((s) => (m[s.id] = s))
    return m
  }, [students])

  const resizeGrid = (newRows: number, newCols: number) => {
    const safeRows = Math.max(1, Math.min(10, newRows))
    const safeCols = Math.max(1, Math.min(10, newCols))
    const next = emptyCells(safeRows, safeCols)
    for (let r = 0; r < Math.min(rows, safeRows); r++) {
      for (let c = 0; c < Math.min(cols, safeCols); c++) {
        next[r * safeCols + c] = cells[r * cols + c]
      }
    }
    setRows(safeRows)
    setCols(safeCols)
    setCells(next)
  }

  const clearCell = (index: number) => {
    setCells((prev) => {
      const next = [...prev]
      next[index] = null
      return next
    })
  }

  const placeInCell = (index: number, studentId: string) => {
    setCells((prev) => {
      const next = [...prev]
      const existingAt = prev.findIndex((id, i) => id === studentId && i !== index)
      if (existingAt !== -1) next[existingAt] = prev[index]
      next[index] = studentId
      return next
    })
  }

  const handleCellClick = (index: number) => {
    const occupant = cells[index]
    if (pickedUp) {
      placeInCell(index, pickedUp)
      setPickedUp(null)
      if (soundEnabled) soundManager.playSound('pop')
      return
    }
    if (occupant) {
      setPickedUp(occupant)
      if (soundEnabled) soundManager.playSound('click')
    }
  }

  const pickUpFromTray = (studentId: string) => {
    setPickedUp(pickedUp === studentId ? null : studentId)
    if (soundEnabled) soundManager.playSound('click')
  }

  const autoFill = () => {
    const shuffled = shuffle(students.map((s) => s.id))
    const next = emptyCells(rows, cols)
    for (let i = 0; i < Math.min(shuffled.length, next.length); i++) {
      next[i] = shuffled[i]
    }
    setCells(next)
    setPickedUp(null)
    if (soundEnabled) soundManager.playSound('sparkle')
  }

  const clearAll = () => {
    setCells(emptyCells(rows, cols))
    setPickedUp(null)
  }

  const save = async () => {
    if (!selectedClass?.id) return
    const supabase = createClient()
    const positions: Positions = { rows, cols, cells }
    if (currentLayoutId) {
      const { error } = await supabase
        .from('seating_layouts')
        .update({ name: layoutName, positions: positions as any })
        .eq('id', currentLayoutId)
      if (error) {
        setError(error.message)
        return
      }
      setLayouts((prev) =>
        prev.map((l) =>
          l.id === currentLayoutId
            ? { ...l, name: layoutName, positions: positions as any }
            : l
        )
      )
    } else {
      const { data, error } = await supabase
        .from('seating_layouts')
        .insert({
          class_id: selectedClass.id,
          name: layoutName,
          positions: positions as any,
        })
        .select('*')
        .single()
      if (error) {
        setError(error.message)
        return
      }
      if (data) {
        setLayouts((prev) => [data, ...prev])
        setCurrentLayoutId(data.id)
      }
    }
    if (soundEnabled) soundManager.playSound('success')
  }

  const loadLayout = (layout: Layout) => {
    if (!isPositions(layout.positions)) return
    setCurrentLayoutId(layout.id)
    setLayoutName(layout.name)
    setRows(layout.positions.rows)
    setCols(layout.positions.cols)
    setCells(layout.positions.cells)
    setPickedUp(null)
  }

  const deleteLayout = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('seating_layouts').delete().eq('id', id)
    if (error) {
      setError(error.message)
      return
    }
    setLayouts((prev) => prev.filter((l) => l.id !== id))
    if (currentLayoutId === id) {
      setCurrentLayoutId(null)
      setLayoutName('My Layout')
      setCells(emptyCells(rows, cols))
    }
  }

  const newLayout = () => {
    setCurrentLayoutId(null)
    setLayoutName('My Layout')
    setCells(emptyCells(rows, cols))
    setPickedUp(null)
  }

  if (!selectedClass) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-stone-300 bg-white/60 p-10 text-center">
        <p className="text-lg font-bold text-stone-600">
          Pick a class to build a seating chart.
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
            Make sure <code>supabase/migration_phase2.sql</code> has been run.
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="rounded-2xl bg-white/60 border-2 border-stone-200 p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            placeholder="Layout name"
            className="max-w-xs"
          />
          <Button onClick={save}>
            <Save className="mr-1 h-4 w-4" />
            {currentLayoutId ? 'Update' : 'Save'}
          </Button>
          <Button variant="outline" onClick={newLayout}>
            New
          </Button>
          <Button variant="outline" onClick={autoFill} disabled={students.length === 0}>
            <Shuffle className="mr-1 h-4 w-4" />
            Auto-Fill (Shuffle)
          </Button>
          <Button variant="ghost" onClick={clearAll}>
            <RotateCcw className="mr-1 h-4 w-4" />
            Clear
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-600">Rows:</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => resizeGrid(rows - 1, cols)}>
              <Minus className="h-3 w-3" />
            </Button>
            <span className="font-black w-6 text-center tabular-nums">{rows}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => resizeGrid(rows + 1, cols)}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-600">Cols:</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => resizeGrid(rows, cols - 1)}>
              <Minus className="h-3 w-3" />
            </Button>
            <span className="font-black w-6 text-center tabular-nums">{cols}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => resizeGrid(rows, cols + 1)}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {layouts.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-200">
            {layouts.map((l) => (
              <div
                key={l.id}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border-2 pl-3 pr-1 py-1 text-sm font-bold',
                  currentLayoutId === l.id
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                    : 'border-stone-200 bg-white text-stone-700'
                )}
              >
                <button onClick={() => loadLayout(l)}>{l.name}</button>
                <button
                  onClick={() => deleteLayout(l.id)}
                  className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-rose-100 text-stone-400 hover:text-rose-600"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* The Board (front) */}
      <div className="text-center text-xs font-bold text-stone-500 uppercase tracking-wider">
        — Front of Room —
      </div>

      {/* Grid */}
      <div
        className="grid gap-2 bg-white/40 border-2 border-dashed border-stone-300 rounded-2xl p-4"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {cells.map((studentId, index) => {
          const student = studentId ? studentById[studentId] : null
          const isEmpty = !student
          return (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              className={cn(
                'relative aspect-[4/3] rounded-xl border-2 p-2 text-sm font-bold transition-all',
                isEmpty
                  ? 'border-dashed border-stone-300 bg-white/60 text-stone-400 hover:bg-white'
                  : 'border-emerald-300 bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-900 hover:shadow-md',
                pickedUp && 'cursor-pointer',
                pickedUp === studentId && 'ring-4 ring-amber-400'
              )}
            >
              {student ? (
                <>
                  <span className="block truncate">{student.name}</span>
                  {!pickedUp && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        clearCell(index)
                      }}
                      className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center rounded-full bg-white/80 text-stone-400 hover:text-rose-600 opacity-0 hover:opacity-100"
                      title="Empty this seat"
                    >
                      <Trash2 className="h-3 w-3" />
                    </span>
                  )}
                </>
              ) : (
                <span className="opacity-60">+</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Unseated Tray */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-black text-stone-700">
              Unseated{' '}
              <span className="text-stone-400 font-normal">
                ({unseated.length})
              </span>
            </h3>
            {pickedUp && (
              <span className="text-xs font-bold text-amber-700">
                Click a seat to place {studentById[pickedUp]?.name}
              </span>
            )}
          </div>
          {unseated.length === 0 ? (
            <p className="text-sm text-stone-500">Everyone has a seat.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {unseated.map((s) => (
                <button
                  key={s.id}
                  onClick={() => pickUpFromTray(s.id)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border-2 px-3 py-1.5 text-sm font-bold transition-all',
                    pickedUp === s.id
                      ? 'border-amber-400 bg-amber-100 text-amber-900 ring-2 ring-amber-300'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
