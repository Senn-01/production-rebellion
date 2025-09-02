/**
 * CategoryBlock Component
 * 
 * Visual category selector for project categories.
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface CategoryBlockProps {
  value: string;
  label: string;
  description: string;
  isSelected: boolean;
  onSelect: (value: string) => void;
}

export function CategoryBlock({
  value,
  label, 
  description,
  isSelected,
  onSelect
}: CategoryBlockProps) {
  
  const handleClick = () => {
    onSelect(value);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'relative p-4 border-4 border-black transition-all duration-100',
        'hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000]',
        'active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000000]',
        'text-left',
        isSelected 
          ? 'bg-[var(--theme-primary)] shadow-[6px_6px_0px_#000000] translate-x-[-2px] translate-y-[-2px]'
          : 'bg-white shadow-[4px_4px_0px_#000000]'
      )}
    >
      <div className="font-black uppercase tracking-wider text-sm mb-1">
        {label}
      </div>
      <div className="text-xs font-bold uppercase tracking-wide text-black/70">
        {description}
      </div>
      
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-black rounded-full"></div>
        </div>
      )}
    </button>
  );
}