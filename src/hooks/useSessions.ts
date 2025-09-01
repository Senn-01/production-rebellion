/**
 * Sessions Hook - React Query Integration
 * 
 * Manages session state, timer integration, and real-time updates
 * Features:
 * - Session CRUD operations with optimistic updates
 * - Timer state management and synchronization
 * - Daily commitment tracking
 * - Cross-tab session synchronization
 * - Automatic session recovery after refresh
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { 
  sessionsService,
  sessionTimerUtils,
  type SessionWithProject,
  type SessionCreationData,
  type SessionCompletionData,
  type DailyCommitmentData
} from '@/services/sessions.service';
import { 
  SessionTimer,
  timerManager,
  type TimerConfig,
  type TimerState
} from '@/lib/timer-manager';
import { QUERY_KEYS } from '@/lib/query-keys';
import type { Database } from '@/types/database';

type SessionWillpower = Database['public']['Enums']['session_willpower'];
type SessionMindset = Database['public']['Enums']['session_mindset'];

export interface UseSessionsOptions {
  userId: string;
  enableRealtime?: boolean;
}

export interface SessionTimerState {
  remainingTime: number; // in seconds
  progress: number; // 0 to 1
  isRunning: boolean;
  isPaused: boolean;
  state: TimerState;
  formattedTime: string;
  difficultyQuote: string;
}

export interface UseSessionsResult {
  // Session data
  todaySessions: SessionWithProject[];
  activeSession: SessionWithProject | null;
  todayProgress: {
    commitment: any;
    completed: number;
    progress: number;
  } | null;
  
  // Loading states
  isLoadingTodaySessions: boolean;
  isLoadingActiveSession: boolean;
  isLoadingProgress: boolean;
  
  // Timer state
  timerState: SessionTimerState;
  
  // Actions
  startSession: (data: Omit<SessionCreationData, 'userId'>) => Promise<void>;
  completeSession: (mindset: SessionMindset) => Promise<void>;
  interruptSession: () => Promise<void>;
  setDailyCommitment: (targetSessions: number) => Promise<void>;
  
  // Utilities
  getDifficultyQuote: (willpower: SessionWillpower, duration: number) => string;
  formatTime: (seconds: number) => string;
  
  // Refetch functions
  refetchTodaySessions: () => Promise<any>;
  refetchActiveSession: () => Promise<any>;
  refetchProgress: () => Promise<any>;
}

/**
 * Main sessions hook
 */
export function useSessions({ userId, enableRealtime = true }: UseSessionsOptions): UseSessionsResult {
  const queryClient = useQueryClient();
  const timerRef = useRef<SessionTimer | null>(null);
  const [timerState, setTimerState] = useState<SessionTimerState>({
    remainingTime: 0,
    progress: 0,
    isRunning: false,
    isPaused: false,
    state: 'idle',
    formattedTime: '00:00',
    difficultyQuote: ''
  });

  // Queries
  const {
    data: todaySessions = [],
    isLoading: isLoadingTodaySessions,
    refetch: refetchTodaySessions
  } = useQuery({
    queryKey: QUERY_KEYS.sessions.today(userId),
    queryFn: () => sessionsService.getTodaySessions(userId),
    staleTime: 30000, // 30 seconds
    enabled: !!userId
  });

  const {
    data: activeSession,
    isLoading: isLoadingActiveSession,
    refetch: refetchActiveSession
  } = useQuery({
    queryKey: QUERY_KEYS.sessions.active(userId),
    queryFn: () => sessionsService.getActiveSession(userId),
    staleTime: 10000, // 10 seconds
    enabled: !!userId
  });

  const {
    data: todayProgress,
    isLoading: isLoadingProgress,
    refetch: refetchProgress
  } = useQuery({
    queryKey: QUERY_KEYS.sessions.todayProgress(userId),
    queryFn: () => sessionsService.getTodayProgress(userId),
    staleTime: 60000, // 1 minute
    enabled: !!userId
  });

  // Mutations
  const startSessionMutation = useMutation({
    mutationFn: (data: SessionCreationData) => sessionsService.startSession(data),
    onMutate: async (data) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.sessions.active(userId) });
      
      const optimisticSession: SessionWithProject = {
        id: `temp-${Date.now()}`,
        user_id: userId,
        project_id: data.projectId,
        duration: data.duration,
        willpower: data.willpower,
        completed: false,
        mindset: null,
        started_at: new Date().toISOString(),
        ended_at: null,
        date: new Date().toISOString().split('T')[0],
        xp_earned: null,
        xp_breakdown: null
      };

      queryClient.setQueryData(QUERY_KEYS.sessions.active(userId), optimisticSession);
      
      return { previousActive: queryClient.getQueryData(QUERY_KEYS.sessions.active(userId)) };
    },
    onSuccess: (newSession) => {
      // Start timer
      startTimer(newSession);
      
      // Update cache with real data
      queryClient.setQueryData(QUERY_KEYS.sessions.active(userId), newSession);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions.today(userId) });
      
      toast.success('Focus session started! 🎯');
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousActive) {
        queryClient.setQueryData(QUERY_KEYS.sessions.active(userId), context.previousActive);
      }
      
      toast.error('Failed to start session. Try again.');
      console.error('[useSessions] Start session error:', error);
    }
  });

  const completeSessionMutation = useMutation({
    mutationFn: (data: SessionCompletionData) => sessionsService.completeSession(data),
    onSuccess: ({ session, xpEarned }) => {
      // Stop timer
      stopTimer();
      
      // Update caches
      queryClient.setQueryData(QUERY_KEYS.sessions.active(userId), null);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions.today(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions.todayProgress(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.xp.current(userId) });
      
      toast.success(`Session complete! +${xpEarned} XP earned 🎉`);
    },
    onError: (error) => {
      toast.error('Failed to complete session. Try again.');
      console.error('[useSessions] Complete session error:', error);
    }
  });

  const interruptSessionMutation = useMutation({
    mutationFn: (sessionId: string) => sessionsService.interruptSession(sessionId, userId),
    onSuccess: () => {
      // Stop timer
      stopTimer();
      
      // Update caches
      queryClient.setQueryData(QUERY_KEYS.sessions.active(userId), null);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions.today(userId) });
      
      toast.info('Session interrupted. +10 XP for the attempt 💪');
    },
    onError: (error) => {
      toast.error('Failed to interrupt session.');
      console.error('[useSessions] Interrupt session error:', error);
    }
  });

  const setDailyCommitmentMutation = useMutation({
    mutationFn: (targetSessions: number) => sessionsService.setDailyCommitment({
      userId,
      date: new Date().toISOString().split('T')[0],
      targetSessions
    }),
    onSuccess: (commitment) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions.todayProgress(userId) });
      toast.success(`Daily commitment set: ${commitment.target_sessions} sessions 🎯`);
    },
    onError: (error) => {
      toast.error('Failed to set commitment. Try again.');
      console.error('[useSessions] Set commitment error:', error);
    }
  });

  // Timer management
  const startTimer = useCallback((session: SessionWithProject) => {
    if (timerRef.current) {
      timerRef.current.destroy();
    }

    const config: TimerConfig = {
      sessionId: session.id,
      userId,
      duration: session.duration,
      onTick: (remainingSeconds, progress) => {
        setTimerState(prev => ({
          ...prev,
          remainingTime: remainingSeconds,
          progress,
          formattedTime: sessionTimerUtils.formatTime(remainingSeconds),
          isRunning: true,
          state: 'running'
        }));
      },
      onComplete: () => {
        setTimerState(prev => ({
          ...prev,
          remainingTime: 0,
          progress: 1,
          isRunning: false,
          state: 'completed'
        }));
        // UI will handle showing completion modal
      },
      onVisibilityChange: (isVisible) => {
        console.log(`[useSessions] Tab visibility changed: ${isVisible}`);
      },
      onError: (error) => {
        console.error('[useSessions] Timer error:', error);
        toast.error('Timer error occurred');
      }
    };

    timerRef.current = timerManager.createTimer(config);
    
    // Set initial timer state
    setTimerState({
      remainingTime: session.duration * 60,
      progress: 0,
      isRunning: false,
      isPaused: false,
      state: 'idle',
      formattedTime: sessionTimerUtils.formatTime(session.duration * 60),
      difficultyQuote: sessionTimerUtils.getDifficultyQuote(session.willpower, session.duration)
    });
    
    // Start the timer
    timerRef.current.start();
  }, [userId]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      timerRef.current.destroy();
      timerRef.current = null;
    }
    
    setTimerState({
      remainingTime: 0,
      progress: 0,
      isRunning: false,
      isPaused: false,
      state: 'idle',
      formattedTime: '00:00',
      difficultyQuote: ''
    });
  }, []);

  // Initialize timer from active session
  useEffect(() => {
    if (activeSession && !timerRef.current) {
      // Check if there's stored timer data for recovery
      const storedTimer = timerManager.getStoredTimerData(activeSession.id);
      if (storedTimer && (storedTimer.state === 'running' || storedTimer.state === 'paused')) {
        console.log('[useSessions] Recovering active session timer');
        startTimer(activeSession);
      }
    } else if (!activeSession && timerRef.current) {
      // No active session but timer running - cleanup
      stopTimer();
    }
  }, [activeSession, startTimer, stopTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        timerRef.current.destroy();
      }
    };
  }, []);

  // Action wrappers
  const handleStartSession = useCallback(async (data: Omit<SessionCreationData, 'userId'>) => {
    await startSessionMutation.mutateAsync({ ...data, userId });
  }, [startSessionMutation, userId]);

  const handleCompleteSession = useCallback(async (mindset: SessionMindset) => {
    if (!activeSession) {
      toast.error('No active session to complete');
      return;
    }
    
    await completeSessionMutation.mutateAsync({
      sessionId: activeSession.id,
      userId,
      mindset
    });
  }, [completeSessionMutation, activeSession, userId]);

  const handleInterruptSession = useCallback(async () => {
    if (!activeSession) {
      toast.error('No active session to interrupt');
      return;
    }
    
    await interruptSessionMutation.mutateAsync(activeSession.id);
  }, [interruptSessionMutation, activeSession]);

  const handleSetDailyCommitment = useCallback(async (targetSessions: number) => {
    await setDailyCommitmentMutation.mutateAsync(targetSessions);
  }, [setDailyCommitmentMutation]);

  return {
    // Data
    todaySessions,
    activeSession: activeSession || null,
    todayProgress: todayProgress || null,
    
    // Loading states
    isLoadingTodaySessions,
    isLoadingActiveSession,
    isLoadingProgress,
    
    // Timer state
    timerState,
    
    // Actions
    startSession: handleStartSession,
    completeSession: handleCompleteSession,
    interruptSession: handleInterruptSession,
    setDailyCommitment: handleSetDailyCommitment,
    
    // Utilities
    getDifficultyQuote: sessionTimerUtils.getDifficultyQuote,
    formatTime: sessionTimerUtils.formatTime,
    
    // Refetch functions
    refetchTodaySessions,
    refetchActiveSession,
    refetchProgress
  };
}

/**
 * Simplified hook for session history
 */
export function useSessionHistory(userId: string, options: {
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
} = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.sessions.history(userId, options),
    queryFn: () => sessionsService.getSessionHistory(userId, options),
    staleTime: 300000, // 5 minutes
    enabled: !!userId
  });
}

/**
 * Hook for daily commitment management
 */
export function useDailyCommitment(userId: string, date?: string) {
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: QUERY_KEYS.sessions.commitment(userId, targetDate),
    queryFn: () => sessionsService.getDailyCommitment(userId, targetDate),
    staleTime: 300000, // 5 minutes
    enabled: !!userId
  });
}