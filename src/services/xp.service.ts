/**
 * XP Service - Experience Points Calculations
 * 
 * Implements EXACT formulas from brief.md with mathematical precision:
 * - Session XP: (10 + duration×0.5) × willpower_multiplier  
 * - Project XP: cost × benefit × 10 × (boss_battle ? 2 : 1)
 * - Weekly XP tracking with timezone awareness
 * - Achievement XP rewards
 */

import { supabase } from '@/lib/supabase/client';
import { 
  handleApiError,
  createXPCalculationError
} from '@/lib/error-handler';
import { 
  getUserTimezone,
  getMonday,
  logDatabaseQuery 
} from '@/lib/supabase/utils';
import type { Database } from '@/types/database';

// Type definitions
type XPTracking = Database['public']['Tables']['xp_tracking']['Row'];
type XPTrackingInsert = Database['public']['Tables']['xp_tracking']['Insert'];

export type WillpowerLevel = 'high' | 'medium' | 'low';
export type SessionDuration = 60 | 90 | 120;
export type XPSourceType = 'session_completion' | 'project_completion' | 'achievement';

export interface XPCalculationResult {
  xp: number;
  formula: string;
  breakdown: XPBreakdown;
}

export interface XPBreakdown {
  basePoints: number;
  multiplier: number;
  bonusPoints?: number;
  finalPoints: number;
  explanation: string;
}

export interface WeeklyXPSummary {
  weekStart: string;
  totalXP: number;
  sessionXP: number;
  projectXP: number;
  achievementXP: number;
  xpByDay: Array<{ date: string; xp: number }>;
}

export interface XPLeaderboard {
  currentWeek: number;
  allTime: number;
  weeklyRank: number; // Compared to user's historical weeks
  streak: number; // Consecutive weeks with XP earned
}

/**
 * Core XP Service - Implements exact brief.md formulas
 */
export const xpService = {
  /**
   * Calculate session XP using exact brief.md formula
   * Formula: (10 + duration×0.5) × willpower_multiplier
   */
  calculateSessionXP(
    duration: SessionDuration, 
    willpower: WillpowerLevel
  ): XPCalculationResult {
    logDatabaseQuery('xp_calculations', 'calculateSessionXP', { duration, willpower });

    // Willpower multipliers from brief.md
    const willpowerMultipliers = {
      high: 1.0,   // Piece of Cake
      medium: 1.5, // Caffeinated  
      low: 2.0     // Don't Talk To Me
    };

    const basePoints = 10 + (duration * 0.5);
    const multiplier = willpowerMultipliers[willpower];
    const finalPoints = Math.floor(basePoints * multiplier);

    const breakdown: XPBreakdown = {
      basePoints,
      multiplier,
      finalPoints,
      explanation: `(10 + ${duration}×0.5) × ${multiplier} = ${basePoints} × ${multiplier} = ${finalPoints} XP`
    };

    return {
      xp: finalPoints,
      formula: `(10 + duration×0.5) × ${multiplier}`,
      breakdown
    };
  },

  /**
   * Calculate project XP using exact brief.md formula  
   * Formula: cost × benefit × 10 × (boss_battle ? 2 : 1)
   */
  calculateProjectXP(
    cost: number,
    benefit: number,
    isBossBattle: boolean = false
  ): XPCalculationResult {
    logDatabaseQuery('xp_calculations', 'calculateProjectXP', { cost, benefit, isBossBattle });

    // Validate inputs
    if (cost < 1 || cost > 10 || benefit < 1 || benefit > 10) {
      throw createXPCalculationError(`Invalid cost/benefit values: cost=${cost}, benefit=${benefit}`);
    }

    const basePoints = cost * benefit * 10;
    const bossBattleMultiplier = isBossBattle ? 2 : 1;
    const finalPoints = basePoints * bossBattleMultiplier;

    const breakdown: XPBreakdown = {
      basePoints,
      multiplier: bossBattleMultiplier,
      bonusPoints: isBossBattle ? basePoints : 0,
      finalPoints,
      explanation: `${cost} × ${benefit} × 10${isBossBattle ? ' × 2 (Boss Battle!)' : ''} = ${finalPoints} XP`
    };

    return {
      xp: finalPoints,
      formula: `cost × benefit × 10${isBossBattle ? ' × 2' : ''}`,
      breakdown
    };
  },

  /**
   * Calculate achievement XP (fixed values from database)
   */
  async getAchievementXP(achievementKey: string): Promise<number> {
    logDatabaseQuery('achievement_definitions', 'getAchievementXP', { achievementKey });

    const { data, error } = await supabase
      .from('achievement_definitions')
      .select('xp_reward')
      .eq('key', achievementKey)
      .single();

    if (error) {
      throw handleApiError(error, 'getAchievementXP');
    }

    return data.xp_reward || 0;
  },

  /**
   * Record XP with timezone-aware week calculation
   */
  async recordXP(
    userId: string,
    points: number,
    sourceType: XPSourceType,
    sourceId: string
  ): Promise<XPTracking> {
    logDatabaseQuery('xp_tracking', 'recordXP', { userId, points, sourceType });

    // Get user timezone and calculate week start
    const timezone = await getUserTimezone(userId);
    const weekStart = getMonday(new Date(), timezone).toISOString().split('T')[0];

    const xpRecord: XPTrackingInsert = {
      user_id: userId,
      points,
      source_type: sourceType,
      source_id: sourceId,
      week_start: weekStart,
      earned_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('xp_tracking')
      .insert(xpRecord)
      .select()
      .single();

    if (error) {
      throw handleApiError(error, 'recordXP');
    }

    return data;
  },

  /**
   * Get current week's XP for user
   */
  async getCurrentWeekXP(userId: string): Promise<number> {
    logDatabaseQuery('xp_tracking', 'getCurrentWeekXP', { userId });

    const timezone = await getUserTimezone(userId);
    const weekStart = getMonday(new Date(), timezone).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('xp_tracking')
      .select('points')
      .eq('user_id', userId)
      .eq('week_start', weekStart);

    if (error) {
      throw handleApiError(error, 'getCurrentWeekXP');
    }

    return data.reduce((total, record) => total + record.points, 0);
  },

  /**
   * Get weekly XP summary with breakdown by source
   */
  async getWeeklyXPSummary(userId: string, weekStart?: string): Promise<WeeklyXPSummary> {
    logDatabaseQuery('xp_tracking', 'getWeeklyXPSummary', { userId, weekStart });

    // Use current week if not specified
    if (!weekStart) {
      const timezone = await getUserTimezone(userId);
      weekStart = getMonday(new Date(), timezone).toISOString().split('T')[0];
    }

    const { data, error } = await supabase
      .from('xp_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStart)
      .order('earned_at', { ascending: true });

    if (error) {
      throw handleApiError(error, 'getWeeklyXPSummary');
    }

    // Calculate totals by source type
    const sessionXP = data
      .filter(record => record.source_type === 'session_completion')
      .reduce((sum, record) => sum + record.points, 0);
      
    const projectXP = data
      .filter(record => record.source_type === 'project_completion')
      .reduce((sum, record) => sum + record.points, 0);
      
    const achievementXP = data
      .filter(record => record.source_type === 'achievement')
      .reduce((sum, record) => sum + record.points, 0);

    // Group by day for trend analysis
    const xpByDay = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayXP = data
        .filter(record => record.earned_at.startsWith(dateStr))
        .reduce((sum, record) => sum + record.points, 0);
        
      return { date: dateStr, xp: dayXP };
    });

    return {
      weekStart,
      totalXP: sessionXP + projectXP + achievementXP,
      sessionXP,
      projectXP,  
      achievementXP,
      xpByDay
    };
  },

  /**
   * Get XP leaderboard stats for user
   */
  async getXPLeaderboard(userId: string): Promise<XPLeaderboard> {
    logDatabaseQuery('xp_tracking', 'getXPLeaderboard', { userId });

    // Get current week XP
    const currentWeekXP = await this.getCurrentWeekXP(userId);

    // Get all-time XP
    const { data: allTimeData, error: allTimeError } = await supabase
      .from('xp_tracking')
      .select('points')
      .eq('user_id', userId);

    if (allTimeError) {
      throw handleApiError(allTimeError, 'getXPLeaderboard');
    }

    const allTimeXP = allTimeData.reduce((total, record) => total + record.points, 0);

    // Get weekly XP history for ranking
    const { data: weeklyData, error: weeklyError } = await supabase
      .from('xp_tracking')
      .select('week_start, points')
      .eq('user_id', userId)
      .order('week_start', { ascending: false });

    if (weeklyError) {
      throw handleApiError(weeklyError, 'getXPLeaderboard');
    }

    // Calculate weekly totals and rank current week
    const weeklyTotals = weeklyData.reduce((acc, record) => {
      acc[record.week_start] = (acc[record.week_start] || 0) + record.points;
      return acc;
    }, {} as Record<string, number>);

    const weeklyScores = Object.values(weeklyTotals).sort((a, b) => b - a);
    const currentWeekRank = weeklyScores.findIndex(score => score <= currentWeekXP) + 1;

    // Calculate streak of consecutive weeks with XP
    let streak = 0;
    const timezone = await getUserTimezone(userId);
    const checkDate = new Date();
    
    while (streak < 52) { // Max 1 year streak
      const weekStart = getMonday(checkDate, timezone).toISOString().split('T')[0];
      if (weeklyTotals[weekStart] && weeklyTotals[weekStart] > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 7);
      } else {
        break;
      }
    }

    return {
      currentWeek: currentWeekXP,
      allTime: allTimeXP,
      weeklyRank: currentWeekRank || weeklyScores.length + 1,
      streak
    };
  },

  /**
   * Get detailed XP history with filtering
   */
  async getXPHistory(
    userId: string,
    options: {
      sourceType?: XPSourceType;
      startDate?: string;
      endDate?: string;
      limit?: number;
    } = {}
  ): Promise<XPTracking[]> {
    logDatabaseQuery('xp_tracking', 'getXPHistory', { userId, options });

    let query = supabase
      .from('xp_tracking')
      .select('*')
      .eq('user_id', userId);

    if (options.sourceType) {
      query = query.eq('source_type', options.sourceType);
    }

    if (options.startDate) {
      query = query.gte('earned_at', options.startDate);
    }

    if (options.endDate) {
      query = query.lte('earned_at', options.endDate);
    }

    query = query.order('earned_at', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw handleApiError(error, 'getXPHistory');
    }

    return data;
  }
};

/**
 * Difficulty level mapping for sessions (from brief.md)
 * Used for UI display during active sessions
 */
export const difficultyLevels: Record<string, string> = {
  'high-60': "I'm Too Young to Die",
  'medium-60': "Hey, Not Too Rough", 
  'high-90': "Bring It On",
  'medium-90': "Come Get Some",
  'low-60': "Damn I'm Good",
  'high-120': "Crunch Time",
  'medium-120': "Balls of Steel ⚪⚪",
  'low-90': "Nightmare Deadline",
  'low-120': "Hail to the King 👑"
};

/**
 * Get difficulty level display string
 */
export function getDifficultyLevel(willpower: WillpowerLevel, duration: SessionDuration): string {
  return difficultyLevels[`${willpower}-${duration}`] || 'Unknown Difficulty';
}

/**
 * Validate XP calculation inputs
 */
export function validateXPInputs(type: 'session' | 'project', data: Record<string, unknown>): boolean {
  if (type === 'session') {
    const { duration, willpower } = data;
    return (
      [60, 90, 120].includes(duration as number) &&
      ['high', 'medium', 'low'].includes(willpower as string)
    );
  }
  
  if (type === 'project') {
    const { cost, benefit } = data;
    return (
      typeof cost === 'number' && cost >= 1 && cost <= 10 &&
      typeof benefit === 'number' && benefit >= 1 && benefit <= 10
    );
  }
  
  return false;
}

/**
 * Format XP for display with proper comma separation
 */
export function formatXP(xp: number): string {
  return xp.toLocaleString();
}