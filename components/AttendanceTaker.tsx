'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCheck, Download, Eraser, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { soundManager } from '@/lib/sounds'
import { useClassStore, type AttendanceStatus } from '@/stores/classStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useClass } from '@/contexts/ClassContext'

function toISODate(d: Date) {
  return d.toISOString().split('T')[0]
}

function addDays(iso: string, delta: number) {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + delta)
  return toISODate(d)
}

function lastNDays(n: number, endISO: string) {
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    out.push(addDays(endISO, -i))
  }
  return out
}

function formatShort(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatDayLabel(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'short' }) +
    '\n' + d.getDate()
}

export function AttendanceTaker() {
  const {
    students,
    attendance,
    fetchStudents,
    fetchAttendanceRange,
    setAttendance,
    setAllAttendance,
    clearAttendance,
    setCurrentClass,
  } = useClassStore()
  const { soundEnabled } = useSettingsStore()
  const { selectedClass } = useClass()

  const [selectedDate, setSelectedDate] = useState<string>(toISODate(new Date()))
  const [view, setView] = useState<'taker' | 'history'>('taker')

  const rangeEnd = selectedDate
  const rangeStart = useMemo(() => addDays(selectedDate, -6), [selectedDate])
  const historyDays = useMemo(() => lastNDays(7, rangeEnd), [rangeEnd])

  useEffect(() => {
    if (selectedClass?.id) {
      setCurrentClass(selectedClass.id)
      fetchStudents(selectedClass.id)
      fetchAttendanceRange(selectedClass.id, rangeStart, rangeEnd)
    }
  }, [selectedClass?.id, rangeStart, rangeEnd, setCurrentClass, fetchStudents, fetchAttendanceRange])

  const dayMap = useMemo(() => {
    const map: Record<string, AttendanceStatus> = {}
    attendance
      .filter((a) => a.date === selectedDate)
      .forEach((a) => {
        map[a.student_id] = a.status
      })
    return map
  }, [attendance, selectedDate])

  const rangeMap = useMemo(() => {
    const map: Record<string, Record<string, AttendanceStatus>> = {}
    attendance.forEach((a) => {
      if (!map[a.student_id]) map[a.student_id] = {}
      map[a.student_id][a.date] = a.status
    })
    return map
  }, [attendance])

  const activeStudents = useMemo(
    () => students.filter((s) => !s.excluded),
    [students]
  )

  const presentCount = Object.values(dayMap).filter((s) => s === 'present').length
  const lateCount = Object.values(dayMap).filter((s) => s === 'late').length
  const absentCount = Object.values(dayMap).filter((s) => s === 'absent').length
  const unmarkedCount = Math.max(0, activeStudents.length - presentCount - lateCount - absentCount)
  const attendanceRate =
    activeStudents.length > 0
      ? Math.round(((presentCount + lateCount * 0.5) / activeStudents.length) * 100)
      : 0

  const handleSet = useCallback(
    async (studentId: string, status?: AttendanceStatus) => {
      await setAttendance(studentId, selectedDate, status)
      if (soundEnabled) {
        soundManager.playSound(status ? 'pop' : 'click')
      }
    },
    [setAttendance, selectedDate, soundEnabled]
  )

  const handleMarkAllPresent = useCallback(async () => {
    await setAllAttendance(selectedDate, 'present')
    if (soundEnabled) soundManager.playSound('sparkle')
  }, [setAllAttendance, selectedDate, soundEnabled])

  const handleClear = useCallback(async () => {
    await clearAttendance(selectedDate)
    if (soundEnabled) soundManager.playSound('click')
  }, [clearAttendance, selectedDate, soundEnabled])

  const exportCSV = useCallback(() => {
    if (!selectedClass) return
    const headers = ['Student', ...historyDays]
    const rows = students.map((s) => {
      const row = [s.name]
      historyDays.forEach((d) => {
        row.push(rangeMap[s.id]?.[d] || '')
      })
      return row
    })
    const csv = [headers, ...rows]
      .map((r) =>
        r
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-${selectedClass.name.replace(/\s+/g, '-')}-${rangeStart}_to_${rangeEnd}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [selectedClass, students, historyDays, rangeMap, rangeStart, rangeEnd])

  const statusPillClass = (status: AttendanceStatus, active: boolean) =>
    cn(
      'px-3 py-1.5 rounded-full text-sm font-bold border-2 transition-all',
      status === 'present' &&
        (active
          ? 'bg-emerald-500 text-white border-emerald-600'
          : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'),
      status === 'late' &&
        (active
          ? 'bg-amber-500 text-white border-amber-600'
          : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50'),
      status === 'absent' &&
        (active
          ? 'bg-rose-500 text-white border-rose-600'
          : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50')
    )

  const historyDot = (status?: AttendanceStatus) => {
    if (!status) return <span className="inline-block w-4 h-4 rounded-full bg-slate-200" />
    const color =
      status === 'present'
        ? 'bg-emerald-500'
        : status === 'late'
        ? 'bg-amber-500'
        : 'bg-rose-500'
    return (
      <span
        className={cn('inline-block w-4 h-4 rounded-full', color)}
        title={status}
      />
    )
  }

  if (!selectedClass) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Class Selected</h3>
          <p className="text-muted-foreground">
            Select a class from the sidebar to take attendance.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <span>✅</span> Attendance — {selectedClass.name}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={view === 'taker' ? 'secondary' : 'outline'}
                onClick={() => setView('taker')}
              >
                Today
              </Button>
              <Button
                size="sm"
                variant={view === 'history' ? 'secondary' : 'outline'}
                onClick={() => setView('history')}
              >
                7-Day History
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              aria-label="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-44"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              aria-label="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedDate(toISODate(new Date()))}
            >
              Today
            </Button>
            <span className="ml-2 text-sm font-bold text-purple-600">
              {formatShort(selectedDate)}
            </span>
          </div>
        </CardHeader>

        <CardContent>
          {view === 'taker' && (
            <>
              <div className="mb-5 p-4 rounded-2xl border-2 border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-2xl font-black text-cyan-700">
                      {attendanceRate}%
                    </p>
                    <p className="text-xs font-bold text-cyan-600 uppercase tracking-wide">
                      Attendance rate
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-bold">
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                      Present: {presentCount}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                      Late: {lateCount}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700">
                      Absent: {absentCount}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                      Unmarked: {unmarkedCount}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={handleMarkAllPresent}
                      disabled={activeStudents.length === 0}
                    >
                      <CheckCheck className="h-4 w-4 mr-1" />
                      All Present
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleClear}
                      disabled={activeStudents.length === 0}
                    >
                      <Eraser className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                </div>
              </div>

              {students.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-4xl mb-2">👋</p>
                  <p className="text-purple-500 font-bold">No students yet!</p>
                  <p className="text-sm text-purple-400">
                    Add students in Class List to take attendance.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
                  {students.map((student, index) => (
                    <div
                      key={student.id}
                      className={cn(
                        'flex flex-wrap items-center gap-3 p-3 rounded-2xl transition-all',
                        'bg-gradient-to-r',
                        student.excluded
                          ? 'from-gray-100 to-gray-50 opacity-50'
                          : index % 2 === 0
                          ? 'from-purple-50 to-pink-50'
                          : 'from-blue-50 to-cyan-50'
                      )}
                    >
                      <span className="text-2xl">
                        {['😊', '😄', '🙂', '😎', '🤗', '😃'][index % 6]}
                      </span>
                      <span
                        className={cn(
                          'flex-1 font-bold text-lg',
                          student.excluded && 'line-through text-gray-400'
                        )}
                      >
                        {student.name}
                      </span>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <button
                          className={statusPillClass(
                            'present',
                            dayMap[student.id] === 'present'
                          )}
                          onClick={() =>
                            handleSet(
                              student.id,
                              dayMap[student.id] === 'present' ? undefined : 'present'
                            )
                          }
                          disabled={student.excluded}
                        >
                          Present
                        </button>
                        <button
                          className={statusPillClass(
                            'late',
                            dayMap[student.id] === 'late'
                          )}
                          onClick={() =>
                            handleSet(
                              student.id,
                              dayMap[student.id] === 'late' ? undefined : 'late'
                            )
                          }
                          disabled={student.excluded}
                        >
                          Late
                        </button>
                        <button
                          className={statusPillClass(
                            'absent',
                            dayMap[student.id] === 'absent'
                          )}
                          onClick={() =>
                            handleSet(
                              student.id,
                              dayMap[student.id] === 'absent' ? undefined : 'absent'
                            )
                          }
                          disabled={student.excluded}
                        >
                          Absent
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {view === 'history' && (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-stone-600">
                  {formatShort(rangeStart)} — {formatShort(rangeEnd)}
                </p>
                <Button size="sm" variant="outline" onClick={exportCSV}>
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </Button>
              </div>

              {students.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-purple-500 font-bold">No students yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-stone-500">
                        <th className="text-left py-2 pr-4 font-bold">Student</th>
                        {historyDays.map((d) => (
                          <th
                            key={d}
                            className="px-2 py-2 text-center font-bold whitespace-pre-line"
                          >
                            {formatDayLabel(d)}
                          </th>
                        ))}
                        <th className="px-2 py-2 text-center font-bold">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => {
                        const studentRecords = rangeMap[student.id] || {}
                        const marked = historyDays
                          .map((d) => studentRecords[d])
                          .filter(Boolean) as AttendanceStatus[]
                        const rate =
                          marked.length === 0
                            ? null
                            : Math.round(
                                (marked.filter((s) => s === 'present' || s === 'late')
                                  .length /
                                  marked.length) *
                                  100
                              )
                        return (
                          <tr key={student.id} className="border-t border-stone-100">
                            <td className="py-2 pr-4 font-bold text-stone-700">
                              {student.name}
                              {student.excluded && (
                                <span className="ml-2 text-xs text-stone-400">
                                  (excluded)
                                </span>
                              )}
                            </td>
                            {historyDays.map((d) => (
                              <td key={d} className="px-2 py-2 text-center">
                                <div className="flex justify-center">
                                  {historyDot(studentRecords[d])}
                                </div>
                              </td>
                            ))}
                            <td className="px-2 py-2 text-center font-bold text-stone-700">
                              {rate === null ? '—' : `${rate}%`}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3 text-xs text-stone-500 font-bold">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-full bg-emerald-500" />
                  Present
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-full bg-amber-500" />
                  Late
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-full bg-rose-500" />
                  Absent
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded-full bg-slate-200" />
                  Unmarked
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
