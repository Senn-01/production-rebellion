/**
 * Navigation Grid Component
 * 
 * Fixed 2x2 grid in bottom-right for page switching.
 * Current page highlighted with theme color, others in grey.
 */

'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface NavigationGridProps {
  className?: string;
}

interface NavQuadrant {
  id: string;
  label: string;
  route: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const NAV_QUADRANTS: NavQuadrant[] = [
  {
    id: 'tactical',
    label: 'MAP',
    route: '/tactical-map',
    position: 'top-left'
  },
  {
    id: 'focus',
    label: 'FOCUS',
    route: '/deep-focus',
    position: 'top-right'
  },
  {
    id: 'analytics',
    label: 'DATA',
    route: '/analytics',
    position: 'bottom-left'
  },
  {
    id: 'prime',
    label: 'PRIME',
    route: '/prime',
    position: 'bottom-right'
  }
];

export const NavigationGrid: React.FC<NavigationGridProps> = ({ className }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentTheme, themeConfig } = useTheme();

  const isActive = (route: string) => {
    return pathname.startsWith(route);
  };

  const handleQuadrantClick = (route: string) => {
    router.push(route);
  };

  return (
    <div className={cn(
      'bg-white border-4 border-black p-2',
      'shadow-[4px_4px_0px_#000000]',
      'grid grid-cols-2 grid-rows-2 gap-2',
      'w-32 h-32',
      className
    )}>
      {NAV_QUADRANTS.map((quadrant) => {
        const active = isActive(quadrant.route);
        
        return (
          <button
            key={quadrant.id}
            onClick={() => handleQuadrantClick(quadrant.route)}
            className={cn(
              'nav-quadrant',
              'w-12 h-12 border-2 border-black',
              'font-black uppercase text-xs tracking-wider',
              'transition-all duration-100',
              'hover:scale-105 hover:shadow-[2px_2px_0px_#000000]',
              'active:scale-95',
              active && 'active'
            )}
            style={{
              backgroundColor: active ? themeConfig.primary : '#f3f4f6',
              color: active ? themeConfig.text : '#000000'
            }}
            title={`Go to ${quadrant.label} page`}
          >
            {quadrant.label}
          </button>
        );
      })}
    </div>
  );
};

export default NavigationGrid;