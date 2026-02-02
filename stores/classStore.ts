import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

export type Student = Database['public']['Tables']['students']['Row']
export type AttendanceStatus = 'present' | 'absent' | 'late'
export type AttendanceRecord = Database['public']['Tables']['attendance']['Row']
export type ClassNote = Database['public']['Tables']['notes']['Row']

interface ClassState {
  // Data
  students: Student[]
  notes: ClassNote[]
  attendance: AttendanceRecord[]

  // Loading states
  loading: boolean
  error: string | null

  // Current class
  currentClassId: string | null

  // Actions
  setCurrentClass: (classId: string | null) => void
  fetchStudents: (classId: string) => Promise<void>
  addStudent: (name: string) => Promise<void>
  removeStudent: (id: string) => Promise<void>
  updateStudent: (id: string, name: string) => Promise<void>
  toggleStudentExclusion: (id: string) => Promise<void>
  clearAllStudents: () => Promise<void>
  importStudents: (names: string[]) => Promise<void>

  // Attendance
  fetchAttendance: (classId: string, date: string) => Promise<void>
  setAttendance: (studentId: string, date: string, status?: AttendanceStatus) => Promise<void>
  setAllAttendance: (date: string, status: AttendanceStatus) => Promise<void>
  clearAttendance: (date: string) => Promise<void>

  // Notes
  fetchNotes: (classId: string) => Promise<void>
  addNote: (text: string) => Promise<void>
  removeNote: (id: string) => Promise<void>
  clearNotes: () => Promise<void>
}

export const useClassStore = create<ClassState>((set, get) => ({
  students: [],
  notes: [],
  attendance: [],
  loading: false,
  error: null,
  currentClassId: null,

  setCurrentClass: (classId) => {
    set({ currentClassId: classId, students: [], notes: [], attendance: [] })
    if (classId) {
      get().fetchStudents(classId)
      get().fetchNotes(classId)
    }
  },

  fetchStudents: async (classId) => {
    set({ loading: true, error: null })
    const supabase = createClient()

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: true })

    if (error) {
      set({ error: error.message, loading: false })
    } else {
      set({ students: data || [], loading: false })
    }
  },

  addStudent: async (name) => {
    const { currentClassId } = get()
    if (!currentClassId) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from('students')
      .insert({ class_id: currentClassId, name: name.trim() })
      .select()
      .single()

    if (!error && data) {
      set((state) => ({ students: [...state.students, data] }))
    }
  },

  removeStudent: async (id) => {
    const supabase = createClient()
    const { error } = await supabase.from('students').delete().eq('id', id)

    if (!error) {
      set((state) => ({
        students: state.students.filter((s) => s.id !== id),
        attendance: state.attendance.filter((a) => a.student_id !== id),
      }))
    }
  },

  updateStudent: async (id, name) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('students')
      .update({ name: name.trim() })
      .eq('id', id)

    if (!error) {
      set((state) => ({
        students: state.students.map((s) =>
          s.id === id ? { ...s, name: name.trim() } : s
        ),
      }))
    }
  },

  toggleStudentExclusion: async (id) => {
    const { students } = get()
    const student = students.find((s) => s.id === id)
    if (!student) return

    const supabase = createClient()
    const { error } = await supabase
      .from('students')
      .update({ excluded: !student.excluded })
      .eq('id', id)

    if (!error) {
      set((state) => ({
        students: state.students.map((s) =>
          s.id === id ? { ...s, excluded: !s.excluded } : s
        ),
      }))
    }
  },

  clearAllStudents: async () => {
    const { currentClassId } = get()
    if (!currentClassId) return

    const supabase = createClient()
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('class_id', currentClassId)

    if (!error) {
      set({ students: [], attendance: [] })
    }
  },

  importStudents: async (names) => {
    const { currentClassId, clearAllStudents, fetchStudents } = get()
    if (!currentClassId) return

    await clearAllStudents()

    const supabase = createClient()
    const studentsToInsert = names
      .filter((n) => n.trim())
      .map((name) => ({
        class_id: currentClassId,
        name: name.trim(),
      }))

    if (studentsToInsert.length > 0) {
      await supabase.from('students').insert(studentsToInsert)
      await fetchStudents(currentClassId)
    }
  },

  fetchAttendance: async (classId, date) => {
    const supabase = createClient()

    const { data } = await supabase
      .from('attendance')
      .select('*, students!inner(class_id)')
      .eq('students.class_id', classId)
      .eq('date', date)

    set({ attendance: data || [] })
  },

  setAttendance: async (studentId, date, status) => {
    const supabase = createClient()

    if (status) {
      // Upsert attendance record
      const { data, error } = await supabase
        .from('attendance')
        .upsert(
          { student_id: studentId, date, status },
          { onConflict: 'student_id,date' }
        )
        .select()
        .single()

      if (!error && data) {
        set((state) => ({
          attendance: [
            ...state.attendance.filter(
              (a) => !(a.student_id === studentId && a.date === date)
            ),
            data,
          ],
        }))
      }
    } else {
      // Delete attendance record
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('student_id', studentId)
        .eq('date', date)

      if (!error) {
        set((state) => ({
          attendance: state.attendance.filter(
            (a) => !(a.student_id === studentId && a.date === date)
          ),
        }))
      }
    }
  },

  setAllAttendance: async (date, status) => {
    const { students, currentClassId } = get()
    if (!currentClassId || students.length === 0) return

    const supabase = createClient()
    const records = students.map((s) => ({
      student_id: s.id,
      date,
      status,
    }))

    const { data, error } = await supabase
      .from('attendance')
      .upsert(records, { onConflict: 'student_id,date' })
      .select()

    if (!error && data) {
      set((state) => ({
        attendance: [
          ...state.attendance.filter((a) => a.date !== date),
          ...data,
        ],
      }))
    }
  },

  clearAttendance: async (date) => {
    const { students } = get()
    if (students.length === 0) return

    const supabase = createClient()
    const studentIds = students.map((s) => s.id)

    const { error } = await supabase
      .from('attendance')
      .delete()
      .in('student_id', studentIds)
      .eq('date', date)

    if (!error) {
      set((state) => ({
        attendance: state.attendance.filter((a) => a.date !== date),
      }))
    }
  },

  fetchNotes: async (classId) => {
    const supabase = createClient()

    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false })

    set({ notes: data || [] })
  },

  addNote: async (text) => {
    const { currentClassId } = get()
    if (!currentClassId) return

    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('notes')
      .insert({ class_id: currentClassId, text, date: today })
      .select()
      .single()

    if (!error && data) {
      set((state) => ({ notes: [data, ...state.notes] }))
    }
  },

  removeNote: async (id) => {
    const supabase = createClient()
    const { error } = await supabase.from('notes').delete().eq('id', id)

    if (!error) {
      set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }))
    }
  },

  clearNotes: async () => {
    const { currentClassId } = get()
    if (!currentClassId) return

    const supabase = createClient()
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('class_id', currentClassId)

    if (!error) {
      set({ notes: [] })
    }
  },
}))
