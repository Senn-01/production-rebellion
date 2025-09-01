/**
 * Solo-dev humor error handling for Production Rebellion
 * 
 * Pattern: Acknowledgment + Explanation + Workaround + Light humor
 * Philosophy: Be honest about limitations while maintaining user confidence
 */

export enum AppErrorCode {
  // Business logic errors
  COORDINATE_TAKEN = 'COORDINATE_TAKEN',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  ALREADY_COMPLETED = 'ALREADY_COMPLETED',
  NO_ACTIVE_PROJECTS = 'NO_ACTIVE_PROJECTS',
  INVALID_XP_CALCULATION = 'INVALID_XP_CALCULATION',
  BOSS_BATTLE_CONFLICT = 'BOSS_BATTLE_CONFLICT',
  
  // System errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Development errors
  FEATURE_NOT_IMPLEMENTED = 'FEATURE_NOT_IMPLEMENTED',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}

export interface AppError {
  code: AppErrorCode;
  message: string;
  suggestion: string;
  retryable?: boolean;
  technical?: string; // Technical details for developers
}

/**
 * Solo-dev humor error messages
 * Each follows the pattern: Acknowledge + Explain + Suggest + Humor
 */
export const errorMessages: Record<AppErrorCode, AppError> = {
  [AppErrorCode.COORDINATE_TAKEN]: {
    code: AppErrorCode.COORDINATE_TAKEN,
    message: "That spot's taken. My bad - prioritized achievements over spatial algorithms.",
    suggestion: "Try adjusting the cost or benefit by 1. The map will thank you.",
    retryable: true,
    technical: "Unique constraint violation on (user_id, cost, benefit)"
  },
  
  [AppErrorCode.SESSION_NOT_FOUND]: {
    code: AppErrorCode.SESSION_NOT_FOUND,
    message: "Can't find that session. Did you accidentally the whole thing?",
    suggestion: "Start a new session from the DeepFocus page. Fresh start, fresh XP.",
    retryable: false,
    technical: "Session ID not found or belongs to different user"
  },
  
  [AppErrorCode.ALREADY_COMPLETED]: {
    code: AppErrorCode.ALREADY_COMPLETED,
    message: "Already done! No double-dipping on XP. Nice try though.",
    suggestion: "Pick another project to conquer. The map awaits your brilliance.",
    retryable: false,
    technical: "Attempted to complete project/session with completed=true"
  },
  
  [AppErrorCode.NO_ACTIVE_PROJECTS]: {
    code: AppErrorCode.NO_ACTIVE_PROJECTS,
    message: "No projects to work on. Time to populate that strategic map!",
    suggestion: "Add a project from the TacticalMap. Cost vs benefit analysis awaits.",
    retryable: false,
    technical: "User has no projects with status='active'"
  },
  
  [AppErrorCode.INVALID_XP_CALCULATION]: {
    code: AppErrorCode.INVALID_XP_CALCULATION,
    message: "XP calculation went sideways. Math is hard sometimes.",
    suggestion: "This shouldn't happen. If it does, the universe is broken. Contact support.",
    retryable: true,
    technical: "XP formula returned invalid result or database RPC failed"
  },
  
  [AppErrorCode.BOSS_BATTLE_CONFLICT]: {
    code: AppErrorCode.BOSS_BATTLE_CONFLICT,
    message: "Boss battle conflict detected. One boss at a time, hero.",
    suggestion: "Complete your current boss battle or switch to a different one.",
    retryable: true,
    technical: "Concurrent boss battle modification detected in set_boss_battle RPC"
  },
  
  [AppErrorCode.NETWORK_ERROR]: {
    code: AppErrorCode.NETWORK_ERROR,
    message: "Connection failed. Internet doing internet things.",
    suggestion: "Check your connection and try again. Or maybe try turning it off and on again?",
    retryable: true,
    technical: "Network request failed or timed out"
  },
  
  [AppErrorCode.AUTH_REQUIRED]: {
    code: AppErrorCode.AUTH_REQUIRED,
    message: "You need to be logged in for that strategic move.",
    suggestion: "Sign in to access your command center. Your projects are waiting.",
    retryable: false,
    technical: "Authentication token invalid or expired"
  },
  
  [AppErrorCode.DATABASE_ERROR]: {
    code: AppErrorCode.DATABASE_ERROR,
    message: "Database hiccup detected. Even PostgreSQL has bad days.",
    suggestion: "Try again in a moment. If it persists, I definitely broke something.",
    retryable: true,
    technical: "Supabase operation returned unexpected error"
  },
  
  [AppErrorCode.RATE_LIMIT_EXCEEDED]: {
    code: AppErrorCode.RATE_LIMIT_EXCEEDED,
    message: "Whoa there, speedy! Rate limit exceeded.",
    suggestion: "Take a breath, then try again. Quality over quantity, always.",
    retryable: true,
    technical: "Too many requests to Supabase API"
  },
  
  [AppErrorCode.VALIDATION_ERROR]: {
    code: AppErrorCode.VALIDATION_ERROR,
    message: "Input validation failed. Your data and my schema had a disagreement.",
    suggestion: "Check your input and try again. Forms can be finicky.",
    retryable: true,
    technical: "Zod schema validation or database constraint failed"
  },
  
  [AppErrorCode.FEATURE_NOT_IMPLEMENTED]: {
    code: AppErrorCode.FEATURE_NOT_IMPLEMENTED,
    message: "Feature coming soon™. Solo dev priorities in action.",
    suggestion: "Use the existing workflow for now. Future self will thank you.",
    retryable: false,
    technical: "Placeholder function called - implement before production"
  },
  
  [AppErrorCode.CONFIGURATION_ERROR]: {
    code: AppErrorCode.CONFIGURATION_ERROR,
    message: "Configuration issue detected. Environment variables having trust issues.",
    suggestion: "Check your .env.local file. Missing secrets cause mysterious failures.",
    retryable: false,
    technical: "Missing or invalid environment configuration"
  }
};

/**
 * Main error handler - converts any error into standardized AppError
 */
export function handleApiError(error: unknown, context?: string): AppError {
  // Already an AppError
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' && error.code in errorMessages) {
    return error as AppError;
  }
  
  // Check error message for known patterns
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    const message = error.message.toLowerCase();
    const errorCode = 'code' in error ? error.code : null;
    
    // Database constraint violations
    if (message.includes('duplicate key') || errorCode === '23505') {
      return errorMessages[AppErrorCode.COORDINATE_TAKEN];
    }
    
    if (message.includes('not found') || errorCode === 'PGRST116') {
      return errorMessages[AppErrorCode.SESSION_NOT_FOUND];
    }
    
    if (message.includes('already completed')) {
      return errorMessages[AppErrorCode.ALREADY_COMPLETED];
    }
    
    // Network/connection errors
    if (message.includes('fetch') || message.includes('network') || !navigator.onLine) {
      return errorMessages[AppErrorCode.NETWORK_ERROR];
    }
    
    // Authentication errors
    if (message.includes('auth') || message.includes('unauthorized') || errorCode === 'AUTH_ERROR') {
      return errorMessages[AppErrorCode.AUTH_REQUIRED];
    }
    
    // Rate limiting
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return errorMessages[AppErrorCode.RATE_LIMIT_EXCEEDED];
    }
  }
  
  // Supabase specific errors
  if (error && typeof error === 'object' && 
      (('details' in error && error.details) || ('hint' in error && error.hint))) {
    const errorMessage = 'message' in error && typeof error.message === 'string' ? error.message : 'Unknown error';
    const details = 'details' in error && typeof error.details === 'string' ? error.details : '';
    const hint = 'hint' in error && typeof error.hint === 'string' ? error.hint : '';
    
    return {
      code: AppErrorCode.DATABASE_ERROR,
      message: errorMessages[AppErrorCode.DATABASE_ERROR].message,
      suggestion: errorMessages[AppErrorCode.DATABASE_ERROR].suggestion,
      retryable: true,
      technical: `Supabase error: ${errorMessage} | Details: ${details} | Hint: ${hint}`
    };
  }
  
  // Generic fallback with context
  const contextMessage = context ? ` Context: ${context}` : '';
  const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' 
    ? error.message 
    : 'Unknown error';
  
  return {
    code: AppErrorCode.DATABASE_ERROR,
    message: "Something went wrong. Classic solo dev moment.",
    suggestion: "Try again or contact support if it persists. I probably missed an edge case.",
    retryable: true,
    technical: `Unhandled error: ${errorMessage}.${contextMessage}`
  };
}

/**
 * Create specific error for coordinate collision
 */
export function createCoordinateCollisionError(cost: number, benefit: number): AppError {
  return {
    ...errorMessages[AppErrorCode.COORDINATE_TAKEN],
    technical: `Coordinate collision at cost=${cost}, benefit=${benefit}`
  };
}

/**
 * Create specific error for missing active projects
 */
export function createNoActiveProjectsError(): AppError {
  return errorMessages[AppErrorCode.NO_ACTIVE_PROJECTS];
}

/**
 * Create specific error for XP calculation issues
 */
export function createXPCalculationError(context: string): AppError {
  return {
    ...errorMessages[AppErrorCode.INVALID_XP_CALCULATION],
    technical: `XP calculation failed: ${context}`
  };
}

/**
 * Create custom app error with specific code and message
 */
export function createAppError(
  code: AppErrorCode, 
  message: string, 
  suggestion: string, 
  technical?: Record<string, any>
): AppError {
  return {
    code,
    message,
    suggestion,
    retryable: code === AppErrorCode.VALIDATION_ERROR || code === AppErrorCode.NETWORK_ERROR,
    technical: technical ? JSON.stringify(technical) : undefined
  };
}

/**
 * Development helper - log errors with context
 */
export function logError(error: AppError, context?: string, userId?: string): void {
  const logEntry = {
    code: error.code,
    message: error.message,
    context,
    userId,
    technical: error.technical,
    timestamp: new Date().toISOString()
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.error('[Production Rebellion Error]:', logEntry);
  } else {
    // In production, send to monitoring service
    // TODO: Integrate with Sentry or similar
    console.error('[Production Error]:', {
      code: error.code,
      context,
      userId,
      timestamp: logEntry.timestamp
    });
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: AppError): boolean {
  return error.retryable === true;
}

/**
 * Get user-friendly error message for toast notifications
 */
export function getToastMessage(error: AppError): string {
  return `${error.message} ${error.suggestion}`;
}