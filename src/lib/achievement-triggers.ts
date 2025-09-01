/**
 * Achievement Trigger Mapping System
 * 
 * Maps application events to relevant achievement checks to optimize
 * database queries and provide intelligent achievement checking
 */

import type { AchievementTriggerEvent } from '@/services/achievements.service';

/**
 * Achievement keys from the database
 */
export const ACHIEVEMENT_KEYS = {
  PATHS_ARE_MADE_BY_WALKING: 'paths_are_made_by_walking',
  FIRST_BLOOD: 'first_blood',
  DOUBLE_DIGITS: 'double_digits',
  GIANT_SLAYER: 'giant_slayer',
  DARK_SOULS_MODE: 'dark_souls_mode',
  FRAME_PERFECT: 'frame_perfect',
  DEDICATED: 'dedicated',
  THE_GRIND: 'the_grind',
  THE_ESTIMATOR: 'the_estimator',
  NO_BRAINER_KING: 'no_brainer_king',
} as const;

/**
 * Maps trigger events to the achievements that should be checked
 * This enables smart filtering to avoid unnecessary database queries
 */
export const ACHIEVEMENT_TRIGGERS: Record<AchievementTriggerEvent, string[]> = {
  capture_created: [
    ACHIEVEMENT_KEYS.PATHS_ARE_MADE_BY_WALKING, // First capture
  ],
  
  project_completed: [
    ACHIEVEMENT_KEYS.FIRST_BLOOD,      // First project
    ACHIEVEMENT_KEYS.DOUBLE_DIGITS,    // 10 projects
    ACHIEVEMENT_KEYS.GIANT_SLAYER,     // Cost 10 project
    ACHIEVEMENT_KEYS.DARK_SOULS_MODE,  // Low confidence boss battle
    ACHIEVEMENT_KEYS.FRAME_PERFECT,    // On due date
    ACHIEVEMENT_KEYS.THE_ESTIMATOR,    // Accurate estimates
    ACHIEVEMENT_KEYS.NO_BRAINER_KING,  // Low cost, high benefit
  ],
  
  session_completed: [
    ACHIEVEMENT_KEYS.THE_GRIND,        // 600+ minutes in one day
    ACHIEVEMENT_KEYS.DEDICATED,        // Week streak (also check on boundary)
  ],
  
  week_boundary: [
    ACHIEVEMENT_KEYS.DEDICATED,        // 4-week streak
  ],
  
  manual_check: [
    // Check all achievements when manually triggered
    ...Object.values(ACHIEVEMENT_KEYS),
  ],
};

/**
 * Achievement metadata for UI display and validation
 */
export const ACHIEVEMENT_METADATA = {
  [ACHIEVEMENT_KEYS.PATHS_ARE_MADE_BY_WALKING]: {
    icon: '🚶',
    category: 'starter',
    difficulty: 'easy',
    rarity: 'common',
  },
  [ACHIEVEMENT_KEYS.FIRST_BLOOD]: {
    icon: '🩸',
    category: 'projects',
    difficulty: 'easy',
    rarity: 'common',
  },
  [ACHIEVEMENT_KEYS.DOUBLE_DIGITS]: {
    icon: '🔢',
    category: 'projects',
    difficulty: 'medium',
    rarity: 'uncommon',
  },
  [ACHIEVEMENT_KEYS.GIANT_SLAYER]: {
    icon: '⚔️',
    category: 'projects',
    difficulty: 'hard',
    rarity: 'rare',
  },
  [ACHIEVEMENT_KEYS.DARK_SOULS_MODE]: {
    icon: '💀',
    category: 'projects',
    difficulty: 'extreme',
    rarity: 'legendary',
  },
  [ACHIEVEMENT_KEYS.FRAME_PERFECT]: {
    icon: '⏱️',
    category: 'timing',
    difficulty: 'medium',
    rarity: 'uncommon',
  },
  [ACHIEVEMENT_KEYS.DEDICATED]: {
    icon: '🔥',
    category: 'consistency',
    difficulty: 'medium',
    rarity: 'uncommon',
  },
  [ACHIEVEMENT_KEYS.THE_GRIND]: {
    icon: '💪',
    category: 'sessions',
    difficulty: 'hard',
    rarity: 'rare',
  },
  [ACHIEVEMENT_KEYS.THE_ESTIMATOR]: {
    icon: '📊',
    category: 'accuracy',
    difficulty: 'medium',
    rarity: 'uncommon',
  },
  [ACHIEVEMENT_KEYS.NO_BRAINER_KING]: {
    icon: '👑',
    category: 'strategy',
    difficulty: 'medium',
    rarity: 'uncommon',
  },
};

/**
 * Helper function to determine if an achievement should be checked
 * based on the trigger event
 */
export function shouldCheckAchievement(
  event: AchievementTriggerEvent,
  achievementKey: string
): boolean {
  const relevantAchievements = ACHIEVEMENT_TRIGGERS[event] || [];
  return relevantAchievements.includes(achievementKey);
}

/**
 * Get all achievements that should be checked for a given event
 */
export function getRelevantAchievements(
  event: AchievementTriggerEvent
): string[] {
  return ACHIEVEMENT_TRIGGERS[event] || [];
}

/**
 * Batch multiple events and return unique achievements to check
 */
export function batchAchievementChecks(
  events: AchievementTriggerEvent[]
): string[] {
  const achievementsToCheck = new Set<string>();
  
  events.forEach(event => {
    const relevant = getRelevantAchievements(event);
    relevant.forEach(achievement => achievementsToCheck.add(achievement));
  });
  
  return Array.from(achievementsToCheck);
}

/**
 * Get achievement rarity percentage (for UI display)
 */
export function getAchievementRarityPercentage(rarity: string): number {
  const rarityMap: Record<string, number> = {
    common: 75,
    uncommon: 50,
    rare: 25,
    legendary: 10,
  };
  
  return rarityMap[rarity] || 100;
}

/**
 * Sort achievements by recommended display order
 */
export function sortAchievementsByPriority(
  achievements: Array<{ key: string; sort_order: number }>
): Array<{ key: string; sort_order: number }> {
  return achievements.sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * Check if an achievement event should be debounced
 * Some events (like session_completed) benefit from batching
 */
export function shouldDebounceEvent(event: AchievementTriggerEvent): boolean {
  const debouncedEvents: AchievementTriggerEvent[] = [
    'session_completed',
    'project_completed',
  ];
  
  return debouncedEvents.includes(event);
}

/**
 * Get debounce delay for an event (in milliseconds)
 */
export function getDebounceDelay(event: AchievementTriggerEvent): number {
  const delayMap: Partial<Record<AchievementTriggerEvent, number>> = {
    session_completed: 1000,   // 1 second
    project_completed: 500,    // 0.5 seconds
    capture_created: 200,      // 0.2 seconds
  };
  
  return delayMap[event] || 0;
}