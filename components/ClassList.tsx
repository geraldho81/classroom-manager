'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { UserPlus, Trash2, Edit2, Check, X, Upload, Users } from 'lucide-react'
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

export function ClassList() {
  const {
    students,
    attendance,
    loading,
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

  const [newStudentName, setNewStudentName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const [showAttendance, setShowAttendance] = useState(false)

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

  const presentCount = Object.values(attendanceMap).filter((s) => s === 'present').length
  const lateCount = Object.values(attendanceMap).filter((s) => s === 'late').length
  const absentCount = Object.values(attendanceMap).filter((s) => s === 'absent').length
  const unmarkedCount = Math.max(0, students.length - presentCount - lateCount - absentCount)

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

  const setAttendanceStatus = async (studentId: string, status?: AttendanceStatus) => {
    await setAttendance(studentId, attendanceDate, status)
    if (soundEnabled) {
      soundManager.playSound(status ? 'pop' : 'click')
    }
  }

  const attendanceButtonClass = (status: AttendanceStatus, active: boolean) =>
    cn(
      'px-3 py-1 rounded-full text-xs font-bold border-2 transition-all',
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

  if (!selectedClass) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Class Selected</h3>
          <p className="text-muted-foreground">
            Select a class from the sidebar to view students.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <span>📋</span> Class List
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
                    title: 'Remove All Students?',
                    message: 'This will clear your entire class list. Are you sure?',
                    confirmText: 'Yes, clear all',
                    variant: 'danger',
                    emoji: '🗑️',
                  })
                  if (ok) {
                    await clearAllStudents()
                    if (soundEnabled) {
                      soundManager.playSound('alert')
                    }
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Button
            size="sm"
            variant={showAttendance ? 'outline' : 'secondary'}
            onClick={() => setShowAttendance(false)}
          >
            Roster
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
      <CardContent>
        {showAttendance && (
          <div className="mb-4 p-4 rounded-2xl border-2 border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50">
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div>
                <p className="text-sm text-cyan-700 font-bold">
                  Attendance for {new Date(attendanceDate).toLocaleDateString()}
                </p>
                <div className="flex flex-wrap gap-2 mt-2 text-xs font-bold">
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
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="success"
                  onClick={async () => {
                    await setAllAttendance(attendanceDate, 'present')
                    if (soundEnabled) {
                      soundManager.playSound('sparkle')
                    }
                  }}
                  disabled={students.length === 0}
                >
                  Mark All Present
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await clearAttendance(attendanceDate)
                    if (soundEnabled) {
                      soundManager.playSound('click')
                    }
                  }}
                  disabled={students.length === 0}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}

        {!showAttendance && showImport && (
          <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
            <Textarea
              placeholder="Paste names (one per line or comma-separated)"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="mb-3"
              rows={4}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleImport}>
                ✨ Import
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

        {!showAttendance && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleAddStudent()
            }}
            className="flex gap-2 mb-4"
          >
            <Input
              placeholder="Add student name..."
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="text-lg"
            />
            <Button type="submit" size="icon" className="shrink-0">
              <UserPlus className="h-5 w-5" />
            </Button>
          </form>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-purple-500 font-bold">Loading...</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[480px] overflow-y-auto">
            {students.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">👋</p>
                <p className="text-purple-500 font-bold">No students yet!</p>
                <p className="text-sm text-purple-400">Add some names above</p>
              </div>
            ) : (
              students.map((student, index) => (
                <div
                  key={student.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-2xl group transition-all',
                    'bg-gradient-to-r hover:scale-[1.02]',
                    student.excluded
                      ? 'from-gray-100 to-gray-50 opacity-50'
                      : index % 2 === 0
                      ? 'from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100'
                      : 'from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100'
                  )}
                >
                  {showAttendance ? (
                    <>
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
                          Present
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
                          Late
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
                          Absent
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
                        className="h-10 w-10 p-0"
                      >
                        <Check className="h-5 w-5 text-green-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={cancelEdit}
                        className="h-10 w-10 p-0"
                      >
                        <X className="h-5 w-5 text-red-500" />
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
                          'w-7 h-7 rounded-lg border-3 flex items-center justify-center shrink-0 transition-all',
                          student.excluded
                            ? 'border-gray-300 bg-gray-100'
                            : 'border-purple-400 bg-purple-500'
                        )}
                      >
                        {!student.excluded && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </button>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(student)}
                        className="h-10 w-10 p-0 opacity-0 group-hover:opacity-100"
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
                        className="h-10 w-10 p-0 opacity-0 group-hover:opacity-100 text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
