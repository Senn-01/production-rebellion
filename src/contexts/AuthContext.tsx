'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { AuthContextType, UserProfile } from '@/types/auth.types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('[AuthContext] Fetching profile for user:', userId)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        // PGRST116 = no rows found - this is OK, profile might not exist yet
        if (error.code === 'PGRST116') {
          console.log('[AuthContext] No profile found for user (might be new user)')
          setProfile(null)
        } else {
          console.error('[AuthContext] Error fetching profile:', error)
        }
        return
      }

      console.log('[AuthContext] Profile fetched successfully:', data)
      setProfile(data)
    } catch (error) {
      console.error('[AuthContext] Unexpected error fetching profile:', error)
      // Don't let profile fetch failure block the entire app
      setProfile(null)
    }
  }, [supabase])

  useEffect(() => {
    // Get initial session with timeout fallback
    const getInitialSession = async () => {
      try {
        console.log('[AuthContext] Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('[AuthContext] Error getting session:', error)
          setLoading(false)
          return
        }

        setUser(session?.user ?? null)
        console.log('[AuthContext] Session user:', session?.user?.email || 'none')
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        }
      } catch (error) {
        console.error('[AuthContext] Unexpected error in getInitialSession:', error)
      } finally {
        // ALWAYS resolve loading state
        console.log('[AuthContext] Initial session check complete')
        setLoading(false)
      }
    }

    // Add timeout fallback (3 seconds max)
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('[AuthContext] Loading timeout - forcing resolution')
        setLoading(false)
      }
    }, 3000)

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] Auth state changed:', event)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [supabase.auth, fetchUserProfile, loading])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return { error: error || null }
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Authentication failed') }
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { error: error || null }
      }

      // Create user profile after successful signup
      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              user_id: data.user.id,
              display_name: displayName,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
              current_streak: 0,
              is_beta_user: true,
              preferences: {},
            }
          ])

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }
      }

      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Signup failed') }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id)
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}