/**
 * Neo-Brutalist Button Component
 * 
 * Core button with brutal aesthetics:
 * - 4px black borders, 8px for emphasis
 * - Shadow system with hover/active states  
 * - Uppercase typography
 * - Theme-aware coloring via CSS custom properties
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  emphasis?: 'standard' | 'high'; // Changes border width
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', emphasis = 'standard', children, disabled, ...props }, ref) => {
    const baseClasses = [
      // Typography - always uppercase and bold
      'font-black uppercase tracking-wider',
      
      // Transitions for smooth interactions
      'transition-all duration-100 ease-out',
      
      // Borders (neo-brutal requirement)
      emphasis === 'high' ? 'border-8 border-black' : 'border-4 border-black',
      
      // Shadow system with interaction states
      'shadow-[4px_4px_0px_#000000]',
      'hover:shadow-[6px_6px_0px_#000000]', 
      'hover:translate-x-[-2px] hover:translate-y-[-2px]',
      'active:shadow-[2px_2px_0px_#000000]',
      'active:translate-x-[2px] active:translate-y-[2px]',
      
      // Disabled state
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'disabled:hover:shadow-[4px_4px_0px_#000000]',
      'disabled:hover:translate-x-0 disabled:hover:translate-y-0',
      'disabled:active:translate-x-0 disabled:active:translate-y-0',
    ];

    // Size variants
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-6 py-3 text-base', 
      lg: 'px-8 py-4 text-lg',
    };

    // Color variants (theme-aware via CSS custom properties)
    const variantClasses = {
      primary: [
        'bg-[var(--theme-primary)] text-[var(--theme-text)]',
        'hover:brightness-105',
      ],
      secondary: [
        'bg-white text-black',
        'hover:bg-gray-50',
      ],
      danger: [
        'bg-red-500 text-white',
        'hover:bg-red-600',
      ],
      ghost: [
        'bg-transparent text-[var(--theme-text)] border-[var(--theme-text)]',
        'hover:bg-[var(--theme-text)] hover:text-[var(--theme-background)]',
      ],
    };

    return (
      <button
        className={cn(
          baseClasses,
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        disabled={disabled}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };