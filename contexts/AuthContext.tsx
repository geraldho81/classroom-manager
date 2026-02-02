'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'
import { useRouter } from 'next/navigation'
import { useSettingsStore } from '@/stores/settingsStore'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signOut: async () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true;
    const supabase = createClient()

    console.log('AuthContext: Initializing auth check...')

    // FALLBACK TIMEOUT: If Supabase takes too long (>3s), we assume logged out or just proceed to let app render
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn("AuthContext: Initialization timed out. Forcing loading=false.")
        setLoading(false)
      }
    }, 3000)

    // Get initial session
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!mounted) return;

        if (error) {
          console.error('AuthContext: Error getting session:', error)
          setLoading(false)
          return
        }

        console.log('AuthContext: Initial session found:', !!session)

        if (session) {
          setSession(session)
          setUser(session.user)
          setLoading(false) // Ready immediately
          // Fetch profile in background
          fetchProfile(session.user.id)
        } else {
          setSession(null)
          setUser(null)
          setLoading(false)
        }
      } catch (err: any) {
        // CATCH "AbortError" or other runtime errors from supa-auth-js
        if (err.name === 'AbortError') {
          console.warn('AuthContext: Session fetch aborted (safe to ignore).')
        } else {
          console.error('AuthContext: Unexpected crash getting session:', err)
        }
        if (mounted) setLoading(false)
      } finally {
        clearTimeout(safetyTimeout)
      }
    }

    initSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      console.log('AuthContext: Auth state changed:', event, !!session)

      if (event === 'SIGNED_OUT') {
        setSession(null)
        setUser(null)
        setProfile(null)
        setLoading(false)
        router.push('/login')
        return
      }

      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (session?.user) {
        // Debounce or just fire profile fetch
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    }
  }, []) // Removed 'router' and 'loading' dependency to ensure this runs EXACTLY ONCE on mount

  const fetchProfile = async (userId: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setProfile(data)
        // Also fetch user settings (Time Loss, etc)
        useSettingsStore.getState().fetchSettings(userId)
      }
    } catch (err) {
      console.error('AuthContext: Unexpected error fetching profile:', err)
    }
  }

  const signOut = async () => {
    console.log('AuthContext: Signing out...')

    // Aggressive clear
    setUser(null)
    setProfile(null)
    setSession(null)
    setLoading(false)
    localStorage.clear()

    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (err) {
      console.error('AuthContext: Error telling Supabase to sign out (ignored):', err)
    } finally {
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
