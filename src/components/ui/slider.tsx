import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  markers?: { value: number; label: string }[];
  className?: string;
  disabled?: boolean;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      value,
      onChange,
      min = 0,
      max = 100,
      step = 1,
      label,
      showValue = true,
      formatValue = (v) => v.toString(),
      markers,
      className,
      disabled,
    },
    ref
  ) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className={cn('w-full', className)}>
        {(label || showValue) && (
          <div className="flex justify-between items-center mb-3">
            {label && <span className="text-sm font-medium text-navy">{label}</span>}
            {showValue && (
              <span className="text-sm font-mono font-semibold text-navy bg-navy/5 px-3 py-1 rounded-lg">
                {formatValue(value)}
              </span>
            )}
          </div>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={disabled}
            className={cn(
              'w-full h-2 bg-navy/10 rounded-full appearance-none cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-navy/20 focus:ring-offset-2',
              '[&::-webkit-slider-thumb]:appearance-none',
              '[&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5',
              '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-navy',
              '[&::-webkit-slider-thumb]:shadow-medium [&::-webkit-slider-thumb]:cursor-pointer',
              '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110',
              '[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5',
              '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-navy',
              '[&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            style={{
              background: `linear-gradient(to right, #0A1628 0%, #0A1628 ${percentage}%, rgba(10, 22, 40, 0.1) ${percentage}%, rgba(10, 22, 40, 0.1) 100%)`,
            }}
          />
        </div>
        {markers && markers.length > 0 && (
          <div className="relative mt-2 h-6">
            {markers.map((marker) => {
              const markerPercentage = ((marker.value - min) / (max - min)) * 100;
              return (
                <div
                  key={marker.value}
                  className="absolute transform -translate-x-1/2 text-xs text-charcoal/50"
                  style={{ left: `${markerPercentage}%` }}
                >
                  {marker.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };
