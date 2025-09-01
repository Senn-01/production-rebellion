import { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  user_id: string
  display_name: string | null
  timezone: string
  current_streak: number
  onboarded_at: string | null
  is_beta_user: boolean
  preferences: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export interface AuthError {
  message: string
  status?: number
}

export interface SignUpData {
  email: string
  password: string
  displayName: string
}