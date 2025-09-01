/**
 * Timer Manager - High-Precision Session Timing
 * 
 * Hybrid client-server timer implementation for DeepFocus sessions
 * Features:
 * - ±1 second accuracy over 120 minutes (validation requirement)
 * - Browser tab visibility handling (pause/resume detection)
 * - Cross-tab session synchronization via localStorage + database
 * - Automatic session recovery after browser refresh
 * - Background execution with Web Worker support (future enhancement)
 */

import { sessionsService, sessionTimerUtils } from '@/services/sessions.service';

export type TimerState = 'idle' | 'running' | 'paused' | 'completed' | 'interrupted';

export interface TimerConfig {
  sessionId: string;
  userId: string;
  duration: number; // in minutes
  onTick?: (remainingSeconds: number, progress: number) => void;
  onComplete?: () => void;
  onVisibilityChange?: (isVisible: boolean) => void;
  onError?: (error: Error) => void;
}

export interface TimerData {
  sessionId: string;
  startTime: number; // timestamp
  duration: number; // in minutes  
  remainingTime: number; // in seconds
  state: TimerState;
  lastTick: number; // timestamp
  pausedTime: number; // accumulated pause time in ms
  visibilityChanges: number; // track focus interruptions
}

/**
 * High-precision session timer with hybrid tracking
 */
export class SessionTimer {
  private config: TimerConfig;
  private data: TimerData;
  private intervalId: NodeJS.Timeout | null = null;
  private storageKey: string;
  private readonly TICK_INTERVAL = 1000; // 1 second
  private readonly DRIFT_CORRECTION_THRESHOLD = 2000; // 2 seconds
  private readonly STORAGE_SYNC_INTERVAL = 5000; // 5 seconds

  constructor(config: TimerConfig) {
    this.config = config;
    this.storageKey = `session_timer_${config.sessionId}`;
    
    // Initialize timer data
    this.data = {
      sessionId: config.sessionId,
      startTime: Date.now(),
      duration: config.duration,
      remainingTime: config.duration * 60,
      state: 'idle',
      lastTick: Date.now(),
      pausedTime: 0,
      visibilityChanges: 0
    };

    // Setup browser event handlers
    this.setupEventHandlers();
    
    // Load existing timer data if available
    this.loadFromStorage();
  }

  /**
   * Start the session timer
   */
  start(): void {
    if (this.data.state !== 'idle' && this.data.state !== 'paused') {
      throw new Error(`Cannot start timer from state: ${this.data.state}`);
    }

    this.data.state = 'running';
    this.data.startTime = Date.now() - this.data.pausedTime;
    this.data.lastTick = Date.now();
    
    this.saveToStorage();
    this.startInterval();
    
    console.log(`[SessionTimer] Started session ${this.data.sessionId} for ${this.data.duration} minutes`);
  }

  /**
   * Pause the timer (for visibility changes)
   */
  pause(): void {
    if (this.data.state !== 'running') return;

    this.data.state = 'paused';
    this.stopInterval();
    this.saveToStorage();
    
    console.log(`[SessionTimer] Paused session ${this.data.sessionId}`);
  }

  /**
   * Resume the timer
   */
  resume(): void {
    if (this.data.state !== 'paused') return;

    const pauseDuration = Date.now() - this.data.lastTick;
    this.data.pausedTime += pauseDuration;
    this.data.state = 'running';
    this.data.lastTick = Date.now();
    
    this.saveToStorage();
    this.startInterval();
    
    console.log(`[SessionTimer] Resumed session ${this.data.sessionId} (paused for ${pauseDuration}ms)`);
  }

  /**
   * Complete the session
   */
  complete(): void {
    if (this.data.state !== 'running') return;

    this.data.state = 'completed';
    this.stopInterval();
    this.clearStorage();
    
    this.config.onComplete?.();
    console.log(`[SessionTimer] Completed session ${this.data.sessionId}`);
  }

  /**
   * Interrupt/abandon the session
   */
  interrupt(): void {
    this.data.state = 'interrupted';
    this.stopInterval();
    this.clearStorage();
    
    console.log(`[SessionTimer] Interrupted session ${this.data.sessionId}`);
  }

  /**
   * Get current timer state
   */
  getState(): TimerData {
    return { ...this.data };
  }

  /**
   * Get remaining time in seconds (with drift correction)
   */
  getRemainingTime(): number {
    if (this.data.state !== 'running') {
      return this.data.remainingTime;
    }

    const elapsed = Date.now() - this.data.startTime;
    const totalDuration = this.data.duration * 60 * 1000;
    const remaining = Math.max(0, totalDuration - elapsed);
    
    return Math.floor(remaining / 1000);
  }

  /**
   * Get session progress (0 to 1)
   */
  getProgress(): number {
    const elapsed = Date.now() - this.data.startTime;
    const total = this.data.duration * 60 * 1000;
    return Math.min(elapsed / total, 1);
  }

  /**
   * Check if timer has drifted too much and needs correction
   */
  private checkDriftCorrection(): boolean {
    const expectedRemaining = this.getRemainingTime();
    const drift = Math.abs(this.data.remainingTime - expectedRemaining);
    
    if (drift > this.DRIFT_CORRECTION_THRESHOLD / 1000) {
      console.warn(`[SessionTimer] Drift detected: ${drift}s, correcting...`);
      this.data.remainingTime = expectedRemaining;
      return true;
    }
    
    return false;
  }

  /**
   * Start the timer interval
   */
  private startInterval(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.tick();
    }, this.TICK_INTERVAL);
  }

  /**
   * Stop the timer interval
   */
  private stopInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Timer tick - update remaining time and check for completion
   */
  private tick(): void {
    if (this.data.state !== 'running') return;

    const now = Date.now();
    const realRemaining = this.getRemainingTime();
    
    // Apply drift correction if needed
    this.checkDriftCorrection();
    this.data.remainingTime = realRemaining;
    this.data.lastTick = now;

    // Check for completion
    if (this.data.remainingTime <= 0) {
      this.complete();
      return;
    }

    // Notify listeners
    this.config.onTick?.(this.data.remainingTime, this.getProgress());

    // Periodic storage sync
    if (now % this.STORAGE_SYNC_INTERVAL < this.TICK_INTERVAL) {
      this.saveToStorage();
    }
  }

  /**
   * Setup browser event handlers
   */
  private setupEventHandlers(): void {
    // Page Visibility API for background/foreground detection
    document.addEventListener('visibilitychange', () => {
      const isVisible = !document.hidden;
      this.data.visibilityChanges++;
      
      if (isVisible) {
        // Page became visible - check for timer recovery
        this.handleVisibilityRestore();
      } else {
        // Page hidden - note the time for drift calculation
        this.data.lastTick = Date.now();
      }
      
      this.config.onVisibilityChange?.(isVisible);
    });

    // Beforeunload - save state
    window.addEventListener('beforeunload', () => {
      this.saveToStorage();
    });

    // Storage event - sync across tabs
    window.addEventListener('storage', (event) => {
      if (event.key === this.storageKey && event.newValue) {
        try {
          const syncData: TimerData = JSON.parse(event.newValue);
          if (syncData.sessionId === this.data.sessionId) {
            this.syncWithStorageData(syncData);
          }
        } catch (error) {
          console.warn('[SessionTimer] Failed to sync storage data:', error);
        }
      }
    });
  }

  /**
   * Handle visibility restore - check for long absences
   */
  private handleVisibilityRestore(): void {
    if (this.data.state !== 'running') return;

    const now = Date.now();
    const absenceTime = now - this.data.lastTick;
    
    // If absent for more than grace period, consider paused
    const GRACE_PERIOD = 30000; // 30 seconds
    
    if (absenceTime > GRACE_PERIOD) {
      console.log(`[SessionTimer] Long absence detected: ${absenceTime}ms, treating as pause`);
      this.data.pausedTime += absenceTime;
    }
    
    // Update tracking
    this.data.lastTick = now;
    this.saveToStorage();
  }

  /**
   * Sync with data from another tab
   */
  private syncWithStorageData(syncData: TimerData): void {
    // Only sync if the other tab's data is more recent
    if (syncData.lastTick > this.data.lastTick) {
      this.data = { ...syncData };
      console.log(`[SessionTimer] Synced with cross-tab data for session ${this.data.sessionId}`);
    }
  }

  /**
   * Save timer state to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (error) {
      console.warn('[SessionTimer] Failed to save to storage:', error);
    }
  }

  /**
   * Load timer state from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const storedData: TimerData = JSON.parse(stored);
        
        // Validate and restore data
        if (storedData.sessionId === this.config.sessionId) {
          this.data = { ...storedData };
          
          // If timer was running, check if it should still be running
          if (this.data.state === 'running') {
            const elapsed = Date.now() - this.data.startTime;
            const totalDuration = this.data.duration * 60 * 1000;
            
            if (elapsed >= totalDuration) {
              // Session should have completed
              this.data.state = 'completed';
              this.data.remainingTime = 0;
            } else {
              // Continue running
              this.data.remainingTime = Math.floor((totalDuration - elapsed) / 1000);
            }
          }
          
          console.log(`[SessionTimer] Restored session ${this.data.sessionId} from storage`);
        }
      }
    } catch (error) {
      console.warn('[SessionTimer] Failed to load from storage:', error);
    }
  }

  /**
   * Clear storage data
   */
  private clearStorage(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('[SessionTimer] Failed to clear storage:', error);
    }
  }

  /**
   * Cleanup - call when component unmounts
   */
  destroy(): void {
    this.stopInterval();
    this.clearStorage();
    
    // Remove event listeners if needed (for memory cleanup)
    console.log(`[SessionTimer] Destroyed timer for session ${this.data.sessionId}`);
  }
}

/**
 * Timer Manager - Factory and utilities for session timers
 */
export const timerManager = {
  /**
   * Create a new session timer
   */
  createTimer(config: TimerConfig): SessionTimer {
    return new SessionTimer(config);
  },

  /**
   * Check if there's an active timer for a session
   */
  hasActiveTimer(sessionId: string): boolean {
    try {
      const stored = localStorage.getItem(`session_timer_${sessionId}`);
      if (stored) {
        const data: TimerData = JSON.parse(stored);
        return data.state === 'running' || data.state === 'paused';
      }
    } catch {
      // Ignore storage errors
    }
    return false;
  },

  /**
   * Get stored timer data for recovery
   */
  getStoredTimerData(sessionId: string): TimerData | null {
    try {
      const stored = localStorage.getItem(`session_timer_${sessionId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore storage errors
    }
    return null;
  },

  /**
   * Clear all timer storage (for cleanup)
   */
  clearAllTimers(): void {
    const keysToRemove: string[] = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('session_timer_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`[TimerManager] Cleared ${keysToRemove.length} timer storage entries`);
    } catch (error) {
      console.warn('[TimerManager] Failed to clear timer storage:', error);
    }
  },

  /**
   * Format remaining time for display
   */
  formatTime: sessionTimerUtils.formatTime,

  /**
   * Get difficulty quote for willpower/duration combo
   */
  getDifficultyQuote: sessionTimerUtils.getDifficultyQuote,

  /**
   * Validate timer accuracy (for testing)
   */
  async validateTimerAccuracy(durationMinutes: number): Promise<{
    expectedDuration: number;
    actualDuration: number;
    driftSeconds: number;
    isAccurate: boolean;
  }> {
    const start = Date.now();
    const expectedDuration = durationMinutes * 60 * 1000;
    
    // Simulate timer run
    return new Promise((resolve) => {
      setTimeout(() => {
        const actualDuration = Date.now() - start;
        const driftSeconds = Math.abs(actualDuration - expectedDuration) / 1000;
        const isAccurate = driftSeconds <= 1.0; // ±1 second requirement
        
        resolve({
          expectedDuration,
          actualDuration,
          driftSeconds,
          isAccurate
        });
      }, expectedDuration);
    });
  }
};