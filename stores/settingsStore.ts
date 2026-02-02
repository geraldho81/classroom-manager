import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { getCurrentDateKey } from '@/lib/utils'

interface TimeLossData {
  [date: string]: number
}

interface SettingsState {
  // Audio settings
  soundEnabled: boolean
  volume: number

  // Timer presets
  timerPresets: number[]

  // Time loss tracking
  timeLossData: TimeLossData
  currentTimeLossSession: number

  // Noise monitor settings
  noiseThreshold: number

  // UI preferences
  darkMode: boolean

  // Loading state
  loading: boolean
  initialized: boolean

  // Actions
  fetchSettings: (userId: string) => Promise<void>
  toggleSound: () => void
  setVolume: (vol: number) => void
  addTimerPreset: (seconds: number) => void
  removeTimerPreset: (seconds: number) => void
  addTimeLoss: (seconds: number) => void
  resetDailyTimeLoss: () => void
  setCurrentTimeLossSession: (seconds: number) => void
  getTodayTimeLoss: () => number
  setNoiseThreshold: (threshold: number) => void
  toggleDarkMode: () => void
  saveSettings: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  soundEnabled: true,
  volume: 0.5,
  timerPresets: [60, 120, 180, 300, 600, 900],
  timeLossData: {},
  currentTimeLossSession: 0,
  noiseThreshold: 70,
  darkMode: false,
  loading: false,
  initialized: false,

  fetchSettings: async (userId: string) => {
    set({ loading: true })
    const supabase = createClient()

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!error && data) {
      set({
        soundEnabled: data.sound_enabled,
        volume: data.volume,
        timerPresets: data.timer_presets as number[],
        noiseThreshold: data.noise_threshold,
        darkMode: data.dark_mode,
        timeLossData: (data.time_loss_data as TimeLossData) || {},
        loading: false,
        initialized: true,
      })
    } else {
      // Use defaults if no settings found
      set({ loading: false, initialized: true })
    }
  },

  saveSettings: async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('saveSettings: No user logged in')
      return
    }

    const state = get()
    console.log('saveSettings: Saving time_loss_data:', state.timeLossData)

    const { error } = await supabase
      .from('user_settings')
      .upsert(
        {
          user_id: user.id,
          sound_enabled: state.soundEnabled,
          volume: state.volume,
          timer_presets: state.timerPresets,
          noise_threshold: state.noiseThreshold,
          dark_mode: state.darkMode,
          time_loss_data: state.timeLossData,
        },
        { onConflict: 'user_id' }
      )

    if (error) {
      console.error('saveSettings: Error saving to DB:', error)
    } else {
      console.log('saveSettings: Saved successfully')
    }
  },

  toggleSound: () => {
    set((state) => ({ soundEnabled: !state.soundEnabled }))
    get().saveSettings()
  },

  setVolume: (vol) => {
    set({ volume: Math.max(0, Math.min(1, vol)) })
    get().saveSettings()
  },

  addTimerPreset: (seconds) => {
    set((state) => ({
      timerPresets: Array.from(new Set([...state.timerPresets, seconds])).sort(
        (a, b) => a - b
      ),
    }))
    get().saveSettings()
  },

  removeTimerPreset: (seconds) => {
    set((state) => ({
      timerPresets: state.timerPresets.filter((p) => p !== seconds),
    }))
    get().saveSettings()
  },

  addTimeLoss: (seconds) => {
    set((state) => {
      const today = getCurrentDateKey()
      const currentTotal = state.timeLossData[today] || 0
      return {
        timeLossData: {
          ...state.timeLossData,
          [today]: currentTotal + seconds,
        },
        currentTimeLossSession: 0,
      }
    })
    get().saveSettings()
  },

  resetDailyTimeLoss: () => {
    set((state) => {
      const today = getCurrentDateKey()
      const { [today]: _, ...rest } = state.timeLossData
      return { timeLossData: rest, currentTimeLossSession: 0 }
    })
    get().saveSettings()
  },

  setCurrentTimeLossSession: (seconds) =>
    set({ currentTimeLossSession: seconds }),

  getTodayTimeLoss: () => {
    const state = get()
    const today = getCurrentDateKey()
    return state.timeLossData[today] || 0
  },

  setNoiseThreshold: (threshold) => {
    set({ noiseThreshold: Math.max(0, Math.min(100, threshold)) })
    get().saveSettings()
  },

  toggleDarkMode: () => {
    set((state) => ({ darkMode: !state.darkMode }))
    get().saveSettings()
  },
}))
