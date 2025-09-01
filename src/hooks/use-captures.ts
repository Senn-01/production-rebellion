/**
 * Captures Hooks - Brain Dump & Triage Workflow
 * 
 * Implements real-time capture count tracking and triage workflow
 * with optimistic updates for maximum responsiveness
 */

import { 
  useQuery, 
  useMutation, 
  useQueryClient 
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { capturesService } from '@/services/captures.service';
import { queryKeys } from '@/lib/query-keys';
import { handleApiError, getToastMessage } from '@/lib/error-handler';
import { useAuth } from '@/contexts/AuthContext';
import type { 
  CaptureWithAge,
  TriageStats,
  TriageDecision 
} from '@/services/captures.service';
import type { Database } from '@/types/database';

type Capture = Database['public']['Tables']['captures']['Row'];

/**
 * Get pending captures count for badge display
 * Updates frequently for real-time UX
 */
export function usePendingCapturesCount() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.pendingCaptures(),
    queryFn: () => capturesService.getPendingCount(user!.id),
    enabled: !!user,
    staleTime: 0, // Always fresh for real-time updates
    gcTime: 60 * 1000, // 1 minute cache
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Get all pending captures for triage workflow
 */
export function usePendingCaptures() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.capturesByStatus('pending'),
    queryFn: () => capturesService.getPendingCaptures(user!.id),
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get triage statistics for user awareness
 */
export function useTriageStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: [...queryKeys.captures(), 'stats'],
    queryFn: () => capturesService.getTriageStats(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create new capture with optimistic count update
 */
export function useCreateCapture() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (content: string) => 
      capturesService.createCapture(user!.id, content),
    
    onMutate: async (content) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.pendingCaptures() });
      await queryClient.cancelQueries({ queryKey: queryKeys.capturesByStatus('pending') });
      
      // Snapshot previous values
      const previousCount = queryClient.getQueryData<number>(queryKeys.pendingCaptures());
      const previousCaptures = queryClient.getQueryData<CaptureWithAge[]>(
        queryKeys.capturesByStatus('pending')
      );
      
      // Optimistically update count
      queryClient.setQueryData<number>(
        queryKeys.pendingCaptures(),
        (old) => (old || 0) + 1
      );
      
      // Optimistically add to pending captures list
      const optimisticCapture: CaptureWithAge = {
        id: `temp-${Date.now()}`,
        user_id: user!.id,
        content: content.trim(),
        status: 'pending',
        decision: null,
        created_at: new Date().toISOString(),
        triaged_at: null,
        age: 'Just now',
        priority: 'low'
      };
      
      queryClient.setQueryData<CaptureWithAge[]>(
        queryKeys.capturesByStatus('pending'),
        (old) => old ? [optimisticCapture, ...old] : [optimisticCapture]
      );
      
      return { previousCount, previousCaptures };
    },
    
    onError: (error, content, context) => {
      // Rollback optimistic updates
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(queryKeys.pendingCaptures(), context.previousCount);
      }
      if (context?.previousCaptures) {
        queryClient.setQueryData(queryKeys.capturesByStatus('pending'), context.previousCaptures);
      }
      
      const appError = handleApiError(error, 'createCapture');
      toast.error(getToastMessage(appError));
    },
    
    onSuccess: () => {
      // Success feedback is subtle for captures (CMD+K workflow should be fast)
      // Could trigger gentle animation or sound here
      
      // Check for first capture achievement
      // Note: This will be handled by Task 2.3 achievement system
    },
    
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.captures() });
    }
  });
}

/**
 * Process triage decision with optimistic updates
 */
export function useTriageCapture() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ 
      captureId, 
      decision, 
      additionalData 
    }: { 
      captureId: string; 
      decision: TriageDecision;
      additionalData?: {
        projectData?: Record<string, unknown>;
        routingTarget?: string;
      };
    }) => capturesService.triageCapture(captureId, user!.id, decision, additionalData),
    
    onMutate: async ({ captureId, decision }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.pendingCaptures() });
      await queryClient.cancelQueries({ queryKey: queryKeys.capturesByStatus('pending') });
      
      // Snapshot previous values
      const previousCount = queryClient.getQueryData<number>(queryKeys.pendingCaptures());
      const previousCaptures = queryClient.getQueryData<CaptureWithAge[]>(
        queryKeys.capturesByStatus('pending')
      );
      
      // Optimistically update count (decrease by 1)
      queryClient.setQueryData<number>(
        queryKeys.pendingCaptures(),
        (old) => Math.max(0, (old || 1) - 1)
      );
      
      // Optimistically remove from pending list
      queryClient.setQueryData<CaptureWithAge[]>(
        queryKeys.capturesByStatus('pending'),
        (old) => old?.filter(capture => capture.id !== captureId)
      );
      
      return { previousCount, previousCaptures, captureId, decision };
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic updates
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(queryKeys.pendingCaptures(), context.previousCount);
      }
      if (context?.previousCaptures) {
        queryClient.setQueryData(queryKeys.capturesByStatus('pending'), context.previousCaptures);
      }
      
      const appError = handleApiError(error, 'triageCapture');
      toast.error(getToastMessage(appError));
    },
    
    onSuccess: (_, { decision }) => {
      // Decision-specific feedback
      const decisionMessages = {
        project: 'Capture converted to project!',
        parking_lot: 'Moved to parking lot for later',
        doing_now: 'Handling immediately - capture cleared',
        routing: 'Routed to external tool',
        deleted: 'Capture deleted'
      };
      
      toast.success(decisionMessages[decision] || 'Triage decision processed');
    },
    
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.captures() });
      queryClient.invalidateQueries({ queryKey: queryKeys.parkingLot() });
    }
  });
}

/**
 * Batch triage for clearing large backlogs
 */
export function useBatchTriage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (decisions: Array<{ captureId: string; decision: TriageDecision }>) => 
      capturesService.batchTriage(user!.id, decisions),
    
    onMutate: async (decisions) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.pendingCaptures() });
      await queryClient.cancelQueries({ queryKey: queryKeys.capturesByStatus('pending') });
      
      // Snapshot previous values
      const previousCount = queryClient.getQueryData<number>(queryKeys.pendingCaptures());
      const previousCaptures = queryClient.getQueryData<CaptureWithAge[]>(
        queryKeys.capturesByStatus('pending')
      );
      
      // Optimistically update count
      queryClient.setQueryData<number>(
        queryKeys.pendingCaptures(),
        (old) => Math.max(0, (old || 0) - decisions.length)
      );
      
      // Optimistically remove processed captures
      const processedIds = decisions.map(d => d.captureId);
      queryClient.setQueryData<CaptureWithAge[]>(
        queryKeys.capturesByStatus('pending'),
        (old) => old?.filter(capture => !processedIds.includes(capture.id))
      );
      
      return { previousCount, previousCaptures };
    },
    
    onError: (error, decisions, context) => {
      // Rollback optimistic updates
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(queryKeys.pendingCaptures(), context.previousCount);
      }
      if (context?.previousCaptures) {
        queryClient.setQueryData(queryKeys.capturesByStatus('pending'), context.previousCaptures);
      }
      
      const appError = handleApiError(error, 'batchTriage');
      toast.error(getToastMessage(appError));
    },
    
    onSuccess: ({ processed, errors }) => {
      if (errors.length > 0) {
        toast.warning(`Processed ${processed} captures, ${errors.length} errors occurred`);
      } else {
        toast.success(`Batch triage complete: ${processed} captures processed`);
      }
    },
    
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.captures() });
    }
  });
}

/**
 * Update capture content (before triage only)
 */
export function useUpdateCapture() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ captureId, content }: { captureId: string; content: string }) => 
      capturesService.updateCapture(captureId, user!.id, content),
    
    onMutate: async ({ captureId, content }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.capturesByStatus('pending') });
      
      const previousCaptures = queryClient.getQueryData<CaptureWithAge[]>(
        queryKeys.capturesByStatus('pending')
      );
      
      // Optimistically update content
      queryClient.setQueryData<CaptureWithAge[]>(
        queryKeys.capturesByStatus('pending'),
        (old) => old?.map(capture => 
          capture.id === captureId 
            ? { ...capture, content: content.trim() }
            : capture
        )
      );
      
      return { previousCaptures };
    },
    
    onError: (error, variables, context) => {
      if (context?.previousCaptures) {
        queryClient.setQueryData(queryKeys.capturesByStatus('pending'), context.previousCaptures);
      }
      
      const appError = handleApiError(error, 'updateCapture');
      toast.error(getToastMessage(appError));
    },
    
    onSuccess: () => {
      toast.success('Capture updated');
    }
  });
}

/**
 * Delete capture permanently (emergency use)
 */
export function useDeleteCapture() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (captureId: string) => 
      capturesService.deleteCapture(captureId, user!.id),
    
    onSuccess: () => {
      // Invalidate all capture-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.captures() });
      toast.success('Capture permanently deleted');
    },
    
    onError: (error) => {
      const appError = handleApiError(error, 'deleteCapture');
      toast.error(getToastMessage(appError));
    }
  });
}