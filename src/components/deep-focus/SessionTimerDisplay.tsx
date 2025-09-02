/**
 * Session Timer Display - Active DeepFocus Session UI
 * 
 * Large countdown timer with project context and controls.
 * Designed for focused work with minimal distractions.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Square, Pause, Play, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

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
  onPause,
  onResume,
  isLoading = false
}) => {
  const [pulseWarning, setPulseWarning] = useState(false);
  
  // Visual warning when <5 minutes remaining
  useEffect(() => {
    const shouldPulse = timerState.remainingTime <= 300 && timerState.remainingTime > 0;
    setPulseWarning(shouldPulse);
  }, [timerState.remainingTime]);

  // Calculate progress percentage for visual indicator
  const progressPercentage = Math.round(timerState.progress * 100);
  
  // Determine timer text color based on remaining time
  const getTimerColor = () => {
    if (timerState.remainingTime <= 60) return 'text-red-600'; // Last minute
    if (timerState.remainingTime <= 300) return 'text-orange-600'; // Last 5 minutes
    return 'text-[var(--theme-text)]';
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[var(--theme-background)] p-8">
      <div className="max-w-4xl w-full">
        
        {/* Main Timer Card */}
        <Card className="bg-[var(--theme-primary)] border-8 border-black mb-6">
          <CardContent className="text-center py-12 px-8">
            
            {/* Large Countdown */}
            <div className={`text-9xl font-black font-mono mb-6 transition-colors duration-300 ${getTimerColor()} ${
              pulseWarning ? 'animate-pulse' : ''
            }`}>
              {timerState.formattedTime}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-300 h-3 border-2 border-black mb-6">
              <div 
                className="h-full bg-[var(--theme-text)] transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Session Info */}
            <div className="space-y-3 mb-8">
              <p className="font-bold uppercase text-sm text-[var(--theme-text)] opacity-75">
                Working mindfully and monotasking on:
              </p>
              <h3 className="font-black uppercase text-2xl text-[var(--theme-text)]">
                {sessionData.projectName}
              </h3>
              
              {/* Difficulty Quote */}
              <div className="bg-[var(--theme-background)] border-4 border-black p-4 mx-8">
                <p className="text-lg font-black uppercase text-[var(--theme-text)]">
                  DIFFICULTY LEVEL: {timerState.difficultyQuote}
                </p>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex justify-center gap-4">
              {/* Pause/Resume (if supported) */}
              {onPause && onResume && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={timerState.isPaused ? onResume : onPause}
                  disabled={isLoading}
                  className="bg-[var(--theme-background)] text-[var(--theme-text)]"
                >
                  {timerState.isPaused ? (
                    <><Play className="w-5 h-5 mr-2" /> RESUME</>
                  ) : (
                    <><Pause className="w-5 h-5 mr-2" /> PAUSE</>
                  )}
                </Button>
              )}

              {/* Interrupt Button */}
              <Button
                variant="danger"
                size="lg"
                onClick={onInterrupt}
                disabled={isLoading}
                className="bg-red-500 text-white border-4 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000]"
              >
                <Square className="w-5 h-5 mr-2" />
                INTERRUPT SESSION
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Session Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-[var(--theme-accent)] border-4 border-black">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-black font-mono text-[var(--theme-text)]">
                {sessionData.duration}M
              </div>
              <div className="text-xs font-bold uppercase text-[var(--theme-text)] opacity-75">
                Total Duration
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--theme-accent)] border-4 border-black">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-black font-mono text-[var(--theme-text)]">
                {progressPercentage}%
              </div>
              <div className="text-xs font-bold uppercase text-[var(--theme-text)] opacity-75">
                Progress
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--theme-accent)] border-4 border-black">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-black font-mono text-[var(--theme-text)]">
                {sessionData.willpower.toUpperCase()}
              </div>
              <div className="text-xs font-bold uppercase text-[var(--theme-text)] opacity-75">
                Willpower
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warning for last 5 minutes */}
        {timerState.remainingTime <= 300 && timerState.remainingTime > 0 && (
          <Card className="bg-orange-100 border-4 border-orange-400 mt-6">
            <CardContent className="p-4 flex items-center justify-center gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <div className="font-bold text-orange-800">
                <strong>Final stretch!</strong> Less than 5 minutes remaining
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pause State Overlay */}
        {timerState.isPaused && (
          <Card className="bg-yellow-100 border-4 border-yellow-400 mt-6">
            <CardContent className="p-4 text-center">
              <Pause className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
              <div className="font-black uppercase text-yellow-800 mb-1">
                SESSION PAUSED
              </div>
              <div className="text-sm font-bold text-yellow-700">
                Timer is paused. Click RESUME to continue your focus session.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};