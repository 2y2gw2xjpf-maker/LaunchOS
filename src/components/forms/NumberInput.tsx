import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NumberInputProps {
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
  step?: number;
  suffix?: string;
  showControls?: boolean;
}

export const NumberInput = ({
  value,
  onChange,
  label,
  placeholder = '0',
  error,
  hint,
  className,
  disabled,
  min = 0,
  max,
  step = 1,
  suffix,
  showControls = false,
}: NumberInputProps) => {
  const inputId = React.useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange(undefined);
      return;
    }
    const numValue = parseFloat(raw);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  const increment = () => {
    const newValue = (value || 0) + step;
    if (max === undefined || newValue <= max) {
      onChange(newValue);
    }
  };

  const decrement = () => {
    const newValue = (value || 0) - step;
    if (newValue >= min) {
      onChange(newValue);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {showControls && (
          <button
            type="button"
            onClick={decrement}
            disabled={disabled || (value !== undefined && value <= min)}
            className={cn(
              'p-3 rounded-l-xl border-2 border-r-0 border-brand-100 bg-white',
              'hover:bg-brand-50 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Minus className="w-5 h-5 text-brand-600" />
          </button>
        )}
        <input
          type="number"
          inputMode="numeric"
          id={inputId}
          value={value ?? ''}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={cn(
            'input-field text-center',
            showControls && 'rounded-none',
            suffix && 'pr-12',
            error && 'border-red-400 focus:border-red-500',
            disabled && 'opacity-50 cursor-not-allowed',
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
          )}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 font-medium">
            {suffix}
          </span>
        )}
        {showControls && (
          <button
            type="button"
            onClick={increment}
            disabled={disabled || (max !== undefined && value !== undefined && value >= max)}
            className={cn(
              'p-3 rounded-r-xl border-2 border-l-0 border-brand-100 bg-white',
              'hover:bg-brand-50 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Plus className="w-5 h-5 text-brand-600" />
          </button>
        )}
      </div>
      {hint && !error && <p className="mt-1.5 text-sm text-charcoal/50">{hint}</p>}
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
};
