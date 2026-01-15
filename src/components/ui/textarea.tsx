import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  hint?: string;
  maxLength?: number;
  showCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, hint, maxLength, showCount, id, value, ...props }, ref) => {
    const textareaId = id || React.useId();
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="label">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            'input-field min-h-[100px] resize-y',
            error && 'border-red-400 focus:border-red-500',
            className
          )}
          ref={ref}
          value={value}
          maxLength={maxLength}
          {...props}
        />
        <div className="flex justify-between mt-1.5">
          <div>
            {hint && !error && <p className="text-sm text-charcoal/50">{hint}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          {showCount && maxLength && (
            <p
              className={cn(
                'text-sm text-charcoal/50',
                currentLength > maxLength * 0.9 && 'text-accent-500',
                currentLength >= maxLength && 'text-red-500'
              )}
            >
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
