/**
 * Neo-Brutalist Textarea Component
 * 
 * Multiline text input with brutal styling and theme-aware focus states.
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'mono';
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', rows = 3, ...props }, ref) => {
    const baseClasses = [
      'flex min-h-[80px] w-full px-4 py-3',
      'border-4 border-black',
      'bg-white text-black',
      'transition-all duration-100 ease-out',
      'resize-vertical',
      
      // Focus states with theme-aware highlights
      'focus:outline-none',
      'focus:shadow-[inset_2px_2px_0px_var(--theme-primary)]',
      'focus:translate-x-[-1px] focus:translate-y-[-1px]',
      
      // Hover state
      'hover:shadow-[6px_6px_0px_#000000]',
      
      // Disabled state
      'disabled:cursor-not-allowed disabled:opacity-50',
      'disabled:hover:shadow-[4px_4px_0px_#000000]',
      'disabled:hover:translate-x-0 disabled:hover:translate-y-0',
    ];

    const variantClasses = {
      default: 'font-medium',
      mono: 'font-mono',
    };

    return (
      <textarea
        className={cn(baseClasses, variantClasses[variant], className)}
        rows={rows}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };