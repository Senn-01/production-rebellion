/**
 * Projects Service - TacticalMap Business Logic
 * 
 * Handles all project operations including:
 * - CRUD operations with coordinate collision detection
 * - Boss battle mechanics with atomic operations
 * - Cost/benefit positioning and visual properties
 * - Project completion with accuracy tracking and XP calculation
 */

import { supabase } from '@/lib/supabase/client';
import { 
  handleApiError, 
  createCoordinateCollisionError,
  AppErrorCode 
} from '@/lib/error-handler';
import { 
  getUserTimezone,
  getMonday,
  getDaysUntilDue,
  logDatabaseQuery,
  handleSupabaseResponse
} from '@/lib/supabase/utils';
import type { Database } from '@/types/database';

// Type definitions
type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export interface ProjectWithComputedFields extends Project {
  daysUntilDue: number | null;
  isApproachingDeadline: boolean;
  uiPosition?: { x: number; y: number };
  visualProperties?: ProjectVisualProperties;
}

export interface ProjectVisualProperties {
  border: string;
  pattern: string;
  opacity: number;
  pulse: boolean;
  bossBattle: boolean;
}

export interface ProjectCompletionResult {
  project: Project;
  xpEarned: number;
}

/**
 * Core Projects Service
 */
export const projectsService = {
  /**
   * Get all active projects for user with computed UI fields
   */
  async getActiveProjects(userId: string): Promise<ProjectWithComputedFields[]> {
    logDatabaseQuery('projects', 'getActiveProjects', { userId });
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'inactive'])
      .order('created_at', { ascending: false });

    if (error) {
      throw handleApiError(error, 'getActiveProjects');
    }

    // Add computed fields for UI
    const now = new Date();
    return data.map(project => ({
      ...project,
      daysUntilDue: getDaysUntilDue(project.due_date),
      isApproachingDeadline: project.due_date 
        ? getDaysUntilDue(project.due_date) !== null && getDaysUntilDue(project.due_date)! <= 3
        : false,
      uiPosition: calculateProjectPosition(project),
      visualProperties: getProjectVisualProperties(project)
    }));
  },

  /**
   * Get single project by ID
   */
  async getProject(projectId: string, userId: string): Promise<ProjectWithComputedFields> {
    logDatabaseQuery('projects', 'getProject', { projectId, userId });
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw handleApiError(error, 'getProject');
    }

    return {
      ...data,
      daysUntilDue: getDaysUntilDue(data.due_date),
      isApproachingDeadline: data.due_date 
        ? getDaysUntilDue(data.due_date) !== null && getDaysUntilDue(data.due_date)! <= 3
        : false,
      uiPosition: calculateProjectPosition(data),
      visualProperties: getProjectVisualProperties(data)
    };
  },

  /**
   * Check if coordinate position is available
   * Returns false if position is occupied by another active project
   */
  async checkCoordinateAvailability(
    userId: string, 
    cost: number, 
    benefit: number,
    excludeProjectId?: string
  ): Promise<boolean> {
    logDatabaseQuery('projects', 'checkCoordinateAvailability', { userId, cost, benefit, excludeProjectId });
    
    let query = supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId)
      .eq('cost', cost)
      .eq('benefit', benefit)
      .in('status', ['active', 'inactive']);

    if (excludeProjectId) {
      query = query.neq('id', excludeProjectId);
    }

    const { data, error } = await query.single();

    // PGRST116 = no rows found, which means coordinate is available
    if (error && error.code !== 'PGRST116') {
      throw handleApiError(error, 'checkCoordinateAvailability');
    }

    return !data; // Available if no data returned
  },

  /**
   * Create new project with coordinate collision detection
   */
  async createProject(project: ProjectInsert): Promise<Project> {
    logDatabaseQuery('projects', 'createProject', { 
      name: project.name, 
      cost: project.cost, 
      benefit: project.benefit 
    });

    // Check coordinate availability first
    if (project.cost && project.benefit) {
      const isAvailable = await this.checkCoordinateAvailability(
        project.user_id!,
        project.cost,
        project.benefit
      );

      if (!isAvailable) {
        throw createCoordinateCollisionError(project.cost, project.benefit);
      }
    }

    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) {
      // Handle constraint violations that might slip through
      if (error.code === '23505') {
        throw createCoordinateCollisionError(project.cost || 0, project.benefit || 0);
      }
      throw handleApiError(error, 'createProject');
    }

    return data;
  },

  /**
   * Update project with coordinate collision checking
   */
  async updateProject(
    projectId: string, 
    userId: string, 
    updates: ProjectUpdate
  ): Promise<Project> {
    logDatabaseQuery('projects', 'updateProject', { projectId, updates });

    // If updating coordinates, check availability
    if (updates.cost !== undefined && updates.benefit !== undefined) {
      const isAvailable = await this.checkCoordinateAvailability(
        userId,
        updates.cost,
        updates.benefit,
        projectId // Exclude current project from collision check
      );

      if (!isAvailable) {
        throw createCoordinateCollisionError(updates.cost, updates.benefit);
      }
    }

    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw handleApiError(error, 'updateProject');
    }

    return data;
  },

  /**
   * Complete project with accuracy assessment and XP calculation
   */
  async completeProject(
    projectId: string,
    userId: string,
    accuracy: '1' | '2' | '3' | '4' | '5'  // 1=much harder, 3=accurate, 5=much easier
  ): Promise<ProjectCompletionResult> {
    logDatabaseQuery('projects', 'completeProject', { projectId, accuracy });

    // First, get current project state to check boss battle status
    const { data: currentProject, error: fetchError } = await supabase
      .from('projects')
      .select('is_boss_battle')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      throw handleApiError(fetchError, 'completeProject');
    }

    // Update project as completed with correct boss battle status
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        accuracy,
        was_boss_battle: currentProject?.is_boss_battle || false
      })
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (projectError) {
      throw handleApiError(projectError, 'completeProject');
    }

    if (!project) {
      throw handleApiError(new Error('Project not found'), 'completeProject');
    }

    // Calculate XP using database RPC function
    const { data: xpEarned, error: xpError } = await supabase
      .rpc('calculate_project_xp', {
        p_cost: project.cost,
        p_benefit: project.benefit,
        p_is_boss_battle: project.was_boss_battle || false
      });

    if (xpError || xpEarned === null) {
      throw handleApiError(xpError || new Error('XP calculation failed'), 'calculateProjectXP');
    }

    // Record XP with user's timezone-aware week calculation
    const timezone = await getUserTimezone(userId);
    const weekStart = getMonday(new Date(), timezone).toISOString().split('T')[0];
    
    const { error: xpTrackingError } = await supabase
      .from('xp_tracking')
      .insert({
        user_id: userId,
        points: xpEarned,
        source_type: 'project_completion',
        source_id: projectId,
        week_start: weekStart,
        earned_at: new Date().toISOString()
      });

    if (xpTrackingError) {
      throw handleApiError(xpTrackingError, 'recordProjectXP');
    }

    return { project, xpEarned };
  },

  /**
   * Set boss battle with atomic operation
   */
  async setBossBattle(projectId: string, userId: string): Promise<void> {
    logDatabaseQuery('projects', 'setBossBattle', { projectId, userId });

    // Use RPC function for atomic operation (ensures only one boss battle)
    const { error } = await supabase
      .rpc('set_boss_battle', { 
        p_project_id: projectId,
        p_user_id: userId 
      });

    if (error) {
      throw handleApiError(error, 'setBossBattle');
    }
  },

  /**
   * Clear boss battle status
   */
  async clearBossBattle(userId: string): Promise<void> {
    logDatabaseQuery('projects', 'clearBossBattle', { userId });

    const { error } = await supabase
      .from('projects')
      .update({ is_boss_battle: false })
      .eq('user_id', userId)
      .eq('is_boss_battle', true);

    if (error) {
      throw handleApiError(error, 'clearBossBattle');
    }
  },

  /**
   * Abandon project (soft delete)
   */
  async abandonProject(projectId: string, userId: string): Promise<void> {
    logDatabaseQuery('projects', 'abandonProject', { projectId });

    const { error } = await supabase
      .from('projects')
      .update({ status: 'abandoned' })
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) {
      throw handleApiError(error, 'abandonProject');
    }
  },

  /**
   * Permanently delete project
   */
  async deleteProject(projectId: string, userId: string): Promise<void> {
    logDatabaseQuery('projects', 'deleteProject', { projectId });

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) {
      throw handleApiError(error, 'deleteProject');
    }
  }
};

/**
 * UI Helper: Calculate project position on cost/benefit matrix
 * Returns percentage coordinates for CSS positioning
 */
export function calculateProjectPosition(
  project: { cost: number; benefit: number }
): { x: number; y: number } {
  // Map 1-10 scale to 10%-90% (avoid edges for better visual spacing)
  const xPercent = 10 + ((project.cost - 1) / 9) * 80;     // Cost: left→right
  const yPercent = 10 + ((project.benefit - 1) / 9) * 80;  // Benefit: for UI positioning
  
  return {
    x: xPercent,  // 10-90%: low cost (left) → high cost (right)
    y: yPercent   // 10-90%: will be inverted in UI for low benefit (bottom) → high benefit (top)
  };
}

/**
 * UI Helper: Get visual properties for project based on priority and category
 */
export function getProjectVisualProperties(project: Project): ProjectVisualProperties {
  // Priority determines border style (from brief.md specifications)
  const borderStyles = {
    must: '3px solid gold',      // Gold border for must-do items
    should: '3px solid black',   // Black border for should-do items
    nice: '3px solid #666'       // Grey border for nice-to-have items
  };
  
  // Category determines interior pattern (from brief.md specifications)
  const patterns = {
    work: 'horizontal-lines',    // Horizontal lines for work projects
    learn: 'vertical-lines',     // Vertical lines for learning projects
    build: 'diagonal-lines',     // Diagonal lines for building projects
    manage: 'solid-fill'         // Solid fill for management projects
  };
  
  return {
    border: borderStyles[project.priority] || borderStyles.nice,
    pattern: patterns[project.category] || patterns.work,
    opacity: project.status === 'inactive' ? 0.6 : 1.0,
    pulse: project.due_date ? getDaysUntilDue(project.due_date) !== null && getDaysUntilDue(project.due_date)! <= 3 : false,
    bossBattle: project.is_boss_battle || false
  };
}

/**
 * UI Helper: Generate CSS classes for project visual properties
 */
export function getProjectCSSClasses(project: Project): string {
  const properties = getProjectVisualProperties(project);
  const classes = ['project-node'];
  
  // Add pattern class
  classes.push(`pattern-${properties.pattern}`);
  
  // Add priority class
  classes.push(`priority-${project.priority}`);
  
  // Add category class
  classes.push(`category-${project.category}`);
  
  // Add state classes
  if (project.status === 'inactive') {
    classes.push('inactive');
  }
  
  if (properties.pulse) {
    classes.push('approaching-deadline');
  }
  
  if (properties.bossBattle) {
    classes.push('boss-battle');
  }
  
  return classes.join(' ');
}