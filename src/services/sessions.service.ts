/**
 * Sessions Service - DeepFocus Session Management
 * 
 * Handles all session operations including:
 * - Session lifecycle (start, complete, interrupt)
 * - Timer state management with cross-tab synchronization
 * - Daily commitment tracking with atomic operations
 * - Willpower and mindset assessment
 * - XP calculation with difficulty multipliers
 */

import { supabase } from '@/lib/supabase/client';
import { 
  handleApiError, 
  AppErrorCode,
  createAppError 
} from '@/lib/error-handler';
import { 
  getUserTimezone,
  getMonday,
  logDatabaseQuery,
  handleSupabaseResponse
} from '@/lib/supabase/utils';
import type { Database } from '@/types/database';

// Type definitions
type Session = Database['public']['Tables']['sessions']['Row'];
type SessionInsert = Database['public']['Tables']['sessions']['Insert'];
type SessionUpdate = Database['public']['Tables']['sessions']['Update'];
type DailyCommitment = Database['public']['Tables']['daily_commitments']['Row'];
type SessionWillpower = Database['public']['Enums']['session_willpower'];
type SessionMindset = Database['public']['Enums']['session_mindset'];

export interface SessionWithProject extends Session {
  project?: {
    id: string;
    name: string;
    cost: number;
    benefit: number;
  };
}

export interface SessionCreationData {
  projectId: string;
  duration: 60 | 90 | 120; // Session duration in minutes
  willpower: SessionWillpower;
  userId: string;
}

export interface SessionCompletionData {
  sessionId: string;
  userId: string;
  mindset: SessionMindset;
  actualDuration?: number; // If different from planned
}

export interface DailyCommitmentData {
  userId: string;
  date: string;
  targetSessions: number;
}

export interface SessionTimerState {
  remainingTime: number; // in seconds
  progress: number; // 0 to 1
  isRunning: boolean;
  isPaused: boolean;
  state: 'idle' | 'running' | 'paused' | 'completed' | 'interrupted';
  formattedTime: string;
  difficultyQuote: string;
}


/**
 * Core Sessions Service
 */
export const sessionsService = {
  /**
   * Get today's sessions for user
   */
  async getTodaySessions(userId: string): Promise<SessionWithProject[]> {
    logDatabaseQuery('sessions', 'getTodaySessions', { userId });
    
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        project:projects(id, name, cost, benefit)
      `)
      .eq('user_id', userId)
      .eq('date', today)
      .order('started_at', { ascending: false });

    if (error) {
      throw handleApiError(error, 'getTodaySessions');
    }

    return data.map(session => ({
      ...session,
      project: session.project ? session.project : undefined
    }));
  },

  /**
   * Get active session (if any) for user
   */
  async getActiveSession(userId: string): Promise<SessionWithProject | null> {
    logDatabaseQuery('sessions', 'getActiveSession', { userId });
    
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        project:projects(id, name, cost, benefit)
      `)
      .eq('user_id', userId)
      .eq('completed', false)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw handleApiError(error, 'getActiveSession');
    }

    if (!data) return null;

    return {
      ...data,
      project: data.project ? data.project : undefined
    };
  },

  /**
   * Start a new focus session
   */
  async startSession(sessionData: SessionCreationData): Promise<SessionWithProject> {
    logDatabaseQuery('sessions', 'startSession', { 
      projectId: sessionData.projectId,
      duration: sessionData.duration,
      willpower: sessionData.willpower
    });

    // Check for existing active session first
    const existingSession = await this.getActiveSession(sessionData.userId);
    if (existingSession) {
      throw createAppError(
        AppErrorCode.VALIDATION_ERROR,
        'Active session exists',
        'Looks like you already have a session running. Complete or abandon it first.',
        { activeSessionId: existingSession.id }
      );
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const sessionInsert: SessionInsert = {
      user_id: sessionData.userId,
      project_id: sessionData.projectId,
      duration: sessionData.duration,
      willpower: sessionData.willpower,
      started_at: now.toISOString(),
      date: today,
      completed: false
    };

    const { data: session, error } = await supabase
      .from('sessions')
      .insert(sessionInsert)
      .select(`
        *,
        project:projects(id, name, cost, benefit)
      `)
      .single();

    if (error) {
      throw handleApiError(error, 'startSession');
    }

    return {
      ...session,
      project: session.project ? session.project : undefined
    };
  },

  /**
   * Complete a session with mindset assessment
   */
  async completeSession(completionData: SessionCompletionData): Promise<{ session: Session; xpEarned: number }> {
    logDatabaseQuery('sessions', 'completeSession', { 
      sessionId: completionData.sessionId,
      mindset: completionData.mindset
    });

    const now = new Date();

    // First get the session to calculate XP
    const { data: existingSession, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', completionData.sessionId)
      .eq('user_id', completionData.userId)
      .single();

    if (fetchError || !existingSession) {
      throw handleApiError(fetchError || new Error('Session not found'), 'completeSession');
    }

    // Calculate XP using database RPC function
    const { data: xpEarned, error: xpError } = await supabase
      .rpc('calculate_session_xp', {
        p_duration: completionData.actualDuration || existingSession.duration,
        p_willpower: existingSession.willpower
      });

    if (xpError || xpEarned === null) {
      throw handleApiError(xpError || new Error('XP calculation failed'), 'calculateSessionXP');
    }

    // Update session as completed
    const { data: session, error: updateError } = await supabase
      .from('sessions')
      .update({
        completed: true,
        ended_at: now.toISOString(),
        mindset: completionData.mindset,
        xp_earned: xpEarned
      })
      .eq('id', completionData.sessionId)
      .eq('user_id', completionData.userId)
      .select()
      .single();

    if (updateError) {
      throw handleApiError(updateError, 'completeSession');
    }

    // Record XP with user's timezone-aware week calculation
    const timezone = await getUserTimezone(completionData.userId);
    const weekStart = getMonday(new Date(), timezone).toISOString().split('T')[0];
    
    const { error: xpTrackingError } = await supabase
      .from('xp_tracking')
      .insert({
        user_id: completionData.userId,
        points: xpEarned,
        source_type: 'session_completion',
        source_id: completionData.sessionId,
        week_start: weekStart,
        earned_at: now.toISOString()
      });

    if (xpTrackingError) {
      throw handleApiError(xpTrackingError, 'recordSessionXP');
    }

    // Update daily commitment progress
    await this.updateDailyProgress(completionData.userId, existingSession.date);

    return { session, xpEarned };
  },

  /**
   * Interrupt/abandon session
   */
  async interruptSession(sessionId: string, userId: string): Promise<void> {
    logDatabaseQuery('sessions', 'interruptSession', { sessionId });

    // Update session as interrupted
    const { error } = await supabase
      .from('sessions')
      .update({
        completed: false,
        ended_at: new Date().toISOString(),
        xp_earned: 10 // Fixed XP for interrupted sessions per brief
      })
      .eq('id', sessionId)
      .eq('user_id', userId);

    if (error) {
      throw handleApiError(error, 'interruptSession');
    }

    // Record XP in tracking table
    const { xpService } = await import('@/services/xp.service');
    await xpService.recordXP(userId, 10, 'session_completion', sessionId);
  },

  /**
   * Set daily commitment
   */
  async setDailyCommitment(commitmentData: DailyCommitmentData): Promise<DailyCommitment> {
    logDatabaseQuery('sessions', 'setDailyCommitment', { 
      date: commitmentData.date,
      targetSessions: commitmentData.targetSessions
    });

    const { data, error } = await supabase
      .from('daily_commitments')
      .upsert({
        user_id: commitmentData.userId,
        date: commitmentData.date,
        target_sessions: commitmentData.targetSessions,
        completed_sessions: 0
      }, { 
        onConflict: 'user_id,date' 
      })
      .select()
      .single();

    if (error) {
      throw handleApiError(error, 'setDailyCommitment');
    }

    return data;
  },

  /**
   * Get daily commitment for date
   */
  async getDailyCommitment(userId: string, date: string): Promise<DailyCommitment | null> {
    logDatabaseQuery('sessions', 'getDailyCommitment', { userId, date });

    const { data, error } = await supabase
      .from('daily_commitments')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (error) {
      throw handleApiError(error, 'getDailyCommitment');
    }

    return data;
  },

  /**
   * Get today's commitment progress
   */
  async getTodayProgress(userId: string): Promise<{
    commitment: DailyCommitment | null;
    completed: number;
    progress: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    const [commitment, sessions] = await Promise.all([
      this.getDailyCommitment(userId, today),
      this.getTodaySessions(userId)
    ]);

    const completed = sessions.filter(s => s.completed).length;
    const target = commitment?.target_sessions || 0;
    const progress = target > 0 ? Math.min(completed / target, 1) : 0;

    return { commitment, completed, progress };
  },

  /**
   * Update daily progress (internal helper)
   */
  async updateDailyProgress(userId: string, date: string): Promise<void> {
    logDatabaseQuery('sessions', 'updateDailyProgress', { userId, date });

    // Use atomic RPC function to increment session count
    const { error } = await supabase
      .rpc('increment_daily_sessions', {
        p_user_id: userId,
        p_target_date: date
      });

    if (error) {
      // Log but don't throw - this is a nice-to-have feature
      console.warn('[SessionService] Failed to update daily progress:', error);
    }
  },

  /**
   * Get session history for user (paginated)
   */
  async getSessionHistory(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ): Promise<SessionWithProject[]> {
    const { limit = 20, offset = 0, dateFrom, dateTo } = options;
    
    logDatabaseQuery('sessions', 'getSessionHistory', { 
      userId, 
      limit, 
      offset,
      dateFrom,
      dateTo 
    });

    let query = supabase
      .from('sessions')
      .select(`
        *,
        project:projects(id, name, cost, benefit)
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (dateFrom) {
      query = query.gte('date', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('date', dateTo);
    }

    const { data, error } = await query;

    if (error) {
      throw handleApiError(error, 'getSessionHistory');
    }

    return data.map(session => ({
      ...session,
      project: session.project ? session.project : undefined
    }));
  }
};

/**
 * Session Timer Utilities
 */
export const sessionTimerUtils = {
  /**
   * Calculate remaining time from session start
   */
  calculateRemainingTime(startTime: Date, durationMinutes: number): number {
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const total = durationMinutes * 60;
    return Math.max(0, total - elapsed);
  },

  /**
   * Format time for display (MM:SS)
   */
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  /**
   * Get difficulty quote based on willpower and duration
   * From brief.md difficulty matrix
   */
  getDifficultyQuote(willpower: SessionWillpower, duration: number): string {
    const matrix: Record<SessionWillpower, Record<number, string>> = {
      high: {
        60: "I'm Too Young to Die",
        90: "Bring It On", 
        120: "Crunch Time"
      },
      medium: {
        60: "Hey, Not Too Rough",
        90: "Come Get Some",
        120: "Balls of Steel ⚪⚪"
      },
      low: {
        60: "Damn I'm Good",
        90: "Nightmare Deadline", 
        120: "Hail to the King 👑"
      }
    };

    return matrix[willpower]?.[duration] || "Unknown Difficulty";
  },

  /**
   * Calculate session progress percentage
   */
  calculateProgress(startTime: Date, durationMinutes: number): number {
    const now = new Date();
    const elapsed = now.getTime() - startTime.getTime();
    const total = durationMinutes * 60 * 1000; // Convert to milliseconds
    return Math.min(elapsed / total, 1);
  },

  /**
   * Check if session should be considered abandoned (over time limit + grace period)
   */
  isSessionAbandoned(startTime: Date, durationMinutes: number, gracePeriodMinutes = 15): boolean {
    const now = new Date();
    const elapsed = now.getTime() - startTime.getTime();
    const totalWithGrace = (durationMinutes + gracePeriodMinutes) * 60 * 1000;
    return elapsed > totalWithGrace;
  }
};

/**
 * XP Formula Validation (matches brief.md specifications)
 */
export const sessionXPFormulas = {
  /**
   * Calculate session XP: (10 + duration_minutes × 0.5) × willpower_multiplier
   */
  calculateSessionXP(durationMinutes: number, willpower: SessionWillpower): number {
    const base = 10 + (durationMinutes * 0.5);
    const multipliers: Record<SessionWillpower, number> = {
      high: 1.0,    // Piece of Cake
      medium: 1.5,  // Caffeinated  
      low: 2.0      // Don't Talk To Me
    };
    
    return Math.floor(base * multipliers[willpower]);
  },

  /**
   * Validate XP calculation matches database RPC
   * Used for testing/validation
   */
  async validateXPCalculation(durationMinutes: number, willpower: SessionWillpower): Promise<boolean> {
    const clientCalculation = this.calculateSessionXP(durationMinutes, willpower);
    
    const { data: serverCalculation } = await supabase
      .rpc('calculate_session_xp', {
        p_duration: durationMinutes,
        p_willpower: willpower
      });

    return clientCalculation === serverCalculation;
  }
};