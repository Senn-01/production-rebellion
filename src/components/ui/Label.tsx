/**
 * Neo-Brutalist Label Component
 * 
 * Form label with brutal typography and accessibility support.
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required = false, ...props }, ref) => {
    return (
      <label
        className={cn(
          'text-base font-black uppercase tracking-wider text-black block mb-2',
          'cursor-pointer',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
    );
  }
);

Label.displayName = 'Label';

export { Label };