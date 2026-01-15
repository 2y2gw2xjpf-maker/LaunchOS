import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface SliderInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  leftLabel?: string;
  rightLabel?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
  disabled?: boolean;
}

export const SliderInput = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  leftLabel,
  rightLabel,
  showValue = true,
  formatValue = (v) => v.toString(),
  className,
  disabled,
}: SliderInputProps) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium text-charcoal">{label}</span>
          {showValue && (
            <motion.span
              key={value}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="font-mono font-semibold text-brand-700 bg-brand-50 px-4 py-2 rounded-xl"
            >
              {formatValue(value)}
            </motion.span>
          )}
        </div>
      )}

      <div className="relative py-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className={cn(
            'w-full h-3 bg-brand-100 rounded-full appearance-none cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-brand-200 focus:ring-offset-2',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-600',
            '[&::-webkit-slider-thumb]:shadow-medium [&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110',
            '[&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6',
            '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand-600',
            '[&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${percentage}%, rgba(139, 92, 246, 0.2) ${percentage}%, rgba(139, 92, 246, 0.2) 100%)`,
          }}
        />
      </div>

      {(leftLabel || rightLabel) && (
        <div className="flex justify-between mt-2">
          <span className="text-sm text-charcoal/50">{leftLabel}</span>
          <span className="text-sm text-charcoal/50">{rightLabel}</span>
        </div>
      )}
    </div>
  );
};
