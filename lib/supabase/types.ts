export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      behavior_events: {
        Row: {
          id: string
          student_id: string
          delta: number
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          delta: number
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          delta?: number
          reason?: string | null
          created_at?: string
        }
        Relationships: []
      }
      seating_layouts: {
        Row: {
          id: string
          class_id: string
          name: string
          positions: Json
          created_at: string
        }
        Insert: {
          id?: string
          class_id: string
          name: string
          positions?: Json
          created_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          name?: string
          positions?: Json
          created_at?: string
        }
        Relationships: []
      }
      hall_passes: {
        Row: {
          id: string
          student_id: string
          left_at: string
          returned_at: string | null
          reason: string | null
        }
        Insert: {
          id?: string
          student_id: string
          left_at?: string
          returned_at?: string | null
          reason?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          left_at?: string
          returned_at?: string | null
          reason?: string | null
        }
        Relationships: []
      }
      student_badges: {
        Row: {
          id: string
          student_id: string
          badge_slug: string
          awarded_at: string
        }
        Insert: {
          id?: string
          student_id: string
          badge_slug: string
          awarded_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          badge_slug?: string
          awarded_at?: string
        }
        Relationships: []
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
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
