/**
 * Navigation Grid Component
 * 
 * Fixed 2x2 grid in bottom-right for page switching.
 * Current page highlighted with theme color, others in grey.
 */

'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Map, Target, BarChart3, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationGridProps {
  className?: string;
}

interface NavQuadrant {
  id: string;
  label: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const NAV_QUADRANTS: NavQuadrant[] = [
  {
    id: 'tactical',
    label: 'MAP',
    route: '/tactical-map',
    icon: Map,
    color: '#FDE047' // Yellow for tactical map
  },
  {
    id: 'focus',
    label: 'FOCUS',
    route: '/deep-focus',
    icon: Target,
    color: '#CFE820' // Light green for focus
  },
  {
    id: 'analytics',
    label: 'DATA',
    route: '/analytics',
    icon: BarChart3,
    color: '#E5B6E5' // Pink for data/analytics
  },
  {
    id: 'prime',
    label: 'PRIME',
    route: '/prime',
    icon: Star,
    color: '#2563EB' // Blue for prime
  }
];

export const NavigationGrid: React.FC<NavigationGridProps> = ({ className }) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (route: string) => {
    return pathname.startsWith(route);
  };

  const handleQuadrantClick = (route: string) => {
    router.push(route);
  };

  // Get correct nav button colors per reference implementation
  const getNavButtonColor = (quadrant: NavQuadrant) => {
    const active = isActive(quadrant.route);
    
    // If not active, use light grey for all pages
    if (!active) {
      return 'bg-[#d1d5db] hover:bg-[#d1d5db]/90 text-black';
    }
    
    // If active, show the page's theme color
    const textColor = quadrant.id === 'prime' ? 'text-white' : 'text-black';
    return `hover:opacity-90 ${textColor}`;
  };

  return (
    <div className={cn(
      'bg-white border-4 border-black p-2',
      'shadow-[4px_4px_0px_#000000]',
      'grid grid-cols-2 grid-rows-2 gap-2',
      className
    )}>
      {NAV_QUADRANTS.map((quadrant) => {
        const active = isActive(quadrant.route);
        const IconComponent = quadrant.icon;
        
        return (
          <button
            key={quadrant.id}
            onClick={() => handleQuadrantClick(quadrant.route)}
            className={cn(
              'border-4 border-black p-2 font-black uppercase tracking-wider text-xs',
              'transition-all duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000] shadow-[4px_4px_0px_#000000] min-w-[48px]',
              getNavButtonColor(quadrant)
            )}
            style={{
              backgroundColor: active ? quadrant.color : '#d1d5db'
            }}
            title={`Go to ${quadrant.label} page`}
          >
            <IconComponent className="w-4 h-4 mx-auto mb-1" />
            {quadrant.label}
          </button>
        );
      })}
    </div>
  );
};

export default NavigationGrid;