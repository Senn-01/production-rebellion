/**
 * Analytics Service - Performance Data & Insights
 * 
 * Handles all analytics operations including:
 * - Weekly session statistics and trends
 * - Personal records tracking and updates
 * - Achievement progress monitoring
 * - Session heatmap data for calendar visualization
 * - Project completion analytics
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
  logDatabaseQuery
} from '@/lib/supabase/utils';
import type { Database } from '@/types/database';

// Type definitions
type Session = Database['public']['Tables']['sessions']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];
type PersonalRecord = Database['public']['Tables']['personal_records']['Row'];
type WeekStreak = Database['public']['Tables']['week_streaks']['Row'];
type XPTracking = Database['public']['Tables']['xp_tracking']['Row'];
type Achievement = Database['public']['Tables']['user_achievements']['Row'];
type RecordType = Database['public']['Enums']['record_type'];

export interface WeeklyStats {
  weekStart: string;
  sessionCount: number;
  totalHours: number;
  totalXP: number;
  averageSessionLength: number;
  completionRate: number; // completed vs started sessions
}

export interface HeroStats {
  currentWeek: {
    sessions: number;
    hours: number;
    xp: number;
  };
  currentStreak: {
    weeks: number;
    startDate: string | null;
  };
  allTimeStats: {
    totalSessions: number;
    totalHours: number;
    totalXP: number;
    projectsCompleted: number;
  };
}

export interface SessionHeatmapData {
  date: string;
  sessionCount: number;
  totalMinutes: number;
  intensity: 'none' | 'light' | 'medium' | 'heavy'; // 0, 1-2, 3-4, 5+ sessions
}

export interface ProjectCompletionData {
  completedThisMonth: Array<{
    id: string;
    name: string;
    cost: number;
    benefit: number;
    completedAt: string;
    xpEarned: number;
    wasBosBattle: boolean;
  }>;
  completionsByPosition: Array<{
    cost: number;
    benefit: number;
    count: number;
    totalXP: number;
  }>;
  completedThisYear: number;
}

export interface PersonalRecords {
  bestDaySessions: { value: number; date: string } | null;
  bestWeekSessions: { value: number; weekStart: string } | null;
  maxWeekPoints: { value: number; weekStart: string } | null;
  longestStreak: { value: number; endDate: string } | null;
}

export interface AnalyticsDashboard {
  heroStats: HeroStats;
  weeklyTrend: WeeklyStats[];
  sessionHeatmap: SessionHeatmapData[];
  projectCompletions: ProjectCompletionData;
  personalRecords: PersonalRecords;
  achievements: {
    unlocked: Achievement[];
    locked: Array<{ key: string; name: string; teaser: string }>;
  };
}

/**
 * Core Analytics Service
 */
export const analyticsService = {
  /**
   * Get complete analytics dashboard data
   */
  async getDashboardData(userId: string): Promise<AnalyticsDashboard> {
    logDatabaseQuery('analytics', 'getDashboardData', { userId });

    const [
      heroStats,
      weeklyTrend,
      sessionHeatmap,
      projectCompletions,
      personalRecords,
      achievements
    ] = await Promise.all([
      this.getHeroStats(userId),
      this.getWeeklyTrend(userId, 8), // 8 weeks of trend data
      this.getSessionHeatmap(userId, 14), // 2 weeks of heatmap
      this.getProjectCompletions(userId),
      this.getPersonalRecords(userId),
      this.getAchievementStatus(userId)
    ]);

    return {
      heroStats,
      weeklyTrend,
      sessionHeatmap,
      projectCompletions,
      personalRecords,
      achievements
    };
  },

  /**
   * Get hero stats for dashboard top section
   */
  async getHeroStats(userId: string): Promise<HeroStats> {
    logDatabaseQuery('analytics', 'getHeroStats', { userId });

    const timezone = await getUserTimezone(userId);
    const now = new Date();
    const currentWeekStart = getMonday(now, timezone).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];

    // Current week stats
    const { data: weekSessions, error: weekError } = await supabase
      .from('sessions')
      .select('duration, completed, xp_earned')
      .eq('user_id', userId)
      .gte('date', currentWeekStart)
      .eq('completed', true);

    if (weekError) {
      throw handleApiError(weekError, 'getWeekStats');
    }

    const currentWeek = {
      sessions: weekSessions.length,
      hours: weekSessions.reduce((sum, s) => sum + s.duration, 0) / 60,
      xp: weekSessions.reduce((sum, s) => sum + (s.xp_earned || 0), 0)
    };

    // Current streak calculation
    const { data: streakData, error: streakError } = await supabase
      .from('week_streaks')
      .select('week_start, has_session')
      .eq('user_id', userId)
      .order('week_start', { ascending: false });

    if (streakError) {
      throw handleApiError(streakError, 'getStreakData');
    }

    let currentStreak = 0;
    let streakStartDate: string | null = null;
    
    for (const week of streakData) {
      if (week.has_session) {
        currentStreak++;
        streakStartDate = week.week_start;
      } else {
        break;
      }
    }

    // All-time stats
    const [
      { data: allSessions },
      { data: allProjects },
      { data: allXP }
    ] = await Promise.all([
      supabase
        .from('sessions')
        .select('duration, completed')
        .eq('user_id', userId)
        .eq('completed', true),
      
      supabase
        .from('projects')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'completed'),
      
      supabase
        .from('xp_tracking')
        .select('points')
        .eq('user_id', userId)
    ]);

    const allTimeStats = {
      totalSessions: allSessions?.length || 0,
      totalHours: (allSessions?.reduce((sum, s) => sum + s.duration, 0) || 0) / 60,
      totalXP: allXP?.reduce((sum, xp) => sum + xp.points, 0) || 0,
      projectsCompleted: allProjects?.length || 0
    };

    return {
      currentWeek,
      currentStreak: {
        weeks: currentStreak,
        startDate: streakStartDate
      },
      allTimeStats
    };
  },

  /**
   * Get weekly trend data for charts
   */
  async getWeeklyTrend(userId: string, weeks: number = 8): Promise<WeeklyStats[]> {
    logDatabaseQuery('analytics', 'getWeeklyTrend', { userId, weeks });

    const timezone = await getUserTimezone(userId);
    const endDate = getMonday(new Date(), timezone);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (weeks - 1) * 7);

    // Get week streak data
    const { data: weekData, error } = await supabase
      .from('week_streaks')
      .select('*')
      .eq('user_id', userId)
      .gte('week_start', startDate.toISOString().split('T')[0])
      .lte('week_start', endDate.toISOString().split('T')[0])
      .order('week_start', { ascending: true });

    if (error) {
      throw handleApiError(error, 'getWeeklyTrend');
    }

    // Get XP data for each week
    const weekStarts = [];
    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + i * 7);
      weekStarts.push(weekStart.toISOString().split('T')[0]);
    }

    const { data: xpData, error: xpError } = await supabase
      .from('xp_tracking')
      .select('week_start, points')
      .eq('user_id', userId)
      .in('week_start', weekStarts);

    if (xpError) {
      throw handleApiError(xpError, 'getWeeklyXPData');
    }

    // Combine data
    const weeklyStats: WeeklyStats[] = weekStarts.map(weekStart => {
      const week = weekData.find(w => w.week_start === weekStart);
      const xp = xpData.filter(x => x.week_start === weekStart).reduce((sum, x) => sum + x.points, 0);

      return {
        weekStart,
        sessionCount: week?.sessions_count || 0,
        totalHours: (week?.total_minutes || 0) / 60,
        totalXP: xp,
        averageSessionLength: week?.sessions_count > 0 ? (week.total_minutes / week.sessions_count) : 0,
        completionRate: 1.0 // For now, assume all started sessions are completed
      };
    });

    return weeklyStats;
  },

  /**
   * Get session heatmap data for calendar view
   */
  async getSessionHeatmap(userId: string, days: number = 14): Promise<SessionHeatmapData[]> {
    logDatabaseQuery('analytics', 'getSessionHeatmap', { userId, days });

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));

    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('date, duration, completed')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    if (error) {
      throw handleApiError(error, 'getSessionHeatmap');
    }

    // Group by date
    const sessionsByDate = new Map<string, { count: number; minutes: number }>();
    
    // Initialize all dates
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      sessionsByDate.set(dateString, { count: 0, minutes: 0 });
    }

    // Aggregate session data
    sessions?.forEach(session => {
      const existing = sessionsByDate.get(session.date) || { count: 0, minutes: 0 };
      if (session.completed) {
        existing.count++;
        existing.minutes += session.duration;
      }
      sessionsByDate.set(session.date, existing);
    });

    // Convert to heatmap format
    const heatmapData: SessionHeatmapData[] = Array.from(sessionsByDate.entries())
      .map(([date, data]) => {
        let intensity: SessionHeatmapData['intensity'] = 'none';
        if (data.count >= 5) intensity = 'heavy';
        else if (data.count >= 3) intensity = 'medium';
        else if (data.count >= 1) intensity = 'light';

        return {
          date,
          sessionCount: data.count,
          totalMinutes: data.minutes,
          intensity
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    return heatmapData;
  },

  /**
   * Get project completion analytics
   */
  async getProjectCompletions(userId: string): Promise<ProjectCompletionData> {
    logDatabaseQuery('analytics', 'getProjectCompletions', { userId });

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const currentYearStart = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];

    // This month's completions
    const { data: monthlyCompletions, error: monthlyError } = await supabase
      .from('projects')
      .select('id, name, cost, benefit, completed_at, was_boss_battle')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', currentMonthStart);

    if (monthlyError) {
      throw handleApiError(monthlyError, 'getMonthlyCompletions');
    }

    // Get XP for completed projects
    const monthlyProjectIds = monthlyCompletions?.map(p => p.id) || [];
    const { data: monthlyXP, error: xpError } = await supabase
      .from('xp_tracking')
      .select('source_id, points')
      .eq('user_id', userId)
      .eq('source_type', 'project_completion')
      .in('source_id', monthlyProjectIds);

    if (xpError) {
      throw handleApiError(xpError, 'getProjectXP');
    }

    const xpByProject = new Map(monthlyXP?.map(x => [x.source_id, x.points]) || []);

    const completedThisMonth = monthlyCompletions?.map(project => ({
      id: project.id,
      name: project.name,
      cost: project.cost,
      benefit: project.benefit,
      completedAt: project.completed_at!,
      xpEarned: xpByProject.get(project.id) || 0,
      wasBosBattle: project.was_boss_battle || false
    })) || [];

    // All-time completions by position (for scatter plot)
    const { data: allCompletions, error: allError } = await supabase
      .from('projects')
      .select('cost, benefit')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (allError) {
      throw handleApiError(allError, 'getAllCompletions');
    }

    // Group by position and count
    const positionMap = new Map<string, { count: number; totalXP: number }>();
    
    allCompletions?.forEach(project => {
      const key = `${project.cost}-${project.benefit}`;
      const existing = positionMap.get(key) || { count: 0, totalXP: 0 };
      existing.count++;
      existing.totalXP += project.cost * project.benefit * 10; // Base XP calculation
      positionMap.set(key, existing);
    });

    const completionsByPosition = Array.from(positionMap.entries()).map(([key, data]) => {
      const [cost, benefit] = key.split('-').map(Number);
      return {
        cost,
        benefit,
        count: data.count,
        totalXP: data.totalXP
      };
    });

    // This year's total
    const { data: yearlyCount, error: yearlyError } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('completed_at', currentYearStart);

    if (yearlyError) {
      throw handleApiError(yearlyError, 'getYearlyCount');
    }

    return {
      completedThisMonth,
      completionsByPosition,
      completedThisYear: yearlyCount?.length || 0
    };
  },

  /**
   * Get personal records
   */
  async getPersonalRecords(userId: string): Promise<PersonalRecords> {
    logDatabaseQuery('analytics', 'getPersonalRecords', { userId });

    const { data: records, error } = await supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw handleApiError(error, 'getPersonalRecords');
    }

    const recordMap = new Map(records?.map(r => [r.record_type, r]) || []);

    return {
      bestDaySessions: recordMap.has('best_day_sessions') 
        ? { value: recordMap.get('best_day_sessions')!.value, date: recordMap.get('best_day_sessions')!.achieved_on }
        : null,
      bestWeekSessions: recordMap.has('best_week_sessions')
        ? { value: recordMap.get('best_week_sessions')!.value, weekStart: recordMap.get('best_week_sessions')!.achieved_on }
        : null,
      maxWeekPoints: recordMap.has('max_week_points')
        ? { value: recordMap.get('max_week_points')!.value, weekStart: recordMap.get('max_week_points')!.achieved_on }
        : null,
      longestStreak: recordMap.has('longest_streak')
        ? { value: recordMap.get('longest_streak')!.value, endDate: recordMap.get('longest_streak')!.achieved_on }
        : null
    };
  },

  /**
   * Get achievement status (unlocked vs locked)
   */
  async getAchievementStatus(userId: string): Promise<{
    unlocked: Achievement[];
    locked: Array<{ key: string; name: string; teaser: string }>;
  }> {
    logDatabaseQuery('analytics', 'getAchievementStatus', { userId });

    const [
      { data: unlocked, error: unlockedError },
      { data: definitions, error: definitionsError }
    ] = await Promise.all([
      supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId),
      
      supabase
        .from('achievement_definitions')
        .select('*')
        .order('sort_order', { ascending: true })
    ]);

    if (unlockedError) {
      throw handleApiError(unlockedError, 'getUnlockedAchievements');
    }

    if (definitionsError) {
      throw handleApiError(definitionsError, 'getAchievementDefinitions');
    }

    const unlockedKeys = new Set(unlocked?.map(a => a.achievement_key) || []);

    const locked = definitions
      ?.filter(def => !unlockedKeys.has(def.key))
      .map(def => ({
        key: def.key,
        name: def.name,
        teaser: def.teaser
      })) || [];

    return {
      unlocked: unlocked || [],
      locked
    };
  },

  /**
   * Update personal records (called after session/project completion)
   */
  async updatePersonalRecords(userId: string, recordType: RecordType, value: number, achievedOn: string): Promise<void> {
    logDatabaseQuery('analytics', 'updatePersonalRecords', { userId, recordType, value });

    // Check if this is a new record
    const { data: existingRecord, error: fetchError } = await supabase
      .from('personal_records')
      .select('value')
      .eq('user_id', userId)
      .eq('record_type', recordType)
      .maybeSingle();

    if (fetchError) {
      throw handleApiError(fetchError, 'checkExistingRecord');
    }

    const isNewRecord = !existingRecord || value > existingRecord.value;

    if (isNewRecord) {
      const { error } = await supabase
        .from('personal_records')
        .upsert({
          user_id: userId,
          record_type: recordType,
          value,
          achieved_on: achievedOn
        }, { 
          onConflict: 'user_id,record_type' 
        });

      if (error) {
        throw handleApiError(error, 'updatePersonalRecord');
      }
    }
  },

  /**
   * Get quick performance summary
   */
  async getPerformanceSummary(userId: string): Promise<{
    todaySessions: number;
    weekSessions: number;
    currentStreak: number;
    totalXP: number;
  }> {
    logDatabaseQuery('analytics', 'getPerformanceSummary', { userId });

    const timezone = await getUserTimezone(userId);
    const today = new Date().toISOString().split('T')[0];
    const weekStart = getMonday(new Date(), timezone).toISOString().split('T')[0];

    const [
      { data: todaySessions },
      { data: weekSessions },
      { data: totalXP }
    ] = await Promise.all([
      supabase
        .from('sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('date', today)
        .eq('completed', true),
      
      supabase
        .from('sessions')
        .select('id')
        .eq('user_id', userId)
        .gte('date', weekStart)
        .eq('completed', true),
      
      supabase
        .from('xp_tracking')
        .select('points')
        .eq('user_id', userId)
    ]);

    // Get current streak from user profile (maintained by triggers)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('current_streak')
      .eq('user_id', userId)
      .single();

    return {
      todaySessions: todaySessions?.length || 0,
      weekSessions: weekSessions?.length || 0,
      currentStreak: profile?.current_streak || 0,
      totalXP: totalXP?.reduce((sum, xp) => sum + xp.points, 0) || 0
    };
  }
};