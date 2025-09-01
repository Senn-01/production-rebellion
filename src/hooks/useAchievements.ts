/**
 * Achievement Hooks - TanStack Query v5 Integration
 * 
 * Provides React hooks for achievement checking, progress tracking,
 * and real-time unlock notifications with optimistic updates
 */

import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  type QueryClient 
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { achievementsService } from '@/services/achievements.service';
import { QUERY_KEYS, queryKeyUtils } from '@/lib/query-keys';
import { handleApiError } from '@/lib/error-handler';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import type { 
  AchievementWithStatus,
  AchievementCheckResult,
  AchievementStats,
  AchievementProgress,
  AchievementTriggerEvent
} from '@/services/achievements.service';

/**
 * Get all achievements with unlock status
 */
export function useAchievements() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: QUERY_KEYS.userAchievements(),
    queryFn: () => achievementsService.getUserAchievements(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get achievement progress for locked achievements
 */
export function useAchievementProgress() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: [...QUERY_KEYS.achievements(), 'progress'],
    queryFn: () => achievementsService.getAchievementProgress(user!.id),
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute (for real-time progress)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get achievement statistics
 */
export function useAchievementStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: [...QUERY_KEYS.achievements(), 'stats'],
    queryFn: () => achievementsService.getAchievementStats(user!.id),
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Check achievements mutation with notification handling
 */
export function useCheckAchievements() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (triggerEvent?: AchievementTriggerEvent) => 
      achievementsService.checkAchievements(user!.id, triggerEvent),
    
    onSuccess: async (results) => {
      // Find newly unlocked achievements
      const newUnlocks = results.filter(r => r.newlyUnlocked);
      
      if (newUnlocks.length > 0) {
        // Get achievement details for notifications
        const achievements = queryClient.getQueryData<AchievementWithStatus[]>(
          QUERY_KEYS.userAchievements()
        );
        
        // Show notifications for each unlock
        newUnlocks.forEach(unlock => {
          const achievement = achievements?.find(a => a.key === unlock.achievementKey);
          if (achievement) {
            toast.success(
              `🏆 Achievement Unlocked: ${achievement.name}!`,
              {
                description: `${achievement.description} (+${achievement.xp_reward} XP)`,
                duration: 5000,
              }
            );
          }
        });
        
        // Invalidate related queries
        await queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.achievements() 
        });
        await queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.weeklyXp() 
        });
        
        // Invalidate XP queries for the user
        if (user) {
          await queryClient.invalidateQueries({ 
            queryKey: QUERY_KEYS.xp.all(user.id) 
          });
        }
      }
      
      return results;
    },
    
    onError: (error) => {
      console.error('[Achievements] Check failed:', error);
      // Silent failure - achievements shouldn't break the app
    }
  });
}

/**
 * Achievement check listener hook
 * Automatically checks achievements when certain events occur
 */
export function useAchievementListener(
  event: AchievementTriggerEvent | null,
  enabled: boolean = true
) {
  const checkAchievements = useCheckAchievements();
  const { user } = useAuth();
  
  useEffect(() => {
    if (enabled && event && user) {
      // Debounce multiple rapid events
      const timeoutId = setTimeout(() => {
        checkAchievements.mutate(event);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [event, enabled, user]);
  
  return checkAchievements;
}

/**
 * Hook to check achievements after specific operations
 * Use this in components after project completion, session completion, etc.
 */
export function useAchievementTrigger() {
  const checkAchievements = useCheckAchievements();
  
  return {
    onCaptureCreated: () => checkAchievements.mutate('capture_created'),
    onProjectCompleted: () => checkAchievements.mutate('project_completed'),
    onSessionCompleted: () => checkAchievements.mutate('session_completed'),
    onWeekBoundary: () => checkAchievements.mutate('week_boundary'),
    checkAll: () => checkAchievements.mutate('manual_check'),
  };
}

/**
 * Get a specific achievement by key
 */
export function useAchievement(achievementKey: string) {
  const { data: achievements } = useAchievements();
  
  return achievements?.find(a => a.key === achievementKey);
}

/**
 * Check if a specific achievement is unlocked
 */
export function useIsAchievementUnlocked(achievementKey: string): boolean {
  const achievement = useAchievement(achievementKey);
  return achievement?.isUnlocked || false;
}