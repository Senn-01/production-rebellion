/**
 * XP Hooks - Experience Points & Gamification
 * 
 * Handles all XP-related operations with real-time updates
 * and achievement integration
 */

import { 
  useQuery, 
  useMutation, 
  useQueryClient 
} from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { xpService } from '@/services/xp.service';
import { queryKeys, queryKeyUtils } from '@/lib/query-keys';
import { handleApiError, getToastMessage } from '@/lib/error-handler';
import { useAuth } from '@/contexts/AuthContext';
import type { 
  WeeklyXPSummary,
  XPLeaderboard,
  XPSourceType 
} from '@/services/xp.service';
import type { Database } from '@/types/database';

type XPTracking = Database['public']['Tables']['xp_tracking']['Row'];

/**
 * Get current week's XP total
 */
export function useCurrentWeekXP() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.xp.currentWeek(user!.id),
    queryFn: () => xpService.getCurrentWeekXP(user!.id),
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds for real-time feel
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Get weekly XP summary with breakdown
 */
export function useWeeklyXPSummary(weekStart?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: weekStart 
      ? queryKeys.xp.weekly(user!.id, weekStart) 
      : queryKeys.xp.currentWeek(user!.id),
    queryFn: () => xpService.getWeeklyXPSummary(user!.id, weekStart),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get XP leaderboard stats
 */
export function useXPLeaderboard() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: [...queryKeys.xp.all(user!.id), 'leaderboard'],
    queryFn: () => xpService.getXPLeaderboard(user!.id),
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get XP history with filtering
 */
export function useXPHistory(options: {
  sourceType?: XPSourceType;
  startDate?: string;
  endDate?: string;
  limit?: number;
} = {}) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: [...queryKeys.xp.all(user!.id), 'history', options],
    queryFn: () => xpService.getXPHistory(user!.id, options),
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Record XP with cache updates
 */
export function useRecordXP() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ 
      points, 
      sourceType, 
      sourceId 
    }: { 
      points: number; 
      sourceType: XPSourceType; 
      sourceId: string;
    }) => xpService.recordXP(user!.id, points, sourceType, sourceId),
    
    onMutate: async ({ points, sourceType }) => {
      // Cancel outgoing refetches for XP-related queries
      await queryClient.cancelQueries({ queryKey: queryKeys.xp.currentWeek(user!.id) });
      
      // Snapshot previous values
      const previousWeeklyXP = queryClient.getQueryData<number>(
        queryKeys.xp.currentWeek(user!.id)
      );
      
      // Optimistically update current week XP
      queryClient.setQueryData<number>(
        queryKeys.xp.currentWeek(user!.id),
        (old) => (old || 0) + points
      );
      
      // Trigger XP animation immediately
      window.dispatchEvent(new CustomEvent('xp-earned', { 
        detail: { 
          xp: points, 
          source: sourceType 
        } 
      }));
      
      return { previousWeeklyXP };
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousWeeklyXP !== undefined) {
        queryClient.setQueryData(queryKeys.xp.currentWeek(user!.id), context.previousWeeklyXP);
      }
      
      const appError = handleApiError(error, 'recordXP');
      toast.error(getToastMessage(appError));
    },
    
    onSuccess: (data, { points, sourceType }) => {
      // Invalidate all XP-related queries
      queryKeyUtils.getXPRelatedKeys(user!.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      
      // Source-specific success messages
      const sourceMessages = {
        session_completion: `+${points.toLocaleString()} XP from focus session!`,
        project_completion: `+${points.toLocaleString()} XP from project completion!`,
        achievement: `+${points.toLocaleString()} XP achievement bonus!`
      };
      
      // Show subtle success feedback (main feedback comes from triggering components)
      if (process.env.NODE_ENV === 'development') {
        console.log(sourceMessages[sourceType] || `+${points} XP recorded`);
      }
    }
  });
}

/**
 * Calculate session XP (pure calculation, no recording)
 */
export function useCalculateSessionXP() {
  return useMutation({
    mutationFn: ({ duration, willpower }: { 
      duration: 60 | 90 | 120; 
      willpower: 'high' | 'medium' | 'low' 
    }) => Promise.resolve(xpService.calculateSessionXP(duration, willpower)),
    
    onError: (error) => {
      const appError = handleApiError(error, 'calculateSessionXP');
      toast.error(getToastMessage(appError));
    }
  });
}

/**
 * Calculate project XP (pure calculation, no recording)
 */
export function useCalculateProjectXP() {
  return useMutation({
    mutationFn: ({ cost, benefit, isBossBattle }: { 
      cost: number; 
      benefit: number; 
      isBossBattle?: boolean 
    }) => Promise.resolve(xpService.calculateProjectXP(cost, benefit, isBossBattle)),
    
    onError: (error) => {
      const appError = handleApiError(error, 'calculateProjectXP');
      toast.error(getToastMessage(appError));
    }
  });
}

/**
 * Real-time XP subscription hook
 * Listens for XP events and updates UI accordingly
 */
export function useXPEventListener() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Listen for custom XP events
  useEffect(() => {
    const handleXPEarned = (event: CustomEvent) => {
      const { xp, source, projectName } = event.detail;
      
      // Invalidate XP queries to reflect new totals
      queryKeyUtils.getXPRelatedKeys(user!.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      
      // Could trigger additional UI effects here:
      // - Confetti animation
      // - Sound effects
      // - Achievement notifications
    };
    
    window.addEventListener('xp-earned', handleXPEarned as EventListener);
    
    return () => {
      window.removeEventListener('xp-earned', handleXPEarned as EventListener);
    };
  }, [queryClient]);
}

/**
 * XP progress tracking for UI components
 */
export function useXPProgress() {
  const { data: currentWeekXP = 0 } = useCurrentWeekXP();
  const { data: leaderboard } = useXPLeaderboard();
  const { data: weeklySummary } = useWeeklyXPSummary();
  
  return {
    currentWeekXP,
    allTimeXP: leaderboard?.allTime || 0,
    weeklyRank: leaderboard?.weeklyRank || 0,
    streak: leaderboard?.streak || 0,
    xpBySource: weeklySummary ? {
      sessions: weeklySummary.sessionXP,
      projects: weeklySummary.projectXP,
      achievements: weeklySummary.achievementXP
    } : { sessions: 0, projects: 0, achievements: 0 },
    isLoading: !weeklySummary && !leaderboard
  };
}