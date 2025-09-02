/**
 * Neo-Brutalist Select Component
 * 
 * Dropdown select with brutal styling and theme-aware focus states.
 * Based on native select with custom styling.
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: 'default' | 'mono';
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant = 'default', children, placeholder, ...props }, ref) => {
    const baseClasses = [
      'relative flex h-12 w-full appearance-none px-4 py-2 pr-10',
      'border-4 border-black',
      'bg-white text-black',
      'transition-all duration-100 ease-out',
      
      // Focus states with theme-aware highlights
      'focus:outline-none',
      'focus:shadow-[inset_2px_2px_0px_var(--theme-primary)]',
      'focus:translate-x-[-2px] focus:translate-y-[-2px]',
      
      // Hover state
      'hover:shadow-[6px_6px_0px_#000000]',
      'hover:translate-x-[-1px] hover:translate-y-[-1px]',
      
      // Disabled state
      'disabled:cursor-not-allowed disabled:opacity-50',
      'disabled:hover:shadow-[4px_4px_0px_#000000]',
      'disabled:hover:translate-x-0 disabled:hover:translate-y-0',
    ];

    const variantClasses = {
      default: 'font-bold uppercase tracking-wide',
      mono: 'font-mono font-bold',
    };

    return (
      <div className="relative">
        <select
          className={cn(baseClasses, variantClasses[variant], className)}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-black" />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };