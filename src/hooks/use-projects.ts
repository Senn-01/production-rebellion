/**
 * Projects Hooks - TanStack Query v5 Integration
 * 
 * Implements optimistic updates, cache management, and real-time synchronization
 * for all project-related operations with proper error boundaries
 */

import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  type QueryClient 
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { projectsService } from '@/services/projects.service';
import { queryKeys, queryKeyUtils } from '@/lib/query-keys';
import { handleApiError, getToastMessage } from '@/lib/error-handler';
import { useAuth } from '@/contexts/AuthContext';
import type { 
  ProjectWithComputedFields,
  ProjectCompletionResult 
} from '@/services/projects.service';
import type { Database } from '@/types/database';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

/**
 * Get all active projects with computed fields
 */
export function useProjects() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.activeProjects(),
    queryFn: () => projectsService.getActiveProjects(user!.id),
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute (for deadline accuracy)
    gcTime: 5 * 60 * 1000, // 5 minutes (TanStack Query v5 syntax)
  });
}

/**
 * Get single project by ID
 */
export function useProject(projectId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => projectsService.getProject(projectId, user!.id),
    enabled: !!user && !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Create new project with optimistic updates
 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (project: Omit<ProjectInsert, 'user_id'>) => 
      projectsService.createProject({ 
        ...project, 
        user_id: user!.id 
      }),
    
    onMutate: async (newProject) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.activeProjects() });
      
      // Snapshot previous value
      const previousProjects = queryClient.getQueryData<ProjectWithComputedFields[]>(
        queryKeys.activeProjects()
      );
      
      // Optimistically update cache
      const optimisticProject: ProjectWithComputedFields = {
        id: `temp-${Date.now()}`,
        user_id: user!.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active',
        is_boss_battle: false,
        was_boss_battle: false,
        completed_at: null,
        accuracy: null,
        due_date: null,
        description: null,
        tags: null,
        daysUntilDue: null,
        isApproachingDeadline: false,
        ...newProject,
        x: 0, // Will be calculated by database trigger
        y: 0, // Will be calculated by database trigger
      } as ProjectWithComputedFields;
      
      queryClient.setQueryData<ProjectWithComputedFields[]>(
        queryKeys.activeProjects(),
        (old) => old ? [...old, optimisticProject] : [optimisticProject]
      );
      
      return { previousProjects };
    },
    
    onError: (error, newProject, context) => {
      // Rollback optimistic update
      if (context?.previousProjects) {
        queryClient.setQueryData(queryKeys.activeProjects(), context.previousProjects);
      }
      
      const appError = handleApiError(error, 'createProject');
      toast.error(getToastMessage(appError));
    },
    
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.activeProjects() });
      
      toast.success('Project added to the strategic map!');
      
      // Trigger achievement check
      // Note: This will be handled by Task 2.3 achievement system
    },
    
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.activeProjects() });
    }
  });
}

/**
 * Update project with optimistic updates
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ 
      projectId, 
      updates 
    }: { 
      projectId: string; 
      updates: ProjectUpdate 
    }) => projectsService.updateProject(projectId, user!.id, updates),
    
    onMutate: async ({ projectId, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.activeProjects() });
      await queryClient.cancelQueries({ queryKey: queryKeys.project(projectId) });
      
      const previousProjects = queryClient.getQueryData<ProjectWithComputedFields[]>(
        queryKeys.activeProjects()
      );
      const previousProject = queryClient.getQueryData<ProjectWithComputedFields>(
        queryKeys.project(projectId)
      );
      
      // Optimistically update both caches
      queryClient.setQueryData<ProjectWithComputedFields[]>(
        queryKeys.activeProjects(),
        (old) => old?.map(project => 
          project.id === projectId 
            ? { ...project, ...updates, updated_at: new Date().toISOString() }
            : project
        )
      );
      
      if (previousProject) {
        queryClient.setQueryData<ProjectWithComputedFields>(
          queryKeys.project(projectId),
          { ...previousProject, ...updates }
        );
      }
      
      return { previousProjects, previousProject };
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic updates
      if (context?.previousProjects) {
        queryClient.setQueryData(queryKeys.activeProjects(), context.previousProjects);
      }
      if (context?.previousProject) {
        queryClient.setQueryData(queryKeys.project(variables.projectId), context.previousProject);
      }
      
      const appError = handleApiError(error, 'updateProject');
      toast.error(getToastMessage(appError));
    },
    
    onSuccess: () => {
      toast.success('Project updated successfully!');
    }
  });
}

/**
 * Complete project with XP calculation
 */
export function useCompleteProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ 
      projectId, 
      accuracy 
    }: { 
      projectId: string; 
      accuracy: '1' | '2' | '3' | '4' | '5' 
    }) => projectsService.completeProject(projectId, user!.id, accuracy),
    
    onMutate: async ({ projectId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.activeProjects() });
      
      const previousProjects = queryClient.getQueryData<ProjectWithComputedFields[]>(
        queryKeys.activeProjects()
      );
      
      // Optimistically remove project from active list
      queryClient.setQueryData<ProjectWithComputedFields[]>(
        queryKeys.activeProjects(),
        (old) => old?.filter(project => project.id !== projectId)
      );
      
      return { previousProjects };
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousProjects) {
        queryClient.setQueryData(queryKeys.activeProjects(), context.previousProjects);
      }
      
      const appError = handleApiError(error, 'completeProject');
      toast.error(getToastMessage(appError));
    },
    
    onSuccess: ({ project, xpEarned }: ProjectCompletionResult) => {
      // Invalidate related caches
      queryKeyUtils.getProjectCompletionKeys(project.id).forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      
      // Trigger XP animation via custom event
      window.dispatchEvent(new CustomEvent('xp-earned', { 
        detail: { 
          xp: xpEarned,
          source: 'project_completion',
          projectName: project.name 
        }
      }));
      
      toast.success(`Project completed! +${xpEarned.toLocaleString()} XP earned 🎉`);
    }
  });
}

/**
 * Set boss battle with atomic operation
 */
export function useSetBossBattle() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (projectId: string) => 
      projectsService.setBossBattle(projectId, user!.id),
    
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.activeProjects() });
      
      const previousProjects = queryClient.getQueryData<ProjectWithComputedFields[]>(
        queryKeys.activeProjects()
      );
      
      // Optimistically update UI - clear other boss battles, set new one
      queryClient.setQueryData<ProjectWithComputedFields[]>(
        queryKeys.activeProjects(),
        (old) => old?.map(project => ({
          ...project,
          is_boss_battle: project.id === projectId
        }))
      );
      
      return { previousProjects };
    },
    
    onError: (error, projectId, context) => {
      // Rollback optimistic update
      if (context?.previousProjects) {
        queryClient.setQueryData(queryKeys.activeProjects(), context.previousProjects);
      }
      
      const appError = handleApiError(error, 'setBossBattle');
      toast.error(getToastMessage(appError));
    },
    
    onSuccess: () => {
      toast.success('Boss battle selected! 2x XP awaits your victory 👑');
    }
  });
}

/**
 * Clear boss battle status
 */
export function useClearBossBattle() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: () => projectsService.clearBossBattle(user!.id),
    
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.activeProjects() });
      
      const previousProjects = queryClient.getQueryData<ProjectWithComputedFields[]>(
        queryKeys.activeProjects()
      );
      
      // Optimistically clear all boss battles
      queryClient.setQueryData<ProjectWithComputedFields[]>(
        queryKeys.activeProjects(),
        (old) => old?.map(project => ({ ...project, is_boss_battle: false }))
      );
      
      return { previousProjects };
    },
    
    onError: (error, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(queryKeys.activeProjects(), context.previousProjects);
      }
      
      const appError = handleApiError(error, 'clearBossBattle');
      toast.error(getToastMessage(appError));
    },
    
    onSuccess: () => {
      toast.success('Boss battle cleared. Choose your next challenge.');
    }
  });
}

/**
 * Abandon project (soft delete)
 */
export function useAbandonProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (projectId: string) => 
      projectsService.abandonProject(projectId, user!.id),
    
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.activeProjects() });
      
      const previousProjects = queryClient.getQueryData<ProjectWithComputedFields[]>(
        queryKeys.activeProjects()
      );
      
      // Optimistically remove from active list
      queryClient.setQueryData<ProjectWithComputedFields[]>(
        queryKeys.activeProjects(),
        (old) => old?.filter(project => project.id !== projectId)
      );
      
      return { previousProjects };
    },
    
    onError: (error, projectId, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(queryKeys.activeProjects(), context.previousProjects);
      }
      
      const appError = handleApiError(error, 'abandonProject');
      toast.error(getToastMessage(appError));
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activeProjects() });
      toast.success('Project abandoned. Strategic retreat acknowledged.');
    }
  });
}

/**
 * Delete project permanently
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: (projectId: string) => 
      projectsService.deleteProject(projectId, user!.id),
    
    onSuccess: (_, projectId) => {
      // Remove from all caches
      queryClient.removeQueries({ queryKey: queryKeys.project(projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.activeProjects() });
      
      toast.success('Project permanently deleted.');
    },
    
    onError: (error) => {
      const appError = handleApiError(error, 'deleteProject');
      toast.error(getToastMessage(appError));
    }
  });
}

/**
 * Utility hook for checking coordinate availability during project creation/editing
 */
export function useCheckCoordinateAvailability() {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ 
      cost, 
      benefit, 
      excludeProjectId 
    }: { 
      cost: number; 
      benefit: number; 
      excludeProjectId?: string 
    }) => projectsService.checkCoordinateAvailability(
      user!.id, 
      cost, 
      benefit, 
      excludeProjectId
    ),
    
    onError: (error) => {
      const appError = handleApiError(error, 'checkCoordinateAvailability');
      toast.error(getToastMessage(appError));
    }
  });
}