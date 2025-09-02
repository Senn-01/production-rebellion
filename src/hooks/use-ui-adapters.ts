/**
 * UI Adapter Hooks
 * 
 * Handles mapping between UI terminology and database schema.
 * Database is source of truth - UI adapts to DB field values.
 */

import type { Database } from '@/types/database';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

// UI-friendly labels for database enums
export const PRIORITY_LABELS = {
  must: 'Must-Do (Critical)',
  should: 'Should-Do (Important)', 
  nice: 'Nice-to-Have (Flexible)'
} as const;

export const STATUS_LABELS = {
  active: 'Focus (Currently Working)',
  inactive: 'Visible (Not Current Focus)',
  completed: 'Completed',
  abandoned: 'Abandoned'
} as const;

export const CONFIDENCE_LABELS = {
  very_high: 'Very High (Almost Certain)',
  high: 'High (Pretty Sure)',
  medium: 'Medium (Gut Feel)',
  low: 'Low (Leap of Faith)',
  very_low: 'Very Low (Total Guess)'
} as const;

export const CATEGORY_LABELS = {
  work: 'Work (Career & Income)',
  learn: 'Learn (Skills & Knowledge)',
  build: 'Build (Creating & Side Projects)',
  manage: 'Manage (Health & Relationships)'
} as const;

export const WILLPOWER_LABELS = {
  high: 'Piece of Cake 🔥',
  medium: 'Caffeinated ☕',
  low: 'Don\'t Talk To Me 🥱'
} as const;

export const MINDSET_LABELS = {
  excellent: 'Shaolin (Excellent Focus)',
  good: 'Getting There (Good Progress)',
  challenging: 'What The Heck Is The Zone? (Challenging)'
} as const;

/**
 * Project UI Adapter Hook
 */
export function useProjectAdapter() {
  return {
    // Get user-friendly label for priority
    getPriorityLabel: (priority: Database['public']['Enums']['project_priority']) => {
      return PRIORITY_LABELS[priority] || priority;
    },

    // Get user-friendly label for status  
    getStatusLabel: (status: Database['public']['Enums']['project_status']) => {
      return STATUS_LABELS[status] || status;
    },

    // Get user-friendly label for confidence
    getConfidenceLabel: (confidence: Database['public']['Enums']['project_confidence']) => {
      return CONFIDENCE_LABELS[confidence] || confidence;
    },

    // Get user-friendly label for category
    getCategoryLabel: (category: Database['public']['Enums']['project_category']) => {
      return CATEGORY_LABELS[category] || category;
    },

    // Convert UI form data to database insert format
    uiToDbInsert: (formData: any): Partial<ProjectInsert> => {
      return {
        name: formData.name,
        cost: parseInt(formData.cost),
        benefit: parseInt(formData.benefit),
        priority: formData.priority, // Already uses DB values: 'must'|'should'|'nice'
        category: formData.category, // Already uses DB values: 'work'|'learn'|'build'|'manage'
        status: formData.status || 'active', // Default to active
        confidence: formData.confidence, // Already uses DB values
        description: formData.description || null,
        due_date: formData.dueDate || null,
        tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()) : null
      };
    },

    // Convert database project to UI display format
    dbToUiDisplay: (project: Project) => {
      return {
        ...project,
        priorityLabel: PRIORITY_LABELS[project.priority],
        statusLabel: STATUS_LABELS[project.status],
        confidenceLabel: CONFIDENCE_LABELS[project.confidence],
        categoryLabel: CATEGORY_LABELS[project.category],
        tagsString: project.tags?.join(', ') || ''
      };
    }
  };
}

/**
 * Session UI Adapter Hook
 */
export function useSessionAdapter() {
  return {
    // Get user-friendly label for willpower
    getWillpowerLabel: (willpower: Database['public']['Enums']['session_willpower']) => {
      return WILLPOWER_LABELS[willpower] || willpower;
    },

    // Get user-friendly label for mindset
    getMindsetLabel: (mindset: Database['public']['Enums']['session_mindset']) => {
      return MINDSET_LABELS[mindset] || mindset;
    },

    // Get willpower options for UI selection
    getWillpowerOptions: () => [
      { value: 'high', label: WILLPOWER_LABELS.high },
      { value: 'medium', label: WILLPOWER_LABELS.medium },
      { value: 'low', label: WILLPOWER_LABELS.low }
    ],

    // Get mindset options for UI selection
    getMindsetOptions: () => [
      { value: 'excellent', label: MINDSET_LABELS.excellent },
      { value: 'good', label: MINDSET_LABELS.good },
      { value: 'challenging', label: MINDSET_LABELS.challenging }
    ]
  };
}

/**
 * Form Options Generator
 * Provides dropdown/select options for forms using database enum values
 */
export function useFormOptions() {
  return {
    priorityOptions: [
      { value: 'must', label: PRIORITY_LABELS.must },
      { value: 'should', label: PRIORITY_LABELS.should },
      { value: 'nice', label: PRIORITY_LABELS.nice }
    ],

    statusOptions: [
      { value: 'active', label: STATUS_LABELS.active },
      { value: 'inactive', label: STATUS_LABELS.inactive }
    ],

    confidenceOptions: [
      { value: 'very_high', label: CONFIDENCE_LABELS.very_high },
      { value: 'high', label: CONFIDENCE_LABELS.high },
      { value: 'medium', label: CONFIDENCE_LABELS.medium },
      { value: 'low', label: CONFIDENCE_LABELS.low },
      { value: 'very_low', label: CONFIDENCE_LABELS.very_low }
    ],

    categoryOptions: [
      { value: 'work', label: CATEGORY_LABELS.work },
      { value: 'learn', label: CATEGORY_LABELS.learn },
      { value: 'build', label: CATEGORY_LABELS.build },
      { value: 'manage', label: CATEGORY_LABELS.manage }
    ]
  };
}