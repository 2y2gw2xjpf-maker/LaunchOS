import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface CurrencyInputProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  currency?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  className?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
}

export const CurrencyInput = ({
  value,
  onChange,
  currency = 'EUR',
  label,
  placeholder = '0',
  error,
  hint,
  className,
  disabled,
  min,
  max,
}: CurrencyInputProps) => {
  const inputId = React.useId();
  const [displayValue, setDisplayValue] = React.useState(
    value ? value.toLocaleString('de-DE') : ''
  );

  const currencySymbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    const numValue = raw ? parseInt(raw, 10) : undefined;

    if (numValue !== undefined) {
      if (min !== undefined && numValue < min) return;
      if (max !== undefined && numValue > max) return;
    }

    setDisplayValue(numValue ? numValue.toLocaleString('de-DE') : '');
    onChange(numValue);
  };

  const handleBlur = () => {
    if (value) {
      setDisplayValue(value.toLocaleString('de-DE'));
    }
  };

  React.useEffect(() => {
    setDisplayValue(value ? value.toLocaleString('de-DE') : '');
  }, [value]);

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          id={inputId}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'input-field pr-12',
            error && 'border-red-400 focus:border-red-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 font-medium">
          {currencySymbol}
        </span>
      </div>
      {hint && !error && <p className="mt-1.5 text-sm text-charcoal/50">{hint}</p>}
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
};
