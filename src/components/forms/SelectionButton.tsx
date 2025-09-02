/**
 * SelectionButton Component
 * 
 * Radio-style button for single selections (priority, status, confidence).
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface SelectionButtonProps {
  value: string;
  label: string;
  isSelected: boolean;
  onSelect: (value: string) => void;
  className?: string;
}

export function SelectionButton({
  value,
  label,
  isSelected,
  onSelect,
  className
}: SelectionButtonProps) {
  
  const handleClick = () => {
    onSelect(value);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'w-full px-4 py-3 border-4 border-black transition-all duration-100',
        'font-black uppercase tracking-wider text-sm',
        'hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000000]',
        'active:translate-x-[1px] active:translate-y-[1px] active:shadow-[3px_3px_0px_#000000]',
        isSelected 
          ? 'bg-black text-white shadow-[4px_4px_0px_#000000]'
          : 'bg-white text-black shadow-[4px_4px_0px_#000000]',
        className
      )}
    >
      {label}
    </button>
  );
}