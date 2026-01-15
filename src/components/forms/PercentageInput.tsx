import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface PercentageInputProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  className?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
}

export const PercentageInput = ({
  value,
  onChange,
  label,
  placeholder = '0',
  error,
  hint,
  className,
  disabled,
  min = 0,
  max = 100,
}: PercentageInputProps) => {
  const inputId = React.useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange(undefined);
      return;
    }
    const numValue = parseFloat(raw);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          id={inputId}
          value={value ?? ''}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={0.1}
          className={cn(
            'input-field pr-12',
            error && 'border-red-400 focus:border-red-500',
            disabled && 'opacity-50 cursor-not-allowed',
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
          )}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 font-medium">
          %
        </span>
      </div>
      {hint && !error && <p className="mt-1.5 text-sm text-charcoal/50">{hint}</p>}
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
};
