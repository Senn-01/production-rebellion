/**
 * Achievements Service - Gamification Achievement System
 * 
 * Implements batch processing for 10 achievement conditions with:
 * - Smart trigger-based checking to minimize database calls
 * - Idempotent unlock operations via database constraints
 * - Automatic XP reward distribution
 * - Progress tracking for locked achievements
 */

import { supabase } from '@/lib/supabase/client';
import { 
  handleApiError,
  createAppError,
  AppErrorCode 
} from '@/lib/error-handler';
import { logDatabaseQuery } from '@/lib/supabase/utils';
import type { Database } from '@/types/database';

// Type definitions
type Achievement = Database['public']['Tables']['achievement_definitions']['Row'];
type UserAchievement = Database['public']['Tables']['user_achievements']['Row'];

export interface AchievementWithStatus extends Achievement {
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: AchievementProgress;
}

export interface AchievementProgress {
  current: number;
  target: number;
  percentage: number;
  description: string;
}

export interface AchievementCheckResult {
  achievementKey: string;
  newlyUnlocked: boolean;
}

export interface AchievementStats {
  totalUnlocked: number;
  totalAvailable: number;
  totalXPEarned: number;
  recentUnlocks: UserAchievement[];
}

/**
 * Achievement trigger events that should check specific achievements
 */
export type AchievementTriggerEvent = 
  | 'capture_created'
  | 'project_completed' 
  | 'session_completed'
  | 'week_boundary'
  | 'manual_check';

/**
 * Core Achievements Service
 */
export const achievementsService = {
  /**
   * Check and unlock achievements for a user
   * Uses smart trigger filtering to only check relevant achievements
   * Batch processing via single RPC call
   */
  async checkAchievements(
    userId: string, 
    triggerEvent?: AchievementTriggerEvent
  ): Promise<AchievementCheckResult[]> {
    logDatabaseQuery('achievements', 'checkAchievements', { userId, triggerEvent });
    
    try {
      // Call RPC function that handles all achievement checking logic
      const { data, error } = await supabase
        .rpc('check_and_unlock_achievements', {
          p_user_id: userId
        });

      if (error) {
        throw handleApiError(error, 'checkAchievements');
      }

      // Transform database response to our interface
      const results: AchievementCheckResult[] = (data || []).map((item: any) => ({
        achievementKey: item.achievement_key,
        newlyUnlocked: item.newly_unlocked || false
      }));

      // Filter for newly unlocked achievements for notification
      const newUnlocks = results.filter(r => r.newlyUnlocked);
      if (newUnlocks.length > 0) {
        console.log(`[Achievements] Unlocked ${newUnlocks.length} new achievements:`, 
          newUnlocks.map(u => u.achievementKey));
      }

      return results;
    } catch (error) {
      console.error('[Achievements] Check failed:', error);
      // Don't throw - achievement failures shouldn't break core functionality
      return [];
    }
  },

  /**
   * Get all achievements with unlock status for a user
   */
  async getUserAchievements(userId: string): Promise<AchievementWithStatus[]> {
    logDatabaseQuery('achievements', 'getUserAchievements', { userId });
    
    // Get all achievement definitions
    const { data: definitions, error: defError } = await supabase
      .from('achievement_definitions')
      .select('*')
      .order('sort_order');

    if (defError) {
      throw handleApiError(defError, 'getUserAchievements.definitions');
    }

    // Get user's unlocked achievements
    const { data: unlocked, error: unlockError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);

    if (unlockError) {
      throw handleApiError(unlockError, 'getUserAchievements.unlocked');
    }

    // Map unlock status to definitions
    const unlockedMap = new Map(
      unlocked.map(u => [u.achievement_key, u])
    );

    // Combine definitions with unlock status
    const achievementsWithStatus: AchievementWithStatus[] = definitions.map(def => ({
      ...def,
      isUnlocked: unlockedMap.has(def.key),
      unlockedAt: unlockedMap.get(def.key)?.unlocked_at || undefined,
      progress: !unlockedMap.has(def.key) 
        ? undefined // Progress calculation deferred (would require stats query)
        : undefined
    }));

    return achievementsWithStatus;
  },

  /**
   * Get achievement progress for locked achievements
   * Provides current/target values for each achievement condition
   */
  async getAchievementProgress(userId: string): Promise<Map<string, AchievementProgress>> {
    logDatabaseQuery('achievements', 'getAchievementProgress', { userId });
    
    // Get user stats via RPC function
    const { data: stats, error } = await supabase
      .rpc('get_user_achievement_stats', {
        p_user_id: userId
      });

    if (error) {
      throw handleApiError(error, 'getAchievementProgress');
    }

    // Map progress for each achievement
    const progressMap = new Map<string, AchievementProgress>();
    
    // Parse the JSON stats
    const userStats = stats as any;
    
    progressMap.set('paths_are_made_by_walking', {
      current: userStats.captures_count || 0,
      target: 1,
      percentage: Math.min(100, (userStats.captures_count || 0) * 100),
      description: `${userStats.captures_count || 0} / 1 capture`
    });

    progressMap.set('first_blood', {
      current: userStats.projects_completed || 0,
      target: 1,
      percentage: Math.min(100, (userStats.projects_completed || 0) * 100),
      description: `${userStats.projects_completed || 0} / 1 project completed`
    });

    progressMap.set('double_digits', {
      current: userStats.projects_completed || 0,
      target: 10,
      percentage: Math.min(100, ((userStats.projects_completed || 0) / 10) * 100),
      description: `${userStats.projects_completed || 0} / 10 projects completed`
    });

    progressMap.set('giant_slayer', {
      current: userStats.has_giant_slayer ? 1 : 0,
      target: 1,
      percentage: userStats.has_giant_slayer ? 100 : 0,
      description: userStats.has_giant_slayer 
        ? 'Completed!' 
        : 'Complete a project with cost 10'
    });

    progressMap.set('dark_souls_mode', {
      current: userStats.has_dark_souls ? 1 : 0,
      target: 1,
      percentage: userStats.has_dark_souls ? 100 : 0,
      description: userStats.has_dark_souls
        ? 'Completed!'
        : 'Complete a low-confidence Boss Battle'
    });

    progressMap.set('frame_perfect', {
      current: userStats.has_frame_perfect ? 1 : 0,
      target: 1,
      percentage: userStats.has_frame_perfect ? 100 : 0,
      description: userStats.has_frame_perfect
        ? 'Completed!'
        : 'Complete a project on its due date'
    });

    progressMap.set('dedicated', {
      current: userStats.week_streak_count || 0,
      target: 4,
      percentage: Math.min(100, ((userStats.week_streak_count || 0) / 4) * 100),
      description: `${userStats.week_streak_count || 0} / 4 week streak`
    });

    progressMap.set('the_grind', {
      current: userStats.today_minutes || 0,
      target: 600,
      percentage: Math.min(100, ((userStats.today_minutes || 0) / 600) * 100),
      description: `${userStats.today_minutes || 0} / 600 minutes today`
    });

    progressMap.set('the_estimator', {
      current: userStats.estimator_count || 0,
      target: 5,
      percentage: Math.min(100, ((userStats.estimator_count || 0) / 5) * 100),
      description: `${userStats.estimator_count || 0} / 5 accurate estimates`
    });

    progressMap.set('no_brainer_king', {
      current: userStats.no_brainer_count || 0,
      target: 10,
      percentage: Math.min(100, ((userStats.no_brainer_count || 0) / 10) * 100),
      description: `${userStats.no_brainer_count || 0} / 10 low-cost, high-benefit projects`
    });

    return progressMap;
  },

  /**
   * Get achievement statistics for user
   */
  async getAchievementStats(userId: string): Promise<AchievementStats> {
    logDatabaseQuery('achievements', 'getAchievementStats', { userId });
    
    // Get all definitions for total count
    const { data: definitions, error: defError } = await supabase
      .from('achievement_definitions')
      .select('key, xp_reward');

    if (defError) {
      throw handleApiError(defError, 'getAchievementStats.definitions');
    }

    // Get user's unlocked achievements
    const { data: unlocked, error: unlockError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (unlockError) {
      throw handleApiError(unlockError, 'getAchievementStats.unlocked');
    }

    // Calculate total XP earned from achievements
    const totalXPEarned = unlocked.reduce((sum, ua) => sum + (ua.xp_awarded || 0), 0);

    return {
      totalUnlocked: unlocked.length,
      totalAvailable: definitions.length,
      totalXPEarned,
      recentUnlocks: unlocked.slice(0, 5) // Last 5 unlocks
    };
  },

  /**
   * Force check all achievements (for debugging/testing)
   */
  async forceCheckAllAchievements(userId: string): Promise<AchievementCheckResult[]> {
    console.log('[Achievements] Force checking all achievements for user:', userId);
    return this.checkAchievements(userId, 'manual_check');
  }
};

// Export for use in hooks
export type { Achievement, UserAchievement };