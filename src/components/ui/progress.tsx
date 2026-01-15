import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'sage' | 'gold';
  animated?: boolean;
  className?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      label,
      showPercentage = false,
      size = 'md',
      variant = 'default',
      animated = true,
      className,
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    };

    const variantClasses = {
      default: 'bg-navy',
      sage: 'bg-sage',
      gold: 'bg-gold',
    };

    return (
      <div ref={ref} className={cn('w-full', className)}>
        {(label || showPercentage) && (
          <div className="flex justify-between items-center mb-2">
            {label && <span className="text-sm font-medium text-navy">{label}</span>}
            {showPercentage && (
              <span className="text-sm font-mono text-charcoal/60">{Math.round(percentage)}%</span>
            )}
          </div>
        )}
        <div className={cn('w-full bg-navy/10 rounded-full overflow-hidden', sizeClasses[size])}>
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              variantClasses[variant],
              animated && 'animate-progress-fill'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
