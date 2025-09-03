/**
 * Session Timer Display - Active DeepFocus Session UI
 * 
 * Large countdown timer with project context and controls.
 * Designed for focused work with minimal distractions.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Square } from 'lucide-react';
// import { Pause, Play, AlertTriangle } from 'lucide-react'; // Reserved for pause/resume controls
// import { Button } from '@/components/ui/Button'; // May be used for timer controls
// import { Card, CardContent } from '@/components/ui/Card'; // May be used for enhanced layout

export interface SessionTimerState {
  remainingTime: number; // in seconds
  formattedTime: string;
  progress: number; // 0 to 1
  isRunning: boolean;
  isPaused: boolean;
  difficultyQuote: string;
}

export interface SessionTimerDisplayProps {
  timerState: SessionTimerState;
  sessionData: {
    projectName: string;
    duration: number; // in minutes
    willpower: string;
  };
  onInterrupt: () => void;
  onPause?: () => void;
  onResume?: () => void;
  isLoading?: boolean;
}

export const SessionTimerDisplay: React.FC<SessionTimerDisplayProps> = ({
  timerState,
  sessionData,
  onInterrupt,
  onPause: _onPause, // Reserved for pause functionality
  onResume: _onResume, // Reserved for resume functionality
  isLoading = false
}) => {
  const [pulseWarning, setPulseWarning] = useState(false);
  
  // Visual warning when <5 minutes remaining
  useEffect(() => {
    const shouldPulse = timerState.remainingTime <= 300 && timerState.remainingTime > 0;
    setPulseWarning(shouldPulse);
  }, [timerState.remainingTime]);

  // Calculate progress percentage for visual indicator
  const _progressPercentage = Math.round(timerState.progress * 100); // Reserved for progress bar
  
  // Determine timer text color based on remaining time  
  const _getTimerColor = () => { // Reserved for dynamic timer styling
    if (timerState.remainingTime <= 60) return 'text-red-600'; // Last minute
    if (timerState.remainingTime <= 300) return 'text-orange-600'; // Last 5 minutes
    return 'text-[var(--theme-text)]';
  };

  return (
    <div className="max-w-3xl mx-auto text-center" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Large Timer */}
      <div className="bg-[var(--theme-timer-background)] border-4 border-black p-12 shadow-[4px_4px_0px_#000000] mb-8">
        <div 
          className={`text-8xl font-black font-mono text-[var(--theme-text)] mb-4 ${pulseWarning ? 'urgent-pulse' : ''}`}
        >
          {timerState.formattedTime}
        </div>
        <div className="text-2xl font-black uppercase tracking-wider text-[var(--theme-accent)]">
          DIFFICULTY LEVEL: {timerState.difficultyQuote}
        </div>
      </div>

      {/* Project Info */}
      <div className="bg-white border-4 border-black p-8 shadow-[4px_4px_0px_#000000] mb-8">
        <div className="text-2xl font-black uppercase tracking-wider text-[var(--theme-accent)] mb-2">
          WORKING MINDFULLY AND MONOTASKING ON:
        </div>
        <div className="text-3xl font-black uppercase tracking-wider text-[var(--theme-text)]">
          {sessionData.projectName}
        </div>
      </div>

      {/* Interrupt Button */}
      <button
        onClick={onInterrupt}
        disabled={isLoading}
        className="bg-red-600 text-white border-4 border-black font-black uppercase tracking-wider px-8 py-4 hover:bg-red-700 transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000]"
      >
        <Square className="w-5 h-5 inline mr-3" />
        INTERRUPT SESSION
      </button>
    </div>
  );
};