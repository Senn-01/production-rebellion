'use client';

import React from 'react';
import type { SessionHeatmapData } from '@/services/analytics.service';

interface SessionHeatmapProps {
  data: SessionHeatmapData[] | undefined;
  isLoading: boolean;
  days?: number;
}

// Get intensity color based on session count
function getIntensityColor(sessionCount: number): string {
  if (sessionCount === 0) return 'bg-gray-100';
  if (sessionCount === 1) return 'bg-[var(--theme-accent)] opacity-30';
  if (sessionCount <= 2) return 'bg-[var(--theme-accent)] opacity-60';
  if (sessionCount <= 4) return 'bg-[var(--theme-primary)] opacity-80';
  return 'bg-[var(--theme-primary)]'; // 5+ sessions
}

// Get day label for the grid
function getDayLabel(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { 
    weekday: 'short' 
  }).charAt(0);
}

// Check if date is today
function isToday(date: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return date === today;
}

// Generate past 14 days data structure
function generateDateRange(days: number = 14): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

export function SessionHeatmap({ data, isLoading, days = 14 }: SessionHeatmapProps) {
  const dateRange = generateDateRange(days);
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="w-12 h-12 bg-gray-200 border-2 border-gray-300"
            />
          ))}
        </div>
      </div>
    );
  }

  // Create lookup map for session data
  const sessionMap = new Map<string, SessionHeatmapData>();
  data?.forEach(session => {
    sessionMap.set(session.date, session);
  });

  const hasAnyData = data && data.some(session => session.sessionCount > 0);

  return (
    <div>
      <div className="grid grid-cols-7 gap-2">
        {dateRange.map((date, i) => {
          const sessionData = sessionMap.get(date);
          const sessionCount = sessionData?.sessionCount || 0;
          const intensityColor = getIntensityColor(sessionCount);
          const dayLabel = getDayLabel(date);
          const today = isToday(date);
          const dayOfMonth = new Date(date).getDate();

          return (
            <div
              key={date}
              className={`
                w-12 h-12 border-4 border-black flex flex-col items-center justify-center 
                transition-all duration-200 hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px]
                ${intensityColor}
                ${today ? 'ring-2 ring-[var(--theme-primary)] ring-offset-2' : ''}
              `}
              title={`${date}: ${sessionCount} session${sessionCount !== 1 ? 's' : ''}`}
            >
              <div className="text-xs font-black opacity-75">
                {dayLabel}
              </div>
              <div className="text-xs font-mono font-bold">
                {dayOfMonth}
              </div>
              {sessionCount > 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-full opacity-60"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-4 text-xs opacity-75 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-bold">
            {hasAnyData ? 'Session Activity' : 'No sessions yet'}
          </span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-100 border border-black"></div>
            <span>0</span>
            <div className="w-3 h-3 bg-[var(--theme-accent)] opacity-60 border border-black"></div>
            <span>1-2</span>
            <div className="w-3 h-3 bg-[var(--theme-primary)] border border-black"></div>
            <span>3+</span>
          </div>
        </div>
        {hasAnyData ? (
          <span>
            <span className="font-bold">Ring highlight</span> marks today. 
            Dot indicates sessions completed.
          </span>
        ) : (
          <span>
            Complete your first session to start tracking your consistency! 🎯
          </span>
        )}
      </div>
    </div>
  );
}

export default SessionHeatmap;