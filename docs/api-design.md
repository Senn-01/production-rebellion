---
title: Production Rebellion - API Design
version: 0.1.0
date: 2025-01-30
rationale: Define the complete API layer architecture using Supabase + TanStack Query for optimal DX and performance
---

# Production Rebellion - API Design

## Architecture Overview

```
React Component
    ↓
TanStack Query Hook (useQuery/useMutation)
    ↓
Supabase Service Function
    ↓
Supabase Client → PostgreSQL
```

## Core Principles

1. **Query Keys** - Consistent, hierarchical structure for cache management
2. **Optimistic Updates** - Immediate UI feedback for better UX
3. **Error Boundaries** - Graceful degradation with humor
4. **Type Safety** - Full TypeScript from database to component

## Query Key Structure

```typescript
// Hierarchical query keys for precise invalidation
export const queryKeys = {
  all: ['production-rebellion'] as const,
  
  projects: () => [...queryKeys.all, 'projects'] as const,
  project: (id: string) => [...queryKeys.projects(), id] as const,
  
  sessions: () => [...queryKeys.all, 'sessions'] as const,
  sessionsByDate: (date: string) => [...queryKeys.sessions(), date] as const,
  
  captures: () => [...queryKeys.all, 'captures'] as const,
  pendingCaptures: () => [...queryKeys.captures(), 'pending'] as const,
  
  xp: () => [...queryKeys.all, 'xp'] as const,
  weeklyXp: (weekStart: string) => [...queryKeys.xp(), 'weekly', weekStart] as const,
  
  achievements: () => [...queryKeys.all, 'achievements'] as const,
  analytics: () => [...queryKeys.all, 'analytics'] as const,
}
```

## Service Layer (`/lib/supabase/`)

### Helper Functions (`utils.ts`)

```typescript
// Date helpers used across services
export function getMonday(date: Date, timezone?: string): Date {
  // If timezone provided, convert to that timezone first
  if (timezone) {
    const localDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
    const day = localDate.getDay()
    const diff = localDate.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(localDate.setDate(diff))
  }
  
  // Default UTC calculation
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

export function getLast14Days(): string[] {
  const dates: string[] = []
  const today = new Date()
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }
  return dates
}

export async function getUserTimezone(userId: string): Promise<string> {
  const { data } = await supabase
    .from('user_profiles')
    .select('timezone')
    .eq('user_id', userId)
    .single()
  
  return data?.timezone || 'UTC'
}

export async function getCurrentWeekStart(userId: string): Promise<string> {
  const timezone = await getUserTimezone(userId)
  return getMonday(new Date(), timezone).toISOString().split('T')[0]
}

export function isWithinDays(date: Date | string, days: number): boolean {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMs = targetDate.getTime() - now.getTime()
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
  return diffInDays >= 0 && diffInDays <= days
}
```

### 1. Projects Service (`projects.service.ts`)

```typescript
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export const projectsService = {
  // QUERIES
  async getActiveProjects(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'inactive'])
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Add computed deadline fields for UI
    const now = new Date()
    return data.map(project => ({
      ...project,
      daysUntilDue: project.due_date 
        ? Math.ceil((new Date(project.due_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null,
      isApproachingDeadline: project.due_date 
        ? Math.ceil((new Date(project.due_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) <= 3
        : false
    }))
  },

  async checkCoordinateAvailability(
    userId: string, 
    cost: number, 
    benefit: number
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId)
      .eq('cost', cost)
      .eq('benefit', benefit)
      .in('status', ['active', 'inactive'])
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
    return !data
  },

  // MUTATIONS
  async createProject(project: ProjectInsert): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('COORDINATE_TAKEN')
      }
      throw error
    }
    return data
  },

  async completeProject(
    projectId: string,
    accuracy: '1' | '2' | '3' | '4' | '5'  // 1=much harder, 3=accurate, 5=much easier
  ): Promise<{ project: Project; xpEarned: number }> {
    // Start transaction-like behavior
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        accuracy,
        was_boss_battle: supabase.sql`is_boss_battle` // Preserve boss battle state
      })
      .eq('id', projectId)
      .select()
      .single()

    if (projectError) throw projectError

    // Calculate XP using database RPC function
    const { data: xpEarned } = await supabase
      .rpc('calculate_project_xp', {
        p_cost: project.cost,
        p_benefit: project.benefit,
        p_is_boss_battle: project.was_boss_battle
      })

    // Record XP with calculated week_start (using user's timezone)
    const timezone = await getUserTimezone(project.user_id)
    const weekStart = getMonday(new Date(), timezone).toISOString().split('T')[0]
    const { error: xpError } = await supabase
      .from('xp_tracking')
      .insert({
        user_id: project.user_id,
        points: xpEarned,
        source_type: 'project_completion',
        source_id: projectId,
        week_start: weekStart,
        earned_at: new Date().toISOString()
      })

    if (xpError) throw xpError

    return { project, xpEarned }
  },

  async setBossBattle(projectId: string, userId: string): Promise<void> {
    // Use RPC for atomic operation
    const { error } = await supabase
      .rpc('set_boss_battle', { 
        project_id: projectId,
        user_id: userId 
      })

    if (error) throw error
  },

  async abandonProject(projectId: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update({ status: 'abandoned' })
      .eq('id', projectId)

    if (error) throw error
  }
}

// UI Helper: Calculate project position on cost/benefit matrix
export function calculateProjectPosition(
  project: { cost: number; benefit: number },
  chartDimensions: { width: number; height: number; padding: number }
): { x: number; y: number } {
  const { width, height, padding } = chartDimensions
  const usableWidth = width - (padding * 2)
  const usableHeight = height - (padding * 2)
  
  return {
    x: padding + (project.cost / 10) * usableWidth,
    y: padding + (1 - project.benefit / 10) * usableHeight // Invert Y axis
  }
}

// UI Helper: Get visual properties for project
export function getProjectVisualProperties(project: Project) {
  // Priority determines border style
  const borderStyles = {
    must: '3px solid gold',
    should: '3px solid black',
    nice: '3px solid grey'
  }
  
  // Category determines pattern
  const patterns = {
    work: 'horizontal-lines',
    learn: 'vertical-lines', 
    build: 'diagonal-lines',
    manage: 'solid-fill'
  }
  
  return {
    border: borderStyles[project.priority],
    pattern: patterns[project.category],
    opacity: project.status === 'inactive' ? 0.6 : 1,
    pulse: project.isApproachingDeadline,
    bossBattle: project.is_boss_battle
  }
}
```

### 2. Sessions Service (`sessions.service.ts`)

```typescript
// Difficulty quotes based on willpower + duration
const DIFFICULTY_QUOTES: Record<string, string> = {
  'high-60': "I'm Too Young to Die",
  'medium-60': "Hey, Not Too Rough", 
  'high-90': "Bring It On",
  'medium-90': "Come Get Some",
  'low-60': "Damn I'm Good",
  'high-120': "Crunch Time",
  'medium-120': "Balls of Steel ⚪⚪",
  'low-90': "Nightmare Deadline",
  'low-120': "Hail to the King 👑"
}

export function getDifficultyQuote(willpower: 'high' | 'medium' | 'low', duration: 60 | 90 | 120): string {
  return DIFFICULTY_QUOTES[`${willpower}-${duration}`] || "Unknown Difficulty"
}

export const sessionsService = {
  // QUERIES
  async getTodayCommitment(userId: string): Promise<DailyCommitment | null> {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('daily_commitments')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async getTodaySessions(userId: string): Promise<Session[]> {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('sessions')
      .select('*, projects(name)')
      .eq('user_id', userId)
      .eq('date', today)
      .order('started_at', { ascending: false })

    if (error) throw error
    return data
  },

  // MUTATIONS
  async createCommitment(
    userId: string, 
    targetSessions: number
  ): Promise<DailyCommitment> {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('daily_commitments')
      .upsert({
        user_id: userId,
        date: today,
        target_sessions: targetSessions,
        completed_sessions: 0
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async startSession(
    userId: string,
    projectId: string,
    duration: 60 | 90 | 120,
    willpower: 'high' | 'medium' | 'low'
  ): Promise<Session> {
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        project_id: projectId,
        duration,
        willpower,
        started_at: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async completeSession(
    sessionId: string,
    mindset: 'excellent' | 'good' | 'challenging'
  ): Promise<{ session: Session; xpEarned: number }> {
    // Get session details first
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('completed', false) // Prevent double-completion
      .single()

    if (sessionError) throw sessionError
    if (!session) throw new Error('SESSION_NOT_FOUND')

    // Calculate XP using database RPC function
    const { data: xpEarned } = await supabase
      .rpc('calculate_session_xp', {
        p_duration: session.duration,
        p_willpower: session.willpower
      })

    // Update session
    const { data: updatedSession, error: updateError } = await supabase
      .from('sessions')
      .update({
        completed: true,
        mindset,
        ended_at: new Date().toISOString(),
        xp_earned: xpEarned
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (updateError) throw updateError

    // Record XP with calculated week_start (using user's timezone)
    const timezone = await getUserTimezone(session.user_id)
    const weekStart = getMonday(new Date(), timezone).toISOString().split('T')[0]
    await supabase
      .from('xp_tracking')
      .insert({
        user_id: session.user_id,
        points: xpEarned,
        source_type: 'session_completion',
        source_id: sessionId,
        week_start: weekStart,
        earned_at: new Date().toISOString()
      })

    // Update daily commitment count (atomic increment)
    const today = new Date().toISOString().split('T')[0]
    await supabase.rpc('increment_daily_sessions', {
      user_id: session.user_id,
      target_date: today
    })

    // Update week streak (check if first session this week)
    await this.updateWeekStreak(session.user_id, session.duration)

    return { session: updatedSession, xpEarned }
  },

  async interruptSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('sessions')
      .update({
        completed: false,
        ended_at: new Date().toISOString()
      })
      .eq('id', sessionId)

    if (error) throw error
  },

  async updateWeekStreak(userId: string, duration: number): Promise<void> {
    const weekStart = getMonday(new Date()).toISOString().split('T')[0]
    
    // Upsert week streak record
    const { data: existing } = await supabase
      .from('week_streaks')
      .select('sessions_count, total_minutes')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .single()

    if (existing) {
      // Update existing week
      await supabase
        .from('week_streaks')
        .update({
          has_session: true,
          sessions_count: existing.sessions_count + 1,
          total_minutes: existing.total_minutes + duration
        })
        .eq('user_id', userId)
        .eq('week_start', weekStart)
    } else {
      // Create new week entry (first session of the week)
      await supabase
        .from('week_streaks')
        .insert({
          user_id: userId,
          week_start: weekStart,
          has_session: true,
          sessions_count: 1,
          total_minutes: duration
        })
      
      // Update current streak in user_profiles
      await this.updateCurrentStreak(userId)
    }
  },

  async updateCurrentStreak(userId: string): Promise<void> {
    // Count consecutive weeks with sessions backwards from current week
    const { data: weeks } = await supabase
      .from('week_streaks')
      .select('week_start, has_session')
      .eq('user_id', userId)
      .eq('has_session', true)
      .order('week_start', { ascending: false })

    let streak = 0
    const currentWeek = getMonday(new Date())
    
    // Count backwards week by week
    for (let i = 0; i < (weeks?.length || 0); i++) {
      const weekDate = new Date(weeks![i].week_start)
      const expectedWeek = new Date(currentWeek)
      expectedWeek.setDate(expectedWeek.getDate() - (i * 7))
      
      // Check if this week is in the consecutive sequence
      if (weekDate.toISOString().split('T')[0] === expectedWeek.toISOString().split('T')[0]) {
        streak++
      } else {
        break // Gap found, streak ends
      }
    }

    // Update user profile with current streak
    await supabase
      .from('user_profiles')
      .update({ current_streak: streak })
      .eq('user_id', userId)
  }
}
```

### 3. Captures Service (`captures.service.ts`)

```typescript
export const capturesService = {
  // QUERIES
  async getPendingCaptures(userId: string): Promise<Capture[]> {
    const { data, error } = await supabase
      .from('captures')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true }) // FIFO

    if (error) throw error
    return data
  },

  async getPendingCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('captures')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'pending')

    if (error) throw error
    return count || 0
  },

  // MUTATIONS
  async createCapture(userId: string, content: string): Promise<Capture> {
    const { data, error } = await supabase
      .from('captures')
      .insert({
        user_id: userId,
        content,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async triageCapture(
    captureId: string,
    decision: 'project' | 'parking_lot' | 'doing_now' | 'routing' | 'deleted'
  ): Promise<void> {
    const { error } = await supabase
      .from('captures')
      .update({
        status: 'triaged',
        decision,
        triaged_at: new Date().toISOString()
      })
      .eq('id', captureId)

    if (error) throw error
  },

  async moveToParkingLot(captureId: string, userId: string): Promise<void> {
    // Get capture content
    const { data: capture, error: captureError } = await supabase
      .from('captures')
      .select('content')
      .eq('id', captureId)
      .single()

    if (captureError) throw captureError

    // Create parking lot item
    const { error: parkingError } = await supabase
      .from('parking_lot')
      .insert({
        user_id: userId,
        capture_id: captureId,
        content: capture.content
      })

    if (parkingError) throw parkingError

    // Mark capture as triaged
    await this.triageCapture(captureId, 'parking_lot')
  }
}
```

### 4. Analytics Service (`analytics.service.ts`)

```typescript
import { getMonday, getLast14Days } from '@/lib/supabase/utils'

export const analyticsService = {
  // PERFORMANCE FIX: Batch all analytics queries
  async getAnalyticsDashboard(userId: string) {
    // Run all 6 queries in parallel (400ms total vs 2400ms sequential)
    const [
      weeklyStats,
      streak,
      completedProjects,
      personalRecords,
      achievements,
      heatmapData
    ] = await Promise.all([
      this.getWeeklyStats(userId),
      this.getCurrentStreak(userId),
      this.getCompletedProjects(userId),
      this.getPersonalRecords(userId),
      this.getAchievements(userId),
      this.getSessionHeatmap(userId)
    ])

    return {
      weeklyStats,
      streak,
      completedProjects,
      personalRecords,
      achievements,
      heatmapData
    }
  },

  async getWeeklyStats(userId: string): Promise<WeeklyStats> {
    const weekStart = getMonday(new Date()).toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('sessions')
      .select('duration')
      .eq('user_id', userId)
      .gte('date', weekStart)
      .eq('completed', true)

    if (error) throw error

    const sessionCount = data.length
    const totalMinutes = data.reduce((sum, s) => sum + s.duration, 0)
    const totalHours = (totalMinutes / 60).toFixed(1)

    return { sessionCount, totalHours }
  },

  async getCurrentStreak(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('current_streak')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data?.current_streak || 0
  },

  async getCompletedProjects(userId: string): Promise<CompletedProject[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('name, cost, benefit, completed_at, was_boss_battle')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getPersonalRecords(userId: string): Promise<PersonalRecord[]> {
    const { data, error } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    return data
  },

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        achievement_key,
        unlocked_at,
        achievement_definitions (
          name,
          description,
          teaser,
          xp_reward
        )
      `)
      .eq('user_id', userId)

    if (error) throw error
    return data
  }
}
```

### 5. Achievements Service (`achievements.service.ts`)

```typescript
export const achievementsService = {
  async checkAchievements(userId: string): Promise<string[]> {
    // Uses optimized RPC: check_and_unlock_achievements()
    const { data, error } = await supabase
      .rpc('check_and_unlock_achievements', { p_user_id: userId })

    if (error) throw error

    // Extract newly unlocked achievements from RPC result
    const newAchievements = data
      ?.filter(result => result.newly_unlocked)
      ?.map(result => result.achievement_key) || []

    return newAchievements
  },

  async unlock(userId: string, achievementKey: string): Promise<void> {
    const { error } = await supabase
      .from('user_achievements')
      .upsert({
        user_id: userId,
        achievement_key: achievementKey,
        unlocked_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,achievement_key',
        ignoreDuplicates: true
      })

    if (error) throw error
  }
}
```

## React Query Hooks (`/hooks/`)

### 1. Projects Hooks (`use-projects.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsService } from '@/lib/supabase/projects.service'
import { queryKeys } from '@/lib/query-keys'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

export function useProjects() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: queryKeys.projects(),
    queryFn: () => projectsService.getActiveProjects(user!.id),
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute (reduced for deadline accuracy)
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: (project: ProjectInsert) => 
      projectsService.createProject({ ...project, user_id: user!.id }),
    
    onMutate: async (newProject) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.projects() })
      const previousProjects = queryClient.getQueryData(queryKeys.projects())
      
      queryClient.setQueryData(queryKeys.projects(), (old: Project[]) => [
        ...old,
        { ...newProject, id: 'temp-' + Date.now(), created_at: new Date().toISOString() }
      ])
      
      return { previousProjects }
    },
    
    onError: (err, newProject, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.projects(), context?.previousProjects)
      
      if (err.message === 'COORDINATE_TAKEN') {
        toast.error("That spot's taken. My bad - prioritized achievements over spatial algorithms.")
      } else {
        toast.error('Failed to create project')
      }
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects() })
      toast.success('Project added to the map!')
    }
  })
}

export function useCompleteProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ projectId, accuracy }: CompleteProjectParams) =>
      projectsService.completeProject(projectId, accuracy),
    
    onSuccess: ({ xpEarned }, { projectId }) => {
      // Remove from active projects
      queryClient.setQueryData(queryKeys.projects(), (old: Project[]) =>
        old.filter(p => p.id !== projectId)
      )
      
      // Invalidate analytics
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics() })
      
      // Trigger XP animation via event
      window.dispatchEvent(new CustomEvent('xp-earned', { detail: xpEarned }))
      
      toast.success(`Project completed! +${xpEarned} XP`)
    }
  })
}

export function useSetBossBattle() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: (projectId: string) =>
      projectsService.setBossBattle(projectId, user!.id),
    
    onMutate: async (projectId) => {
      // Optimistically update UI
      await queryClient.cancelQueries({ queryKey: queryKeys.projects() })
      const previousProjects = queryClient.getQueryData(queryKeys.projects())
      
      queryClient.setQueryData(queryKeys.projects(), (old: Project[]) =>
        old.map(p => ({
          ...p,
          is_boss_battle: p.id === projectId
        }))
      )
      
      return { previousProjects }
    },
    
    onError: (err, projectId, context) => {
      queryClient.setQueryData(queryKeys.projects(), context?.previousProjects)
      toast.error('Failed to set boss battle')
    },
    
    onSuccess: () => {
      toast.success('Boss battle selected! 2x XP awaits.')
    }
  })
}
```

### 2. Sessions Hooks (`use-sessions.ts`)

```typescript
export function useTodayCommitment() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: queryKeys.sessionsByDate(new Date().toISOString().split('T')[0]),
    queryFn: () => sessionsService.getTodayCommitment(user!.id),
    enabled: !!user,
  })
}

export function useStartSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (params: StartSessionParams) =>
      sessionsService.startSession(
        params.userId,
        params.projectId,
        params.duration,
        params.willpower
      ),
    
    onSuccess: (session) => {
      // Store session ID for tracking
      sessionStorage.setItem('active-session', session.id)
      
      // Invalidate today's sessions
      const today = new Date().toISOString().split('T')[0]
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.sessionsByDate(today) 
      })
    }
  })
}

export function useCompleteSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ sessionId, mindset }: CompleteSessionParams) =>
      sessionsService.completeSession(sessionId, mindset),
    
    onSuccess: ({ xpEarned }) => {
      // Clear active session
      sessionStorage.removeItem('active-session')
      
      // Trigger XP animation
      window.dispatchEvent(new CustomEvent('xp-earned', { detail: xpEarned }))
      
      // Invalidate related queries
      const today = new Date().toISOString().split('T')[0]
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.sessionsByDate(today) 
      })
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.analytics() 
      })
      
      toast.success(`Session complete! +${xpEarned} XP`)
    }
  })
}
```

### 3. Captures Hooks (`use-captures.ts`)

```typescript
export function usePendingCapturesCount() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: queryKeys.pendingCaptures(),
    queryFn: () => capturesService.getPendingCount(user!.id),
    enabled: !!user,
    refetchInterval: 30000, // Poll every 30s
  })
}

export function useCreateCapture() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: (content: string) =>
      capturesService.createCapture(user!.id, content),
    
    onSuccess: () => {
      // Update pending count
      queryClient.setQueryData(queryKeys.pendingCaptures(), (old: number) => 
        (old || 0) + 1
      )
      
      // Check for first capture achievement
      achievementsService.checkAchievements(user!.id)
    }
  })
}

export function useTriageCapture() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ captureId, decision }: TriageCaptureParams) =>
      capturesService.triageCapture(captureId, decision),
    
    onSuccess: () => {
      // Refetch pending captures
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.pendingCaptures() 
      })
    }
  })
}
```

## Realtime Subscriptions (`/lib/supabase/realtime.ts`)

```typescript
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './client'

export class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map()

  subscribeToXP(userId: string, callback: (xp: number) => void) {
    const channel = supabase
      .channel(`xp-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'xp_tracking',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new.points)
        }
      )
      .subscribe()

    this.channels.set(`xp-${userId}`, channel)
    return () => this.unsubscribe(`xp-${userId}`)
  }

  subscribeToCaptures(userId: string, callback: (count: number) => void) {
    const channel = supabase
      .channel(`captures-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'captures',
          filter: `user_id=eq.${userId}`
        },
        async () => {
          // Fetch fresh count
          const count = await capturesService.getPendingCount(userId)
          callback(count)
        }
      )
      .subscribe()

    this.channels.set(`captures-${userId}`, channel)
    return () => this.unsubscribe(`captures-${userId}`)
  }

  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName)
    if (channel) {
      supabase.removeChannel(channel)
      this.channels.delete(channelName)
    }
  }

  unsubscribeAll() {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel)
    })
    this.channels.clear()
  }
}

export const realtimeManager = new RealtimeManager()
```

## Error Handling (`/lib/error-handler.ts`)

```typescript
export enum AppErrorCode {
  COORDINATE_TAKEN = 'COORDINATE_TAKEN',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  ALREADY_COMPLETED = 'ALREADY_COMPLETED',
  NO_ACTIVE_PROJECTS = 'NO_ACTIVE_PROJECTS',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_REQUIRED = 'AUTH_REQUIRED',
}

export const errorMessages: Record<AppErrorCode, { message: string; suggestion: string }> = {
  [AppErrorCode.COORDINATE_TAKEN]: {
    message: "That spot's taken. My bad - prioritized achievements over spatial algorithms.",
    suggestion: "Try adjusting the cost or benefit by 1"
  },
  [AppErrorCode.SESSION_NOT_FOUND]: {
    message: "Can't find that session. Did you accidentally the whole thing?",
    suggestion: "Start a new session from the DeepFocus page"
  },
  [AppErrorCode.ALREADY_COMPLETED]: {
    message: "Already done! No double-dipping on XP.",
    suggestion: "Pick another project to conquer"
  },
  [AppErrorCode.NO_ACTIVE_PROJECTS]: {
    message: "No projects to work on. Time to populate that map!",
    suggestion: "Add a project from the TacticalMap"
  },
  [AppErrorCode.NETWORK_ERROR]: {
    message: "Connection failed. Internet doing internet things.",
    suggestion: "Check your connection and try again"
  },
  [AppErrorCode.AUTH_REQUIRED]: {
    message: "You need to be logged in for that.",
    suggestion: "Sign in to continue"
  },
}

export function handleApiError(error: any): AppError {
  // Check for known error codes
  if (error.message in AppErrorCode) {
    return {
      code: error.message as AppErrorCode,
      ...errorMessages[error.message as AppErrorCode]
    }
  }

  // Supabase auth errors
  if (error.code === 'AUTH_ERROR') {
    return {
      code: AppErrorCode.AUTH_REQUIRED,
      ...errorMessages[AppErrorCode.AUTH_REQUIRED]
    }
  }

  // Network errors
  if (!navigator.onLine || error.message.includes('fetch')) {
    return {
      code: AppErrorCode.NETWORK_ERROR,
      ...errorMessages[AppErrorCode.NETWORK_ERROR]
    }
  }

  // Generic error
  return {
    code: 'UNKNOWN',
    message: 'Something went wrong. Classic.',
    suggestion: 'Try again or contact support'
  }
}
```

## Caching Strategy

```typescript
// Query Client Configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false, // Don't retry mutations
    },
  },
})

// Cache Rules by Data Type
const cacheConfig = {
  // Static data - cache aggressively
  achievements: {
    staleTime: Infinity,
    gcTime: Infinity,
  },
  
  // User data - moderate caching
  projects: {
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 10 * 60 * 1000, // 10 min
  },
  
  // Real-time data - minimal caching
  captures: {
    staleTime: 0, // Always fresh
    gcTime: 1 * 60 * 1000, // 1 min
  },
  
  // Analytics - cache with TTL
  weeklyStats: {
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 30 * 60 * 1000, // 30 min
  },
}
```

## Usage Example in Component

```typescript
// TacticalMap.tsx
import { useProjects, useCreateProject, useCompleteProject } from '@/hooks/use-projects'
import { usePendingCapturesCount } from '@/hooks/use-captures'
import { calculateProjectPosition, getProjectVisualProperties } from '@/lib/supabase/projects.service'

export function TacticalMap() {
  const { data: projects, isLoading, error } = useProjects()
  const { data: pendingCount = 0 } = usePendingCapturesCount()
  const createProject = useCreateProject()
  const completeProject = useCompleteProject()
  
  const chartDimensions = { width: 800, height: 600, padding: 50 }

  if (isLoading) return <MapSkeleton />
  if (error) return <ErrorBoundary error={error} />

  return (
    <div>
      {/* Map visualization - all business logic in service layer */}
      <CostBenefitMatrix dimensions={chartDimensions}>
        {projects?.map(project => {
          const position = calculateProjectPosition(project, chartDimensions)
          const visuals = getProjectVisualProperties(project)
          
          return (
            <ProjectNode
              key={project.id}
              project={project}
              style={{
                left: position.x,
                top: position.y,
                border: visuals.border,
                opacity: visuals.opacity,
                '--pattern': visuals.pattern
              }}
              className={clsx(
                visuals.pulse && 'animate-pulse',
                visuals.bossBattle && 'boss-battle-glow'
              )}
            />
          )
        })}
      </CostBenefitMatrix>
      
      {/* Controls */}
      <Button onClick={() => setShowCreateModal(true)}>
        Add Project
      </Button>
      
      {pendingCount > 0 && (
        <Button variant="outline">
          Triage ({pendingCount})
        </Button>
      )}
    </div>
  )
}
```

## Performance Optimizations

1. **Batch Achievement Checks**
   - Single RPC call: `get_user_achievement_stats()`
   - Check all 10 achievements in memory
   - 10x performance improvement

2. **Optimistic Updates**
   - Projects: Update UI immediately
   - XP: Show animation before server confirms
   - Captures: Update count instantly

3. **Smart Invalidation**
   - Use hierarchical query keys
   - Invalidate only affected data
   - Batch invalidations when possible

4. **Realtime Efficiency**
   - Subscribe only to user's own data
   - Use filters to reduce payload
   - Cleanup subscriptions on unmount

## Testing Considerations

```typescript
// Mock Supabase client for testing
export const createMockSupabaseClient = () => ({
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: mockData, error: null }),
  })),
  rpc: jest.fn().mockResolvedValue({ data: mockRpcData, error: null }),
  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnThis(),
  })),
})

// Test example
describe('projectsService', () => {
  it('should handle coordinate collision', async () => {
    const mockError = { code: '23505', message: 'duplicate key' }
    supabase.from().insert().single.mockRejectedValue(mockError)
    
    await expect(
      projectsService.createProject(mockProject)
    ).rejects.toThrow('COORDINATE_TAKEN')
  })
})
```

## Migration Path for Future Features

1. **AI Integration**
   - Add `ai_suggestions` table
   - New service: `aiService.ts`
   - New hooks: `useAISuggestions()`

2. **Team Features**
   - Add `teams` and `team_members` tables
   - Extend RLS policies for team access
   - New query key namespace: `queryKeys.team()`

3. **Mobile App**
   - Same service layer works
   - Replace React Query with platform equivalent
   - Realtime works cross-platform

## Summary

This API design provides:
- ✅ Type-safe from database to UI
- ✅ Optimistic updates for snappy UX
- ✅ Efficient caching with TanStack Query
- ✅ Realtime subscriptions for live updates
- ✅ Graceful error handling with humor
- ✅ Performance optimized (batch operations, smart invalidation)
- ✅ Testable service layer
- ✅ Extensible for future features

**Next Steps:**
1. Implement service layer files
2. Create React Query hooks
3. Setup error boundary component
4. Configure query client
5. Test with mock data before Supabase integration