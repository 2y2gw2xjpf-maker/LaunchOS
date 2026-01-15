import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  className?: string;
  disabled?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ value, onChange, options, label, placeholder, error, hint, className, disabled }, ref) => {
    const selectId = React.useId();

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label htmlFor={selectId} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={cn(
              'input-field appearance-none pr-10',
              error && 'border-red-400 focus:border-red-500',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40 pointer-events-none" />
        </div>
        {hint && !error && <p className="mt-1.5 text-sm text-charcoal/50">{hint}</p>}
        {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };
