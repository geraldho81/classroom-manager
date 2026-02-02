'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './AuthContext'
import type { Database } from '@/lib/supabase/types'

type Class = Database['public']['Tables']['classes']['Row']

interface ClassContextType {
  classes: Class[]
  selectedClass: Class | null
  loading: boolean
  selectClass: (classId: string) => void
  createClass: (name: string) => Promise<Class | null>
  updateClass: (classId: string, name: string) => Promise<void>
  deleteClass: (classId: string) => Promise<void>
  refreshClasses: () => Promise<void>
}

const ClassContext = createContext<ClassContextType>({
  classes: [],
  selectedClass: null,
  loading: true,
  selectClass: () => { },
  createClass: async () => null,
  updateClass: async () => { },
  deleteClass: async () => { },
  refreshClasses: async () => { },
})

const SELECTED_CLASS_KEY = 'classroom-selected-class'

export function ClassProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [fetching, setFetching] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  // Track previous user ID to avoid reloading on object reference change
  const prevUserIdRef = useRef<string | undefined>(undefined)

  const fetchClasses = useCallback(async (userId: string) => {
    console.log('ClassContext: Fetching classes for user:', userId)
    setFetching(true)

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      const supabase = createClient()
      const fetchPromise = supabase
        .from('classes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      const result = await Promise.race([fetchPromise, timeoutPromise]) as any;
      const { data, error } = result;

      if (error) {
        console.error('ClassContext: Error fetching classes:', error)
        // Can't throw here inside race unless handled, just log.
      } else {
        console.log('ClassContext: Fetched classes successfully:', data?.length || 0)
        const classList = data || []
        setClasses(classList)

        // Restore/Set selected class
        const savedClassId = localStorage.getItem(SELECTED_CLASS_KEY)
        const savedClass = classList.find((c: Class) => c.id === savedClassId)

        if (savedClass) {
          setSelectedClass(savedClass)
        } else if (classList.length > 0) {
          setSelectedClass(classList[0])
          localStorage.setItem(SELECTED_CLASS_KEY, classList[0].id)
        } else {
          setSelectedClass(null)
        }
      }
    } catch (err) {
      console.error('ClassContext: Fetch failed or timed out:', err)
    } finally {
      setFetching(false)
      setHasFetched(true)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Logged out
      setClasses([])
      setSelectedClass(null)
      setHasFetched(true)
      prevUserIdRef.current = undefined;
      return;
    }

    // Only fetch if user ID changed or we haven't fetched yet
    if (user.id !== prevUserIdRef.current || !hasFetched) {
      prevUserIdRef.current = user.id;
      fetchClasses(user.id);
    }
  }, [authLoading, user, fetchClasses, hasFetched])

  // Derive loading state
  // If auth is done, and we have result (hasFetched), we are NOT loading.
  // We only show loading if: 
  // 1. Auth is checking (authLoading)
  // 2. We have a user but haven't successfully finished our first fetch (!hasFetched)
  // We do NOT show loading during subsequent re-fetches (background updates) unless explicitly desired.
  // Let's stick to initial load blocking only.
  const loading = authLoading || (!!user && !hasFetched)

  const selectClass = (classId: string) => {
    const cls = classes.find((c) => c.id === classId)
    if (cls) {
      setSelectedClass(cls)
      localStorage.setItem(SELECTED_CLASS_KEY, classId)
    }
  }

  const createClass = async (name: string): Promise<Class | null> => {
    if (!user) return null

    const supabase = createClient()
    const { data, error } = await supabase
      .from('classes')
      .insert({ user_id: user.id, name })
      .select()
      .single()

    if (error || !data) {
      console.error('ClassContext: Error creating class:', error)
      return null
    }

    setClasses((prev) => [data, ...prev])
    setSelectedClass(data)
    localStorage.setItem(SELECTED_CLASS_KEY, data.id)
    return data
  }

  const updateClass = async (classId: string, name: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('classes')
      .update({ name })
      .eq('id', classId)

    if (!error) {
      setClasses((prev) =>
        prev.map((c) => (c.id === classId ? { ...c, name } : c))
      )
      if (selectedClass?.id === classId) {
        setSelectedClass((prev) => (prev ? { ...prev, name } : null))
      }
    }
  }

  const deleteClass = async (classId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('classes').delete().eq('id', classId)

    if (!error) {
      const newClasses = classes.filter((c) => c.id !== classId)
      setClasses(newClasses)

      if (selectedClass?.id === classId) {
        const nextClass = newClasses[0] || null
        setSelectedClass(nextClass)
        if (nextClass) {
          localStorage.setItem(SELECTED_CLASS_KEY, nextClass.id)
        } else {
          localStorage.removeItem(SELECTED_CLASS_KEY)
        }
      }
    }
  }

  return (
    <ClassContext.Provider
      value={{
        classes,
        selectedClass,
        loading,
        selectClass,
        createClass,
        updateClass,
        deleteClass,
        refreshClasses: () => {
          if (user) return fetchClasses(user.id);
          return Promise.resolve();
        },
      }}
    >
      {children}
    </ClassContext.Provider>
  )
}

export const useClass = () => useContext(ClassContext)
