export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          created_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          created_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          created_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
      }
      students: {
        Row: {
          id: string
          class_id: string
          name: string
          excluded: boolean
          created_at: string
        }
        Insert: {
          id?: string
          class_id: string
          name: string
          excluded?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          name?: string
          excluded?: boolean
          created_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          class_id: string
          text: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          class_id: string
          text: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          text?: string
          date?: string
          created_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          student_id: string
          date: string
          status: 'present' | 'absent' | 'late'
        }
        Insert: {
          id?: string
          student_id: string
          date: string
          status: 'present' | 'absent' | 'late'
        }
        Update: {
          id?: string
          student_id?: string
          date?: string
          status?: 'present' | 'absent' | 'late'
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          sound_enabled: boolean
          volume: number
          timer_presets: number[]
          noise_threshold: number
          dark_mode: boolean
          time_loss_data: Record<string, number>
        }
        Insert: {
          id?: string
          user_id: string
          sound_enabled?: boolean
          volume?: number
          timer_presets?: number[]
          noise_threshold?: number
          dark_mode?: boolean
          time_loss_data?: Record<string, number>
        }
        Update: {
          id?: string
          user_id?: string
          sound_enabled?: boolean
          volume?: number
          timer_presets?: number[]
          noise_threshold?: number
          dark_mode?: boolean
          time_loss_data?: Record<string, number>
        }
      }
    }
  }
}
