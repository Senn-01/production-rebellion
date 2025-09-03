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
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface XPGaugeProps {
  className?: string;
  style?: React.CSSProperties;
}

export const XPGauge: React.FC<XPGaugeProps> = ({ className, style }) => {
  const { currentTheme } = useTheme();
  const { data: weeklyXP = 0, isLoading } = useCurrentWeekXP();
  const [displayXP, setDisplayXP] = useState(weeklyXP);
  const [isAnimating, setIsAnimating] = useState(false);

  // Get XP gauge background based on current theme
  const getXPGaugeBackground = () => {
    return currentTheme === 'tactical' ? 'bg-[#f7f7f5]' : 'bg-white';
  };

  // Get XP icon styling based on current theme
  const getXPIconStyling = () => {
    switch (currentTheme) {
      case 'focus':
        return 'text-[var(--theme-text)] fill-[var(--theme-text)]'; // Dark green for focus theme
      case 'analytics':
        return 'text-[#451969] fill-[#451969]'; // Dark purple for analytics theme
      default:
        return 'text-[#FDE047] fill-[#FDE047]'; // Yellow for tactical map
    }
  };

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
      <div 
        className={cn(
          getXPGaugeBackground(),
          'border-4 border-black px-4 py-3',
          'shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 cursor-pointer',
          'flex items-center gap-3',
          className
        )}
        style={style}
      >
        <Zap className={`w-5 h-5 animate-pulse ${getXPIconStyling()}`} />
        <span className="font-mono text-base font-black">---</span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        getXPGaugeBackground(),
        'border-4 border-black px-4 py-3',
        'shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100 cursor-pointer',
        'flex items-center gap-3',
        isAnimating && 'xp-count-up',
        className
      )}
      style={style}
    >
      <Zap 
        className={cn(
          'w-5 h-5',
          getXPIconStyling(),
          isAnimating && 'animate-pulse'
        )} 
      />
      <span 
        className={cn(
          'font-mono text-base font-black uppercase tracking-wider text-black',
          isAnimating && getXPIconStyling()
        )}
        title="Points earned this week from completing projects and focus sessions"
      >
        {displayXP.toLocaleString()}
      </span>
    </div>
  );
};

export default XPGauge;