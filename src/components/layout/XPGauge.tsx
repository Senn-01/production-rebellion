/**
 * XP Gauge Component
 * 
 * Fixed-position XP display with:
 * - Real-time weekly XP updates
 * - Count-up animations on XP earn events
 * - Theme-aware lightning icon
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { useCurrentWeekXP } from '@/hooks/use-xp';
import { cn } from '@/lib/utils';

interface XPGaugeProps {
  className?: string;
}

export const XPGauge: React.FC<XPGaugeProps> = ({ className }) => {
  const { data: weeklyXP = 0, isLoading } = useCurrentWeekXP();
  const [displayXP, setDisplayXP] = useState(weeklyXP);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate XP changes with count-up effect
  useEffect(() => {
    if (weeklyXP !== displayXP) {
      setIsAnimating(true);
      
      // Simple count-up animation
      const difference = weeklyXP - displayXP;
      const steps = Math.min(Math.abs(difference), 20); // Max 20 steps
      const increment = difference / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayXP(weeklyXP);
          setIsAnimating(false);
          clearInterval(timer);
        } else {
          setDisplayXP(prev => Math.round(prev + increment));
        }
      }, 30); // 30ms per step for smooth animation

      return () => clearInterval(timer);
    }
  }, [weeklyXP, displayXP]);

  if (isLoading) {
    return (
      <div className={cn(
        'bg-[var(--theme-accent)] border-4 border-black px-4 py-2',
        'shadow-[4px_4px_0px_#000000]',
        'flex items-center gap-2',
        className
      )}>
        <Zap className="w-5 h-5 animate-pulse" style={{ color: 'var(--theme-primary)' }} />
        <span className="font-mono text-lg">---</span>
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-[var(--theme-accent)] border-4 border-black px-4 py-2',
      'shadow-[4px_4px_0px_#000000]',
      'flex items-center gap-2',
      'transition-all duration-100 hover:shadow-[6px_6px_0px_#000000]',
      'hover:translate-x-[-2px] hover:translate-y-[-2px]',
      'cursor-default',
      isAnimating && 'xp-count-up',
      className
    )}>
      <Zap 
        className={cn(
          'w-5 h-5',
          isAnimating && 'animate-pulse'
        )} 
        style={{ color: 'var(--theme-primary)' }} 
      />
      <span 
        className={cn(
          'font-mono text-lg font-bold',
          isAnimating && 'text-[var(--theme-primary)]'
        )}
        title="Points earned this week from completing projects and focus sessions"
      >
        {displayXP.toLocaleString()}
      </span>
      <span className="text-sm font-bold uppercase tracking-wide opacity-75">
        POINTS
      </span>
    </div>
  );
};

export default XPGauge;