'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { Shuffle, UserPlus, Trash2, Edit2, Check, X, Maximize, Upload, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { cn } from '@/lib/utils'
import { soundManager } from '@/lib/sounds'
import { useClassStore, type Student, type AttendanceStatus } from '@/stores/classStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useClass } from '@/contexts/ClassContext'

export function StudentPicker() {
  const {
    students,
    attendance,
    addStudent,
    removeStudent,
    updateStudent,
    toggleStudentExclusion,
    importStudents,
    clearAllStudents,
    setAttendance,
    setAllAttendance,
    clearAttendance,
    fetchStudents,
    fetchAttendance,
    setCurrentClass,
  } = useClassStore()
  const { soundEnabled } = useSettingsStore()
  const { selectedClass } = useClass()
  const confirm = useConfirm()

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [newStudentName, setNewStudentName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showAttendance, setShowAttendance] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const attendanceDate = useMemo(() => new Date().toISOString().split('T')[0], [])

  // Sync current class with store
  useEffect(() => {
    if (selectedClass?.id) {
      setCurrentClass(selectedClass.id)
      fetchStudents(selectedClass.id)
      fetchAttendance(selectedClass.id, attendanceDate)
    }
  }, [selectedClass?.id, setCurrentClass, fetchStudents, fetchAttendance, attendanceDate])

  // Build attendance map from array
  const attendanceMap = useMemo(() => {
    const map: Record<string, AttendanceStatus> = {}
    attendance
      .filter((a) => a.date === attendanceDate)
      .forEach((a) => {
        map[a.student_id] = a.status
      })
    return map
  }, [attendance, attendanceDate])

  const hasAttendance = Object.keys(attendanceMap).length > 0
  const availableStudents = students.filter(
    (s) =>
      !s.excluded &&
      (!hasAttendance ||
        attendanceMap[s.id] === 'present' ||
        attendanceMap[s.id] === 'late')
  )
  const presentCount = Object.values(attendanceMap).filter((s) => s === 'present').length
  const lateCount = Object.values(attendanceMap).filter((s) => s === 'late').length
  const absentCount = Object.values(attendanceMap).filter((s) => s === 'absent').length
  const unmarkedCount = Math.max(0, students.length - presentCount - lateCount - absentCount)

  const pickRandom = useCallback(() => {
    if (availableStudents.length === 0) return

    setIsSpinning(true)
    setSelectedStudent(null)
    setShowConfetti(false)
    if (soundEnabled) {
      soundManager.playSound('whoosh')
    }

    let count = 0
    const maxCount = 15
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * availableStudents.length)
      setSelectedStudent(availableStudents[randomIndex])
      count++

      if (count >= maxCount) {
        clearInterval(interval)
        const finalIndex = Math.floor(Math.random() * availableStudents.length)
        setSelectedStudent(availableStudents[finalIndex])
        setIsSpinning(false)
        setShowConfetti(true)
        if (soundEnabled) {
          soundManager.playSound('fanfare')
        }
      }
    }, 100)
  }, [availableStudents, soundEnabled])

  const handleAddStudent = useCallback(async () => {
    if (newStudentName.trim()) {
      await addStudent(newStudentName.trim())
      if (soundEnabled) {
        soundManager.playSound('pop')
      }
      setNewStudentName('')
    }
  }, [newStudentName, addStudent, soundEnabled])

  const handleImport = useCallback(async () => {
    const names = importText
      .split(/[\n,]/)
      .map((n) => n.trim())
      .filter((n) => n)
    if (names.length > 0) {
      await importStudents(names)
      if (soundEnabled) {
        soundManager.playSound('sparkle')
      }
      setImportText('')
      setShowImport(false)
    }
  }, [importText, importStudents, soundEnabled])

  const startEditing = (student: Student) => {
    setEditingId(student.id)
    setEditingName(student.name)
  }

  const saveEdit = async () => {
    if (editingId && editingName.trim()) {
      await updateStudent(editingId, editingName.trim())
      if (soundEnabled) {
        soundManager.playSound('click')
      }
    }
    setEditingId(null)
    setEditingName('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  const setAttendanceStatus = async (studentId: string, status?: AttendanceStatus) => {
    await setAttendance(studentId, attendanceDate, status)
  }

  const attendanceButtonClass = (status: AttendanceStatus, active: boolean) =>
    cn(
      'px-3 py-1 rounded-full text-xs font-bold border-2 transition-all',
      status === 'present' &&
      (active
        ? 'bg-secondary text-secondary-foreground border-stone-800/10'
        : 'bg-white text-stone-500 border-stone-200 hover:bg-secondary/20'),
      status === 'late' &&
      (active
        ? 'bg-amber-200 text-amber-900 border-stone-800/10'
        : 'bg-white text-stone-500 border-stone-200 hover:bg-amber-100'),
      status === 'absent' &&
      (active
        ? 'bg-destructive text-destructive-foreground border-stone-800/10'
        : 'bg-white text-stone-500 border-stone-200 hover:bg-destructive/20')
    )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          if (!isSpinning) pickRandom()
          break
        case 'f':
        case 'F':
          toggleFullscreen()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pickRandom, isSpinning, toggleFullscreen])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  if (!selectedClass) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Class Selected</h3>
          <p className="text-muted-foreground">
            Select a class from the sidebar to pick students.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'grid gap-6',
        isFullscreen ? 'bg-[#FFFDF7] min-h-screen p-8 place-content-center' : 'lg:grid-cols-2'
      )}
    >
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#FFB7B2', '#B5EAD7', '#C7CEEA', '#FFDAC1'][
                  Math.floor(Math.random() * 4)
                ],
                animationDelay: `${Math.random() * 2}s`,
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
                width: '12px',
                height: '12px',
              }}
            />
          ))}
        </div>
      )}

      {/* Picker Display */}
      <Card className={cn('lg:col-span-1', isFullscreen && 'max-w-2xl w-full border-4 shadow-xl')}>
        <CardContent className="p-8">
          <div className="text-center">
            {/* Fun header */}
            <div className="text-6xl mb-6 font-heading animate-float-gentle">
              {isSpinning ? '🎰' : selectedStudent ? '✨' : '🎪'}
            </div>

            {/* Selected Student Display */}
            <div
              className={cn(
                'min-h-[220px] flex items-center justify-center mb-10 rounded-organic-2 p-10 transition-all duration-300',
                'bg-amber-50 border-2 border-amber-100',
                isSpinning && 'animate-wiggle-slow scale-105'
              )}
            >
              {selectedStudent ? (
                <div className={cn(showConfetti && 'animate-pulse')}>
                  <p className="font-heading text-6xl text-stone-800 drop-shadow-sm">
                    {selectedStudent.name}
                  </p>
                  {showConfetti && (
                    <p className="text-2xl mt-4 font-heading text-primary">★ Chosen One ★</p>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-4xl mb-4 opacity-50">🎲</p>
                  <p className="text-2xl font-heading text-stone-500">
                    {availableStudents.length > 0
                      ? 'Who shall it be?'
                      : 'Add students to begin!'}
                  </p>
                </div>
              )}
            </div>

            {/* Pick Button */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="fun"
                size="xl"
                onClick={pickRandom}
                disabled={isSpinning || availableStudents.length === 0}
                className="min-w-[200px] text-2xl"
              >
                <Shuffle className={cn('mr-3 h-6 w-6', isSpinning && 'animate-spin')} />
                {isSpinning ? 'Spinning...' : 'Pick Random'}
              </Button>
              <Button variant="ghost" size="icon-lg" onClick={toggleFullscreen}>
                <Maximize className="h-6 w-6" />
              </Button>
            </div>

            <p className="mt-8 text-lg font-heading text-stone-400">
              {availableStudents.length} students waiting...
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      {!isFullscreen && (
        <Card>
          <CardHeader className="pb-3 border-b-2 border-dashed border-stone-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <span>📜</span> Class Roster
              </CardTitle>
              <div className="flex gap-2">
                {!showAttendance && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImport(!showImport)}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Import
                  </Button>
                )}
                {students.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      const ok = await confirm({
                        title: 'Clear Roster?',
                        message: 'This will remove everyone from the list. Are you sure?',
                        confirmText: 'Yes, clear all',
                        variant: 'danger',
                        emoji: '🗑️',
                      })
                      if (ok) await clearAllStudents()
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button
                size="sm"
                variant={showAttendance ? 'outline' : 'secondary'}
                onClick={() => setShowAttendance(false)}
              >
                Students
              </Button>
              <Button
                size="sm"
                variant={showAttendance ? 'secondary' : 'outline'}
                onClick={() => setShowAttendance(true)}
              >
                Attendance
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {showAttendance && (
              <div className="mb-6 p-4 rounded-organic border-2 border-secondary/30 bg-secondary/5">
                <div className="flex flex-wrap items-center gap-3 justify-between">
                  <div>
                    <p className="text-sm text-stone-600 font-bold mb-2">
                      {new Date(attendanceDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs font-bold">
                      <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                        Present: {presentCount}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                        Late: {lateCount}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-destructive/20 text-destructive-foreground">
                        Absent: {absentCount}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => setAllAttendance(attendanceDate, 'present')}
                      disabled={students.length === 0}
                    >
                      All Present
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => clearAttendance(attendanceDate)}
                      disabled={students.length === 0}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Import Form */}
            {!showAttendance && showImport && (
              <div className="mb-6 p-4 bg-stone-50 rounded-lg border-2 border-dashed border-stone-200">
                <Textarea
                  placeholder="Paste names here... (one per line)"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="mb-3 bg-white"
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleImport}>
                    Add Names
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowImport(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Add Student Form */}
            {!showAttendance && (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleAddStudent()
                }}
                className="flex gap-2 mb-6"
              >
                <Input
                  placeholder="Type a name..."
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="text-lg bg-stone-50 border-stone-200 focus:bg-white"
                />
                <Button type="submit" size="icon" className="shrink-0">
                  <UserPlus className="h-5 w-5" />
                </Button>
              </form>
            )}

            {/* Student List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {students.length === 0 ? (
                <div className="text-center py-12 opacity-50">
                  <p className="text-4xl mb-4">📝</p>
                  <p className="font-heading text-xl">The list is empty...</p>
                </div>
              ) : (
                students.map((student, index) => (
                  <div
                    key={student.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl group transition-all duration-300',
                      'bg-white border text-stone-700 hover:shadow-sm hover:border-primary/50',
                      student.excluded
                        ? 'opacity-50 bg-stone-100 border-dashed'
                        : index % 2 === 0
                          ? 'border-stone-100'
                          : 'border-stone-50 bg-stone-50/50'
                    )}
                  >
                    {showAttendance ? (
                      <>
                        <span className="font-heading text-xl w-8 text-center text-stone-400">
                          {index + 1}.
                        </span>
                        <span className="flex-1 font-bold text-lg font-heading">
                          {student.name}
                        </span>
                        <div className="flex gap-1 justify-end">
                          <button
                            className={attendanceButtonClass(
                              'present',
                              attendanceMap[student.id] === 'present'
                            )}
                            onClick={() =>
                              setAttendanceStatus(
                                student.id,
                                attendanceMap[student.id] === 'present'
                                  ? undefined
                                  : 'present'
                              )
                            }
                          >
                            P
                          </button>
                          <button
                            className={attendanceButtonClass(
                              'late',
                              attendanceMap[student.id] === 'late'
                            )}
                            onClick={() =>
                              setAttendanceStatus(
                                student.id,
                                attendanceMap[student.id] === 'late'
                                  ? undefined
                                  : 'late'
                              )
                            }
                          >
                            L
                          </button>
                          <button
                            className={attendanceButtonClass(
                              'absent',
                              attendanceMap[student.id] === 'absent'
                            )}
                            onClick={() =>
                              setAttendanceStatus(
                                student.id,
                                attendanceMap[student.id] === 'absent'
                                  ? undefined
                                  : 'absent'
                              )
                            }
                          >
                            A
                          </button>
                        </div>
                      </>
                    ) : editingId === student.id ? (
                      <>
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 h-10"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit()
                            if (e.key === 'Escape') cancelEdit()
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={saveEdit}
                          className="h-10 w-10 p-0 text-green-600"
                        >
                          <Check className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEdit}
                          className="h-10 w-10 p-0 text-red-400"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={async () => {
                            await toggleStudentExclusion(student.id)
                            if (soundEnabled) {
                              soundManager.playSound('click')
                            }
                          }}
                          className={cn(
                            'w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
                            student.excluded
                              ? 'border-stone-300 bg-stone-100'
                              : 'border-primary bg-primary text-primary-foreground'
                          )}
                        >
                          {!student.excluded && (
                            <Check className="h-3 w-3" />
                          )}
                        </button>
                        <span className="font-heading text-xl w-8 text-center text-stone-400 opacity-50">
                          {index + 1}
                        </span>
                        <span
                          className={cn(
                            'flex-1 font-bold text-lg font-heading',
                            student.excluded && 'line-through text-stone-400'
                          )}
                        >
                          {student.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(student)}
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            await removeStudent(student.id)
                            if (soundEnabled) {
                              soundManager.playSound('click')
                            }
                          }}
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 text-stone-400 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keyboard hints */}
      {!isFullscreen && (
        <div className="lg:col-span-2 flex flex-wrap gap-4 justify-center text-sm font-bold text-stone-400 font-heading">
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-0.5 bg-stone-100 rounded text-stone-600 border border-stone-200">Space</kbd> Pick Random
          </span>
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-0.5 bg-stone-100 rounded text-stone-600 border border-stone-200">F</kbd> Fullscreen
          </span>
        </div>
      )}
    </div>
  )
}
