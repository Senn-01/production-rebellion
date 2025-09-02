/**
 * Neo-Brutalist Input Component
 * 
 * Form input with brutal styling and theme-aware focus states.
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'mono';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', type, ...props }, ref) => {
    const baseClasses = [
      'flex h-12 w-full px-4 py-2',
      'border-4 border-black',
      'bg-white text-black',
      'transition-all duration-100 ease-out',
      
      // Focus states with theme-aware highlights
      'focus:outline-none',
      'focus:shadow-[inset_2px_2px_0px_var(--theme-primary)]',
      
      // Disabled state
      'disabled:cursor-not-allowed disabled:opacity-50',
      
      // File input adjustments
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    ];

    const variantClasses = {
      default: 'font-medium',
      mono: 'font-mono',
    };

    return (
      <input
        type={type}
        className={cn(baseClasses, variantClasses[variant], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };