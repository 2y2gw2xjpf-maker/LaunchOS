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
  const steps = Math.floor((max - min) / step) + 1;
  const stepMarkers = Array.from({ length: Math.min(steps, 11) }, (_, i) =>
    min + (i * (max - min)) / (Math.min(steps, 11) - 1)
  );

  return (
    <div className={cn('w-full', className)}>
      {/* Value Display */}
      {showValue && (
        <div className="flex justify-center mb-4">
          <motion.div
            key={value}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center min-w-[80px] px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl rounded-2xl shadow-lg shadow-purple-500/30"
          >
            {formatValue(value)}
          </motion.div>
        </div>
      )}

      {/* Slider Track */}
      <div className="relative py-4">
        {/* Background Track */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3 bg-gray-200 rounded-full" />

        {/* Filled Track */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          style={{ width: `${percentage}%` }}
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />

        {/* Step Markers */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-1">
          {stepMarkers.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                percentage >= (i / (stepMarkers.length - 1)) * 100
                  ? "bg-white/60"
                  : "bg-gray-400"
              )}
            />
          ))}
        </div>

        {/* Range Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className={cn(
            'relative w-full h-3 bg-transparent appearance-none cursor-pointer z-10',
            'focus:outline-none',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-white',
            '[&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-purple-500',
            '[&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-purple-500/40',
            '[&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing',
            '[&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110',
            '[&::-webkit-slider-thumb]:hover:border-pink-500',
            '[&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-7',
            '[&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:bg-white',
            '[&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-purple-500',
            '[&::-moz-range-thumb]:shadow-lg',
            '[&::-moz-range-thumb]:cursor-grab',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
      </div>

      {/* Labels */}
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between mt-1 px-1">
          <span className="text-sm font-medium text-gray-500">{leftLabel}</span>
          <span className="text-sm font-medium text-gray-500">{rightLabel}</span>
        </div>
      )}
    </div>
  );
};
