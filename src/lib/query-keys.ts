/**
 * Hierarchical query keys for TanStack Query v5 cache management
 * 
 * Pattern: Each level enables precise cache invalidation
 * Example: invalidate QUERY_KEYS.projects() affects all project-related queries
 *          invalidate QUERY_KEYS.project(id) affects only that specific project
 */

export const QUERY_KEYS = {
  // Root namespace
  all: ['production-rebellion'] as const,
  
  // Projects namespace
  projects: () => [...QUERY_KEYS.all, 'projects'] as const,
  project: (id: string) => [...QUERY_KEYS.projects(), id] as const,
  activeProjects: () => [...QUERY_KEYS.projects(), 'active'] as const,
  
  // Sessions namespace
  sessions: {
    all: (userId: string) => [...QUERY_KEYS.all, 'sessions', userId] as const,
    today: (userId: string) => [...QUERY_KEYS.sessions.all(userId), 'today'] as const,
    active: (userId: string) => [...QUERY_KEYS.sessions.all(userId), 'active'] as const,
    history: (userId: string, options?: Record<string, any>) => [...QUERY_KEYS.sessions.all(userId), 'history', options] as const,
    commitment: (userId: string, date: string) => [...QUERY_KEYS.sessions.all(userId), 'commitment', date] as const,
    todayProgress: (userId: string) => [...QUERY_KEYS.sessions.all(userId), 'today-progress'] as const,
  },
  
  // Captures namespace
  captures: () => [...QUERY_KEYS.all, 'captures'] as const,
  capture: (id: string) => [...QUERY_KEYS.captures(), id] as const,
  pendingCaptures: () => [...QUERY_KEYS.captures(), 'pending'] as const,
  capturesByStatus: (status: string) => [...QUERY_KEYS.captures(), 'status', status] as const,
  
  // Weekly XP namespace (legacy compatibility)
  weeklyXp: () => [...QUERY_KEYS.all, 'weekly-xp'] as const,
  
  // XP namespace  
  xp: {
    all: (userId: string) => [...QUERY_KEYS.all, 'xp', userId] as const,
    current: (userId: string) => [...QUERY_KEYS.xp.all(userId), 'current'] as const,
    currentWeek: (userId: string) => [...QUERY_KEYS.xp.all(userId), 'current-week'] as const,
    weekly: (userId: string, weekStart: string) => [...QUERY_KEYS.xp.all(userId), 'weekly', weekStart] as const,
  },
  
  // Achievements namespace
  achievements: () => [...QUERY_KEYS.all, 'achievements'] as const,
  userAchievements: () => [...QUERY_KEYS.achievements(), 'user'] as const,
  achievementDefinitions: () => [...QUERY_KEYS.achievements(), 'definitions'] as const,
  
  // Analytics namespace
  analytics: {
    all: (userId: string) => [...QUERY_KEYS.all, 'analytics', userId] as const,
    dashboard: (userId: string) => [...QUERY_KEYS.analytics.all(userId), 'dashboard'] as const,
    heroStats: (userId: string) => [...QUERY_KEYS.analytics.all(userId), 'hero-stats'] as const,
    weeklyTrend: (userId: string, weeks: number) => [...QUERY_KEYS.analytics.all(userId), 'weekly-trend', weeks] as const,
    sessionHeatmap: (userId: string, days: number) => [...QUERY_KEYS.analytics.all(userId), 'heatmap', days] as const,
    projectCompletions: (userId: string) => [...QUERY_KEYS.analytics.all(userId), 'completions'] as const,
    personalRecords: (userId: string) => [...QUERY_KEYS.analytics.all(userId), 'records'] as const,
    achievements: (userId: string) => [...QUERY_KEYS.analytics.all(userId), 'achievements'] as const,
    performanceSummary: (userId: string) => [...QUERY_KEYS.analytics.all(userId), 'performance'] as const,
  },
  
  // Parking lot namespace
  parkingLot: () => [...QUERY_KEYS.all, 'parking-lot'] as const,
} as const;

/**
 * Query key utilities for common operations
 */
export const queryKeyUtils = {
  /**
   * Invalidate all user data (useful for logout)
   */
  getUserDataKeys: (userId: string) => [
    QUERY_KEYS.projects(),
    QUERY_KEYS.sessions.all(userId), 
    QUERY_KEYS.captures(),
    QUERY_KEYS.xp.all(userId),
    QUERY_KEYS.achievements(),
    QUERY_KEYS.analytics.all(userId),
    QUERY_KEYS.parkingLot()
  ],
  
  /**
   * Invalidate keys affected by XP changes
   */
  getXPRelatedKeys: (userId: string) => [
    QUERY_KEYS.xp.all(userId),
    QUERY_KEYS.analytics.all(userId)
  ],
  
  /**
   * Invalidate keys affected by project completion
   */
  getProjectCompletionKeys: (projectId: string) => [
    QUERY_KEYS.projects(),
    QUERY_KEYS.project(projectId),
    QUERY_KEYS.weeklyXp(),
    QUERY_KEYS.achievements()
  ],
  
  /**
   * Invalidate keys affected by session completion
   */
  getSessionCompletionKeys: (userId: string) => [
    QUERY_KEYS.sessions.all(userId),
    QUERY_KEYS.xp.all(userId),
    QUERY_KEYS.analytics.all(userId),
    QUERY_KEYS.achievements()
  ],
  
  /**
   * Invalidate keys affected by capture operations
   */
  getCaptureKeys: () => [
    QUERY_KEYS.captures(),
    QUERY_KEYS.pendingCaptures()
  ]
};

// Legacy export for backwards compatibility
export const queryKeys = QUERY_KEYS;