/**
 * CompactGuidance Component
 * 
 * Shows scoring guidance for cost and benefit fields.
 */

import React from 'react';

interface CompactGuidanceProps {
  type: 'cost' | 'benefit';
}

export function CompactGuidance({ type }: CompactGuidanceProps) {
  const guidance = type === 'cost' 
    ? {
        title: 'EFFORT SCORING:',
        ranges: '1-3: Quick wins (<5 hours) • 4-6: Moderate effort (5-20 hours) • 7-10: Major undertaking (>20 hours)'
      }
    : {
        title: 'IMPACT SCORING:', 
        ranges: '1-3: Minor improvement • 4-6: Notable progress • 7-10: Game-changer'
      };
  
  return (
    <div className="bg-[var(--theme-primary)] border-4 border-black shadow-[4px_4px_0px_#000000] mt-2 p-3">
      <div className="text-xs font-bold uppercase tracking-wide text-black/80">
        {guidance.title}
      </div>
      <div className="text-xs font-mono text-black/70 mt-1">
        {guidance.ranges}
      </div>
    </div>
  );
}