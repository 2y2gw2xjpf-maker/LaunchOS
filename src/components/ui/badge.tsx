import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'brand' | 'accent' | 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-purple-100 text-purple-700',
      brand: 'bg-purple-50 text-purple-600',
      accent: 'bg-pink-50 text-pink-600',
      primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
      outline: 'bg-transparent border border-purple-200 text-purple-600',
    };

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-base',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-full',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };
