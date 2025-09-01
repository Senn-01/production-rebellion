/**
 * Captures Service - GTD Brain Dump & Triage Workflow
 * 
 * Implements the capture-triage-decision workflow:
 * 1. Frictionless capture (CMD+K from anywhere)
 * 2. Batch triage processing (oldest first, FIFO)
 * 3. Decision routing (project, parking lot, doing now, routing, delete)
 * 4. Integration with projects and parking lot systems
 */

import { supabase } from '@/lib/supabase/client';
import { 
  handleApiError,
  createNoActiveProjectsError
} from '@/lib/error-handler';
import { logDatabaseQuery } from '@/lib/supabase/utils';
import type { Database } from '@/types/database';

// Type definitions
type Capture = Database['public']['Tables']['captures']['Row'];
type CaptureInsert = Database['public']['Tables']['captures']['Insert'];
type CaptureUpdate = Database['public']['Tables']['captures']['Update'];
type ParkingLotItem = Database['public']['Tables']['parking_lot']['Row'];

export interface CaptureWithAge extends Capture {
  age: string; // Human-readable age (e.g., "2 hours ago", "3 days ago")
  priority: 'high' | 'medium' | 'low'; // Based on age for triage ordering
}

export interface TriageStats {
  pendingCount: number;
  oldestCapture: string | null; // ISO timestamp
  averageTriageTime: number | null; // Minutes
}

export type TriageDecision = 
  | 'project'      // Create new project
  | 'parking_lot'  // Move to someday/maybe
  | 'doing_now'    // Handle immediately (removes from system)
  | 'routing'      // Route to external tool (future: Notion, Todoist, etc.)
  | 'deleted';     // Delete permanently

/**
 * Core Captures Service
 */
export const capturesService = {
  /**
   * Create new capture (brain dump)
   * Optimized for speed - minimal validation, maximum friction reduction
   */
  async createCapture(userId: string, content: string): Promise<Capture> {
    logDatabaseQuery('captures', 'createCapture', { userId, contentLength: content.length });

    // Minimal validation - just check content isn't empty
    if (!content.trim()) {
      throw handleApiError(new Error('Content cannot be empty'), 'createCapture');
    }

    const { data, error } = await supabase
      .from('captures')
      .insert({
        user_id: userId,
        content: content.trim(),
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      throw handleApiError(error, 'createCapture');
    }

    return data;
  },

  /**
   * Get all pending captures for triage (FIFO order)
   */
  async getPendingCaptures(userId: string): Promise<CaptureWithAge[]> {
    logDatabaseQuery('captures', 'getPendingCaptures', { userId });

    const { data, error } = await supabase
      .from('captures')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true }); // FIFO - oldest first

    if (error) {
      throw handleApiError(error, 'getPendingCaptures');
    }

    // Add age and priority information
    const now = new Date();
    return data.map(capture => ({
      ...capture,
      age: calculateAge(capture.created_at, now),
      priority: calculateTriagePriority(capture.created_at, now)
    }));
  },

  /**
   * Get pending captures count for badge display
   */
  async getPendingCount(userId: string): Promise<number> {
    logDatabaseQuery('captures', 'getPendingCount', { userId });

    const { count, error } = await supabase
      .from('captures')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (error) {
      throw handleApiError(error, 'getPendingCount');
    }

    return count || 0;
  },

  /**
   * Get triage statistics for user awareness
   */
  async getTriageStats(userId: string): Promise<TriageStats> {
    logDatabaseQuery('captures', 'getTriageStats', { userId });

    // Get pending count and oldest capture
    const [pendingResult, oldestResult] = await Promise.all([
      this.getPendingCount(userId),
      supabase
        .from('captures')
        .select('created_at')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(1)
        .single()
    ]);

    // Calculate average triage time from completed captures
    const { data: triageData, error: triageError } = await supabase
      .from('captures')
      .select('created_at, triaged_at')
      .eq('user_id', userId)
      .eq('status', 'triaged')
      .not('triaged_at', 'is', null)
      .order('triaged_at', { ascending: false })
      .limit(10); // Last 10 triaged items for average

    let averageTriageTime = null;
    if (triageData && triageData.length > 0) {
      const triageTimes = triageData.map(item => {
        const created = new Date(item.created_at).getTime();
        const triaged = new Date(item.triaged_at!).getTime();
        return (triaged - created) / (1000 * 60); // Minutes
      });
      averageTriageTime = triageTimes.reduce((sum, time) => sum + time, 0) / triageTimes.length;
    }

    return {
      pendingCount: pendingResult,
      oldestCapture: oldestResult.data?.created_at || null,
      averageTriageTime
    };
  },

  /**
   * Process triage decision for a capture
   */
  async triageCapture(
    captureId: string,
    userId: string,
    decision: TriageDecision,
    additionalData?: {
      projectData?: Record<string, unknown>; // For creating projects from captures
      routingTarget?: string; // For future routing integrations
    }
  ): Promise<void> {
    logDatabaseQuery('captures', 'triageCapture', { captureId, decision });

    // Update capture status first
    const { error: updateError } = await supabase
      .from('captures')
      .update({
        status: 'triaged',
        decision,
        triaged_at: new Date().toISOString()
      })
      .eq('id', captureId)
      .eq('user_id', userId);

    if (updateError) {
      throw handleApiError(updateError, 'triageCapture');
    }

    // Execute decision-specific actions
    switch (decision) {
      case 'parking_lot':
        await this.moveToParkingLot(captureId, userId);
        break;
        
      case 'project':
        // Project creation handled by calling code with projectData
        // This just marks the capture as triaged
        break;
        
      case 'doing_now':
        // Item handled immediately - no further action needed
        // Could optionally log to analytics here
        break;
        
      case 'routing':
        // Future: integrate with external tools
        // For now, just log the routing target
        if (additionalData?.routingTarget) {
          logDatabaseQuery('captures', 'routingDecision', { 
            captureId, 
            target: additionalData.routingTarget 
          });
        }
        break;
        
      case 'deleted':
        // Soft delete - already handled by status update
        break;
        
      default:
        throw handleApiError(
          new Error(`Unknown triage decision: ${decision}`),
          'triageCapture'
        );
    }
  },

  /**
   * Move capture to parking lot (someday/maybe)
   */
  async moveToParkingLot(captureId: string, userId: string): Promise<ParkingLotItem> {
    logDatabaseQuery('captures', 'moveToParkingLot', { captureId });

    // Get capture content first
    const { data: capture, error: captureError } = await supabase
      .from('captures')
      .select('content')
      .eq('id', captureId)
      .eq('user_id', userId)
      .single();

    if (captureError) {
      throw handleApiError(captureError, 'moveToParkingLot');
    }

    // Create parking lot item
    const { data: parkingItem, error: parkingError } = await supabase
      .from('parking_lot')
      .insert({
        user_id: userId,
        capture_id: captureId,
        content: capture.content,
        parked_at: new Date().toISOString()
      })
      .select()
      .single();

    if (parkingError) {
      throw handleApiError(parkingError, 'moveToParkingLot');
    }

    return parkingItem;
  },

  /**
   * Batch triage - process multiple captures efficiently
   * Useful for clearing large backlogs
   */
  async batchTriage(
    userId: string,
    decisions: Array<{ captureId: string; decision: TriageDecision }>
  ): Promise<{ processed: number; errors: string[] }> {
    logDatabaseQuery('captures', 'batchTriage', { userId, count: decisions.length });

    let processed = 0;
    const errors: string[] = [];

    for (const { captureId, decision } of decisions) {
      try {
        await this.triageCapture(captureId, userId, decision);
        processed++;
      } catch (error) {
        errors.push(`${captureId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { processed, errors };
  },

  /**
   * Get capture by ID (for editing before triage)
   */
  async getCapture(captureId: string, userId: string): Promise<Capture> {
    logDatabaseQuery('captures', 'getCapture', { captureId });

    const { data, error } = await supabase
      .from('captures')
      .select('*')
      .eq('id', captureId)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw handleApiError(error, 'getCapture');
    }

    return data;
  },

  /**
   * Update capture content (before triage only)
   */
  async updateCapture(
    captureId: string,
    userId: string,
    content: string
  ): Promise<Capture> {
    logDatabaseQuery('captures', 'updateCapture', { captureId });

    if (!content.trim()) {
      throw handleApiError(new Error('Content cannot be empty'), 'updateCapture');
    }

    const { data, error } = await supabase
      .from('captures')
      .update({ content: content.trim() })
      .eq('id', captureId)
      .eq('user_id', userId)
      .eq('status', 'pending') // Only allow updates to pending captures
      .select()
      .single();

    if (error) {
      throw handleApiError(error, 'updateCapture');
    }

    return data;
  },

  /**
   * Delete capture permanently (emergency use only)
   */
  async deleteCapture(captureId: string, userId: string): Promise<void> {
    logDatabaseQuery('captures', 'deleteCapture', { captureId });

    const { error } = await supabase
      .from('captures')
      .delete()
      .eq('id', captureId)
      .eq('user_id', userId);

    if (error) {
      throw handleApiError(error, 'deleteCapture');
    }
  }
};

/**
 * UI Helper: Calculate human-readable age for captures
 */
function calculateAge(createdAt: string, now: Date): string {
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  
  return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) === 1 ? '' : 's'} ago`;
}

/**
 * UI Helper: Calculate triage priority based on age
 */
function calculateTriagePriority(createdAt: string, now: Date): 'high' | 'medium' | 'low' {
  const created = new Date(createdAt);
  const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

  if (diffHours > 48) return 'high';    // Older than 2 days
  if (diffHours > 24) return 'medium';  // Older than 1 day
  return 'low';                         // Recent
}

/**
 * UI Helper: Get CSS classes for capture priority
 */
export function getCaptureCSSClasses(capture: CaptureWithAge): string {
  const classes = ['capture-item'];
  
  classes.push(`priority-${capture.priority}`);
  
  if (capture.priority === 'high') {
    classes.push('urgent');
  }
  
  return classes.join(' ');
}