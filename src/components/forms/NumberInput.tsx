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
              'flex items-center justify-center w-14 h-14 rounded-l-2xl',
              'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-r-0 border-purple-200',
              'hover:from-purple-100 hover:to-pink-100 hover:border-purple-300',
              'active:scale-95 transition-all duration-200',
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-purple-50 disabled:hover:to-pink-50'
            )}
          >
            <Minus className="w-5 h-5 text-purple-600" />
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
            'flex-1 h-14 px-4 text-center text-lg font-semibold text-gray-900',
            'bg-white border-2 border-purple-200',
            'focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none',
            'transition-all duration-200',
            showControls ? 'rounded-none border-x-0' : 'rounded-2xl',
            !showControls && suffix && 'pr-16',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
          )}
        />
        {suffix && !showControls && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
            {suffix}
          </span>
        )}
        {showControls && suffix && (
          <span className="flex items-center justify-center h-14 px-4 bg-gradient-to-br from-purple-50 to-pink-50 border-y-2 border-purple-200 text-purple-600 font-semibold text-sm whitespace-nowrap">
            {suffix}
          </span>
        )}
        {showControls && (
          <button
            type="button"
            onClick={increment}
            disabled={disabled || (max !== undefined && value !== undefined && value >= max)}
            className={cn(
              'flex items-center justify-center w-14 h-14 rounded-r-2xl',
              'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-l-0 border-purple-200',
              'hover:from-purple-100 hover:to-pink-100 hover:border-purple-300',
              'active:scale-95 transition-all duration-200',
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-purple-50 disabled:hover:to-pink-50'
            )}
          >
            <Plus className="w-5 h-5 text-purple-600" />
          </button>
        )}
      </div>
      {hint && !error && <p className="mt-2 text-sm text-gray-500">{hint}</p>}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};
