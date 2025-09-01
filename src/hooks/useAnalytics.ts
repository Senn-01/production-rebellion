/**
 * Analytics Hook - React Query Integration
 * 
 * Manages analytics dashboard data, performance metrics, and insights
 * Features:
 * - Complete dashboard data aggregation
 * - Performance metrics with caching optimization
 * - Personal records tracking
 * - Achievement status monitoring
 * - Weekly trends and heatmap data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { 
  analyticsService,
  type HeroStats,
  type WeeklyStats,
  type SessionHeatmapData,
  type ProjectCompletionData,
  type PersonalRecords,
  type AnalyticsDashboard
} from '@/services/analytics.service';
import { QUERY_KEYS } from '@/lib/query-keys';
import type { Database } from '@/types/database';

type RecordType = Database['public']['Enums']['record_type'];

export interface UseAnalyticsOptions {
  userId: string;
  enableRealtime?: boolean;
  cacheDuration?: number; // in milliseconds
}

export interface UseAnalyticsResult {
  // Complete dashboard data
  dashboardData: AnalyticsDashboard | undefined;
  isDashboardLoading: boolean;
  
  // Individual sections (for granular loading)
  heroStats: HeroStats | undefined;
  weeklyTrend: WeeklyStats[] | undefined;
  sessionHeatmap: SessionHeatmapData[] | undefined;
  projectCompletions: ProjectCompletionData | undefined;
  personalRecords: PersonalRecords | undefined;
  
  // Loading states
  isLoadingHeroStats: boolean;
  isLoadingWeeklyTrend: boolean;
  isLoadingHeatmap: boolean;
  isLoadingCompletions: boolean;
  isLoadingRecords: boolean;
  
  // Quick performance summary
  performanceSummary: {
    todaySessions: number;
    weekSessions: number;
    currentStreak: number;
    totalXP: number;
  } | undefined;
  isLoadingPerformance: boolean;
  
  // Actions
  updatePersonalRecord: (type: RecordType, value: number, date: string) => Promise<void>;
  
  // Refetch functions
  refetchDashboard: () => Promise<any>;
  refetchHeroStats: () => Promise<any>;
  refetchPerformance: () => Promise<any>;
  
  // Utility functions
  getStreakMessage: (streak: number) => string;
  getPerformanceInsight: () => string;
}

/**
 * Main analytics hook
 */
export function useAnalytics({ 
  userId, 
  enableRealtime = true, 
  cacheDuration = 300000 // 5 minutes default
}: UseAnalyticsOptions): UseAnalyticsResult {
  const queryClient = useQueryClient();

  // Complete dashboard query (most efficient for dashboard page)
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    refetch: refetchDashboard
  } = useQuery({
    queryKey: QUERY_KEYS.analytics.dashboard(userId),
    queryFn: () => analyticsService.getDashboardData(userId),
    staleTime: cacheDuration,
    enabled: !!userId,
    // Refresh when tab becomes visible
    refetchOnWindowFocus: enableRealtime
  });

  // Individual section queries (for partial loading/updates)
  const {
    data: heroStats,
    isLoading: isLoadingHeroStats,
    refetch: refetchHeroStats
  } = useQuery({
    queryKey: QUERY_KEYS.analytics.heroStats(userId),
    queryFn: () => analyticsService.getHeroStats(userId),
    staleTime: 60000, // 1 minute (more frequent updates)
    enabled: !!userId
  });

  const {
    data: weeklyTrend,
    isLoading: isLoadingWeeklyTrend
  } = useQuery({
    queryKey: QUERY_KEYS.analytics.weeklyTrend(userId, 8),
    queryFn: () => analyticsService.getWeeklyTrend(userId, 8),
    staleTime: cacheDuration,
    enabled: !!userId
  });

  const {
    data: sessionHeatmap,
    isLoading: isLoadingHeatmap
  } = useQuery({
    queryKey: QUERY_KEYS.analytics.sessionHeatmap(userId, 14),
    queryFn: () => analyticsService.getSessionHeatmap(userId, 14),
    staleTime: 300000, // 5 minutes
    enabled: !!userId
  });

  const {
    data: projectCompletions,
    isLoading: isLoadingCompletions
  } = useQuery({
    queryKey: QUERY_KEYS.analytics.projectCompletions(userId),
    queryFn: () => analyticsService.getProjectCompletions(userId),
    staleTime: 600000, // 10 minutes (less frequent updates)
    enabled: !!userId
  });

  const {
    data: personalRecords,
    isLoading: isLoadingRecords
  } = useQuery({
    queryKey: QUERY_KEYS.analytics.personalRecords(userId),
    queryFn: () => analyticsService.getPersonalRecords(userId),
    staleTime: 600000, // 10 minutes
    enabled: !!userId
  });

  // Quick performance summary (for header/widget display)
  const {
    data: performanceSummary,
    isLoading: isLoadingPerformance,
    refetch: refetchPerformance
  } = useQuery({
    queryKey: QUERY_KEYS.analytics.performanceSummary(userId),
    queryFn: () => analyticsService.getPerformanceSummary(userId),
    staleTime: 30000, // 30 seconds
    enabled: !!userId
  });

  // Personal record update mutation
  const updatePersonalRecordMutation = useMutation({
    mutationFn: ({ type, value, date }: { type: RecordType; value: number; date: string }) =>
      analyticsService.updatePersonalRecords(userId, type, value, date),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.analytics.personalRecords(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.analytics.heroStats(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.analytics.dashboard(userId) });
    },
    onError: (error) => {
      console.error('[useAnalytics] Update personal record error:', error);
    }
  });

  // Utility functions
  const getStreakMessage = useCallback((streak: number): string => {
    if (streak === 0) return "Let's start a streak! 💪";
    if (streak === 1) return "Great start! Keep it going! 🔥";
    if (streak < 4) return `${streak} weeks strong! 🚀`;
    if (streak < 8) return `Amazing ${streak}-week streak! 🎯`;
    if (streak < 12) return `Incredible ${streak} weeks! 🏆`;
    return `Legendary ${streak}-week streak! 👑`;
  }, []);

  const getPerformanceInsight = useCallback((): string => {
    if (!performanceSummary) return "";
    
    const { todaySessions, weekSessions, currentStreak } = performanceSummary;
    
    if (todaySessions === 0 && weekSessions === 0) {
      return "Ready to start your focus journey? 🌟";
    }
    
    if (todaySessions === 0 && weekSessions > 0) {
      return "You've got momentum this week - time for today's session! ⚡";
    }
    
    if (todaySessions > 0 && currentStreak > 0) {
      return `${todaySessions} sessions today, ${currentStreak}-week streak! 🔥`;
    }
    
    if (weekSessions >= 10) {
      return "Power user alert! Incredible weekly performance! 🏆";
    }
    
    if (weekSessions >= 5) {
      return "Solid focus week - keep the momentum! 💪";
    }
    
    return `${weekSessions} sessions this week. You're building great habits! 🎯`;
  }, [performanceSummary]);

  // Action wrappers
  const handleUpdatePersonalRecord = useCallback(async (
    type: RecordType, 
    value: number, 
    date: string
  ) => {
    await updatePersonalRecordMutation.mutateAsync({ type, value, date });
  }, [updatePersonalRecordMutation]);

  return {
    // Complete dashboard data
    dashboardData,
    isDashboardLoading,
    
    // Individual sections
    heroStats,
    weeklyTrend,
    sessionHeatmap,
    projectCompletions,
    personalRecords,
    
    // Loading states
    isLoadingHeroStats,
    isLoadingWeeklyTrend,
    isLoadingHeatmap,
    isLoadingCompletions,
    isLoadingRecords,
    
    // Performance summary
    performanceSummary,
    isLoadingPerformance,
    
    // Actions
    updatePersonalRecord: handleUpdatePersonalRecord,
    
    // Refetch functions
    refetchDashboard,
    refetchHeroStats,
    refetchPerformance,
    
    // Utilities
    getStreakMessage,
    getPerformanceInsight
  };
}

/**
 * Lightweight hook for XP display in header
 */
export function useCurrentWeekXP(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.xp.currentWeek(userId),
    queryFn: async () => {
      const heroStats = await analyticsService.getHeroStats(userId);
      return {
        weeklyXP: heroStats.currentWeek.xp,
        totalXP: heroStats.allTimeStats.totalXP
      };
    },
    staleTime: 30000, // 30 seconds
    enabled: !!userId
  });
}

/**
 * Hook for session heatmap with custom date range
 */
export function useSessionHeatmap(userId: string, days: number = 14) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.sessionHeatmap(userId, days),
    queryFn: () => analyticsService.getSessionHeatmap(userId, days),
    staleTime: 300000, // 5 minutes
    enabled: !!userId && days > 0
  });
}

/**
 * Hook for weekly trend analysis
 */
export function useWeeklyTrend(userId: string, weeks: number = 8) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.weeklyTrend(userId, weeks),
    queryFn: () => analyticsService.getWeeklyTrend(userId, weeks),
    staleTime: 300000, // 5 minutes
    enabled: !!userId && weeks > 0,
    select: (data) => {
      // Add computed insights
      const totalSessions = data.reduce((sum, week) => sum + week.sessionCount, 0);
      const averageSessionsPerWeek = totalSessions / weeks;
      const trend = data.length >= 2 
        ? data[data.length - 1].sessionCount - data[data.length - 2].sessionCount
        : 0;
      
      return {
        data,
        insights: {
          totalSessions,
          averageSessionsPerWeek: Math.round(averageSessionsPerWeek * 100) / 100,
          trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
          trendValue: Math.abs(trend)
        }
      };
    }
  });
}

/**
 * Hook for achievement progress monitoring
 */
export function useAchievementStatus(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.achievements(userId),
    queryFn: () => analyticsService.getAchievementStatus(userId),
    staleTime: 600000, // 10 minutes
    enabled: !!userId,
    select: (data) => {
      const totalAchievements = data.unlocked.length + data.locked.length;
      const completionPercentage = Math.round((data.unlocked.length / totalAchievements) * 100);
      const recentUnlocks = data.unlocked
        .filter(a => a.unlocked_at)
        .sort((a, b) => new Date(b.unlocked_at!).getTime() - new Date(a.unlocked_at!).getTime())
        .slice(0, 3);
      
      return {
        ...data,
        insights: {
          totalAchievements,
          completionPercentage,
          recentUnlocks
        }
      };
    }
  });
}