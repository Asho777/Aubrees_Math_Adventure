import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string
  username: string
  current_level: number
  current_operation: string
  total_score: number
  created_at: string
  updated_at: string
}

export interface GameProgress {
  id: string
  user_id: string
  operation_type: string
  level: number
  completed: boolean
  best_score: number
  completed_at?: string
  created_at: string
}
