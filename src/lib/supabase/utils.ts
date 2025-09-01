/**
 * Supabase utility functions for Production Rebellion
 * 
 * Handles timezone-aware calculations, date utilities, and common database operations
 * Required by all service layers for consistent data handling
 */

import { supabase } from './client';

/**
 * Get Monday of the current week in specified timezone
 * Used for XP tracking and streak calculations
 */
export function getMonday(date: Date, timezone?: string): Date {
  // If timezone provided, convert to that timezone first
  if (timezone) {
    const localDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const day = localDate.getDay();
    const diff = localDate.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(localDate.setDate(diff));
  }
  
  // Default UTC calculation
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * Generate array of last 14 days in YYYY-MM-DD format
 * Used for session heatmap visualization
 */
export function getLast14Days(): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

/**
 * Get user's timezone from profile
 * Falls back to UTC if not found
 */
export async function getUserTimezone(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('timezone')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.warn('[Utils] Failed to fetch user timezone:', error);
    return 'UTC';
  }
  
  return data?.timezone || 'UTC';
}

/**
 * Get current week start date for user (Monday in their timezone)
 * Critical for XP tracking accuracy
 */
export async function getCurrentWeekStart(userId: string): Promise<string> {
  const timezone = await getUserTimezone(userId);
  return getMonday(new Date(), timezone).toISOString().split('T')[0];
}

/**
 * Check if a date is within specified number of days from now
 * Used for deadline calculations and priority highlighting
 */
export function isWithinDays(date: Date | string, days: number): boolean {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = targetDate.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  return diffInDays >= 0 && diffInDays <= days;
}

/**
 * Format date for UI display
 * Returns relative format for recent dates, absolute for older
 */
export function formatDateForUI(date: Date | string): string {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  
  return targetDate.toLocaleDateString();
}

/**
 * Calculate days until due date
 * Returns null if no due date, negative if overdue
 */
export function getDaysUntilDue(dueDate: string | null): number | null {
  if (!dueDate) return null;
  
  const due = new Date(dueDate);
  const now = new Date();
  const diffInMs = due.getTime() - now.getTime();
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
}

/**
 * Type-safe database response helper
 * Throws descriptive errors for failed operations
 */
export function handleSupabaseResponse<T>(response: {
  data: T | null;
  error: { message?: string } | null;
}): T {
  if (response.error) {
    console.error('[Supabase Error]:', response.error);
    throw new Error(response.error.message || 'Database operation failed');
  }
  
  if (response.data === null) {
    throw new Error('No data returned from database');
  }
  
  return response.data;
}

/**
 * Batch operation helper - reduces database round trips
 * Executes multiple operations and returns results
 */
export async function batchSupabaseOperations<T>(
  operations: Array<() => Promise<T>>
): Promise<T[]> {
  try {
    return await Promise.all(operations.map(op => op()));
  } catch (error) {
    console.error('[Batch Operation Error]:', error);
    throw error;
  }
}

/**
 * Generate consistent sort key for UI ordering
 * Combines multiple fields for stable sorting
 */
export function generateSortKey(
  primary: string | number,
  secondary: string | number = '',
  tertiary: string | number = ''
): string {
  return `${primary}|${secondary}|${tertiary}`;
}

/**
 * Retry wrapper for database operations
 * Implements exponential backoff for transient failures
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        if (status >= 400 && status < 500) {
          throw error;
        }
      }
      
      // Final attempt failed
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
    }
  }
  
  throw lastError!;
}

/**
 * Development helper - log database queries in dev mode
 */
export function logDatabaseQuery(tableName: string, operation: string, params?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DB Query] ${operation} on ${tableName}`, params || '');
  }
}